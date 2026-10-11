import { useEffect, useState } from 'react';
import workScheduleService from '../services/workScheduleService';
import WorkScheduleForm from '../components/WorkScheduleForm';
import { formatMinutes, formatDateDisplay, DAYS_OF_WEEK } from '../utils/format';

const SCALE_LABELS = { REGULAR: 'Regular', CYCLE: 'Ciclo' };

function WorkSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([workScheduleService.list(), workScheduleService.getHours()])
      .then(([schedulesData, hoursData]) => {
        setSchedules(schedulesData);
        setHours(hoursData);
      })
      .catch(() => setError('Não foi possível carregar a escala de trabalho.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingSchedule?.id) {
        await workScheduleService.update(editingSchedule.id, form);
      } else {
        await workScheduleService.create(form);
      }
      setEditingSchedule(null);
      loadAll();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover essa escala de trabalho?')) return;
    await workScheduleService.remove(id);
    loadAll();
  }

  return (
    <div>
      <div className="page-header">
        <h1>💼 Escala de Trabalho</h1>
        {!editingSchedule && <button onClick={() => setEditingSchedule({})}>+ Nova escala</button>}
      </div>

      {hours && (
        <section className="card stats-grid">
          <div>
            <span className="muted">Horas essa semana ({hours.from} a {hours.to})</span>
            <strong>{hours.totalHours}h</strong>
          </div>
          <div><span className="muted">Dias trabalhados</span><strong>{hours.totalWorkingDays}</strong></div>
        </section>
      )}

      {editingSchedule && (
        <WorkScheduleForm
          initialValues={editingSchedule}
          onSubmit={handleSubmit}
          onCancel={() => setEditingSchedule(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && schedules.length === 0 && <p className="muted">Nenhuma escala cadastrada ainda.</p>}

      <ul className="activity-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="card">
            <div className="activity-info">
              <strong>{SCALE_LABELS[schedule.scaleType]}</strong>
              <span>{schedule.startTime} - {schedule.endTime} ({schedule.breakMinutes}min de intervalo)</span>
              {schedule.scaleType === 'CYCLE' && (
                <span className="muted">
                  {schedule.workDaysInCycle}x trabalho / {schedule.restDaysInCycle}x folga ·
                  início em {formatDateDisplay(schedule.cycleStartDate)}
                </span>
              )}
              {schedule.scaleType === 'CYCLE' && schedule.daysOff?.length > 0 && (
                <span className="muted">
                  Folga fixa: {DAYS_OF_WEEK.filter((d) => schedule.daysOff.includes(d.value)).map((d) => d.label).join(', ')}
                </span>
              )}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => setEditingSchedule(schedule)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(schedule.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkSchedule;
