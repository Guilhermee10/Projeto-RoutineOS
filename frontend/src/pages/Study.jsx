import { useEffect, useState } from 'react';
import studyService from '../services/studyService';
import goalService from '../services/goalService';
import StudyForm from '../components/StudyForm';
import { formatMinutes, toDateInputValue, formatDateDisplay } from '../utils/format';

function Study() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [studyGoals, setStudyGoals] = useState([]);

  useEffect(() => {
    loadAll();
    goalService
      .list()
      .then((all) => setStudyGoals(all.filter((g) => g.type === 'ESTUDO_HORAS')))
      .catch(() => setStudyGoals([]));
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([studyService.list(), studyService.getStats()])
      .then(([sessionsData, statsData]) => {
        setSessions(sessionsData);
        setStats(statsData);
      })
      .catch(() => setError('Não foi possível carregar as sessões de estudo.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingSession?.id) {
        await studyService.update(editingSession.id, form);
      } else {
        await studyService.create(form);
      }
      setEditingSession(null);
      loadAll();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover essa sessão de estudo?')) return;
    await studyService.remove(id);
    loadAll();
  }

  function openEdit(session) {
    setEditingSession({ ...session, date: toDateInputValue(session.date) });
  }

  return (
    <div>
      <div className="page-header">
        <h1>📚 Estudos</h1>
        {!editingSession && <button onClick={() => setEditingSession({})}>+ Registrar estudo</button>}
      </div>

      {stats && (
        <section className="card">
          <div className="stats-grid">
            <div><span className="muted">Total</span><strong>{formatMinutes(stats.totalMinutes)}</strong></div>
            <div><span className="muted">Sessões</span><strong>{stats.sessionsCount}</strong></div>
          </div>
          {Object.keys(stats.bySubject).length > 0 && (
            <ul className="category-list" style={{ marginTop: '0.8rem' }}>
              {Object.entries(stats.bySubject).map(([subject, minutes]) => (
                <li key={subject}><span>{subject}</span><strong>{formatMinutes(minutes)}</strong></li>
              ))}
            </ul>
          )}
        </section>
      )}

      {editingSession && (
        <StudyForm
          initialValues={editingSession}
          goals={studyGoals}
          onSubmit={handleSubmit}
          onCancel={() => setEditingSession(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && sessions.length === 0 && <p className="muted">Nenhuma sessão de estudo ainda.</p>}

      <ul className="activity-list">
        {sessions.map((session) => (
          <li key={session.id} className="card">
            <div className="activity-info">
              <strong>{session.subject}</strong>
              <span>{formatDateDisplay(session.date)} · {formatMinutes(session.durationMinutes)}</span>
              {session.content && <span className="muted">{session.content}</span>}
              {session.goalId && studyGoals.find((g) => g.id === session.goalId) && (
                <span className="chip chip--accent">🎯 {studyGoals.find((g) => g.id === session.goalId).name}</span>
              )}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => openEdit(session)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(session.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Study;
