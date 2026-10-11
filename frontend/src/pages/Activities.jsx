import { useEffect, useState } from 'react';
import activityService from '../services/activityService';
import ActivityForm from '../components/ActivityForm';
import { CATEGORY_LABELS, CATEGORY_ICONS, DAYS_OF_WEEK } from '../utils/format';

function formatDays(daysOfWeek) {
  return daysOfWeek
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
    .join(', ');
}

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingActivity, setEditingActivity] = useState(null); // null = fechado, {} = criando, {...} = editando
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  function loadActivities() {
    setLoading(true);
    activityService
      .list()
      .then(setActivities)
      .catch(() => setError('Não foi possível carregar as atividades.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingActivity?.id) {
        await activityService.update(editingActivity.id, form);
      } else {
        await activityService.create(form);
      }
      setEditingActivity(null);
      loadActivities();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover essa atividade?')) return;
    await activityService.remove(id);
    loadActivities();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Atividades</h1>
        {!editingActivity && (
          <button onClick={() => setEditingActivity({})}>+ Nova atividade</button>
        )}
      </div>

      {editingActivity && (
        <ActivityForm
          initialValues={editingActivity}
          onSubmit={handleSubmit}
          onCancel={() => setEditingActivity(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}

      {!loading && activities.length === 0 && (
        <p className="muted">Nenhuma atividade cadastrada ainda.</p>
      )}

      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={activity.id} className="card">
            <div className="activity-info">
              <strong>{CATEGORY_ICONS[activity.category]} {activity.name}</strong>
              <span className="muted">{CATEGORY_LABELS[activity.category]}</span>
              <span>{activity.startTime} - {activity.endTime}</span>
              <span className="muted">{formatDays(activity.daysOfWeek)}</span>
              {activity.commuteMinutes > 0 && (
                <span className="tag">🚌 {activity.commuteMinutes}min de deslocamento</span>
              )}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => setEditingActivity(activity)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(activity.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Activities;
