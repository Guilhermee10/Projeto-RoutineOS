import { useEffect, useState } from 'react';
import flexibleGoalService from '../services/flexibleGoalService';
import FlexibleGoalForm from '../components/FlexibleGoalForm';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../utils/format';

function FlexibleGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  function loadGoals() {
    setLoading(true);
    flexibleGoalService
      .list()
      .then(setGoals)
      .catch(() => setError('Não foi possível carregar as metas flexíveis.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingGoal?.id) {
        await flexibleGoalService.update(editingGoal.id, form);
      } else {
        await flexibleGoalService.create(form);
      }
      setEditingGoal(null);
      loadGoals();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover essa meta flexível?')) return;
    await flexibleGoalService.remove(id);
    loadGoals();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Metas Flexíveis</h1>
        {!editingGoal && <button onClick={() => setEditingGoal({})}>+ Nova meta</button>}
      </div>

      <p className="muted">
        Metas sem horário fixo - o motor de otimização decide onde encaixar na sua semana.
      </p>

      {editingGoal && (
        <FlexibleGoalForm
          initialValues={editingGoal}
          onSubmit={handleSubmit}
          onCancel={() => setEditingGoal(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && goals.length === 0 && <p className="muted">Nenhuma meta flexível cadastrada ainda.</p>}

      <ul className="activity-list">
        {goals.map((goal) => (
          <li key={goal.id} className="card">
            <div className="activity-info">
              <strong>{CATEGORY_ICONS[goal.activityType]} {goal.name}</strong>
              <span className="muted">{CATEGORY_LABELS[goal.activityType]}</span>
              <span>{goal.durationMinutes}min · {goal.frequencyPerWeek}x por semana</span>
              {goal.suitableForCommute && <span className="tag">🚌 compatível com transporte</span>}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => setEditingGoal(goal)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(goal.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FlexibleGoals;
