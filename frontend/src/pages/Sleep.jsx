import { useEffect, useState } from 'react';
import sleepService from '../services/sleepService';
import SleepForm from '../components/SleepForm';
import { formatMinutes, toDateInputValue, formatDateDisplay } from '../utils/format';

const QUALITY_LABELS = { RUIM: 'Ruim', REGULAR: 'Regular', BOA: 'Boa', OTIMA: 'Ótima' };

function Sleep() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([sleepService.list(), sleepService.getStats()])
      .then(([recordsData, statsData]) => {
        setRecords(recordsData);
        setStats(statsData);
      })
      .catch(() => setError('Não foi possível carregar os registros de sono.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingRecord?.id) {
        await sleepService.update(editingRecord.id, form);
      } else {
        await sleepService.create(form);
      }
      setEditingRecord(null);
      loadAll();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esse registro de sono?')) return;
    await sleepService.remove(id);
    loadAll();
  }

  function openEdit(record) {
    setEditingRecord({ ...record, date: toDateInputValue(record.date) });
  }

  return (
    <div>
      <div className="page-header">
        <h1>😴 Sono</h1>
        {!editingRecord && <button onClick={() => setEditingRecord({})}>+ Registrar sono</button>}
      </div>

      {stats && (
        <section className="card stats-grid">
          <div><span className="muted">Média</span><strong>{formatMinutes(stats.averageMinutes)}</strong></div>
          <div><span className="muted">Mínimo</span><strong>{formatMinutes(stats.minMinutes)}</strong></div>
          <div><span className="muted">Máximo</span><strong>{formatMinutes(stats.maxMinutes)}</strong></div>
          <div>
            <span className="muted">Vs. meta ({formatMinutes(stats.goalMinutes)})</span>
            <strong className={stats.diffFromGoalMinutes < 0 ? 'text-warning' : 'text-success'}>
              {stats.diffFromGoalMinutes >= 0 ? '+' : ''}{formatMinutes(Math.abs(stats.diffFromGoalMinutes))}
            </strong>
          </div>
        </section>
      )}

      {editingRecord && (
        <SleepForm
          initialValues={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => setEditingRecord(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && records.length === 0 && <p className="muted">Nenhum registro de sono ainda.</p>}

      <ul className="activity-list">
        {records.map((record) => (
          <li key={record.id} className="card">
            <div className="activity-info">
              <strong>{formatDateDisplay(record.date)}</strong>
              <span>{record.wentToSleepAt} → {record.wokeUpAt} ({formatMinutes(record.durationMinutes)})</span>
              <span className="muted">
                {record.quality ? QUALITY_LABELS[record.quality] : 'Sem avaliação'}
                {record.interruptions > 0 && ` · ${record.interruptions} interrupção(ões)`}
              </span>
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => openEdit(record)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(record.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sleep;
