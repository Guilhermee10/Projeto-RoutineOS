import { useEffect, useState } from 'react';
import goalService from '../services/goalService';
import GoalForm from '../components/GoalForm';
import { GOAL_TYPE_LABELS, GOAL_PERIOD_LABELS, formatMinutes, getTodayDateString } from '../utils/format';

function formatProgressValue(value, unit) {
  return unit === 'minutos' ? formatMinutes(value) : `${value} ${unit}`;
}

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actingOnId, setActingOnId] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  function loadGoals() {
    setLoading(true);
    goalService
      .list()
      .then(setGoals)
      .catch(() => setError('Não foi possível carregar as metas.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingGoal?.id) {
        await goalService.update(editingGoal.id, form);
      } else {
        await goalService.create(form);
      }
      setEditingGoal(null);
      loadGoals();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover essa meta?')) return;
    await goalService.remove(id);
    loadGoals();
  }

  async function handleReset(goal) {
    const ok = window.confirm(
      `Zerar o progresso de "${goal.name}"? Seus registros de estudo/treino/sono NÃO são apagados - a meta só volta a 0 e passa a contar a partir de agora.`
    );
    if (!ok) return;
    setActingOnId(goal.id);
    try {
      await goalService.resetProgress(goal.id);
      loadGoals();
    } finally {
      setActingOnId(null);
    }
  }

  async function handleProgress(id, increment) {
    setActingOnId(id);
    try {
      await goalService.registerProgress(id, increment);
      loadGoals();
    } finally {
      setActingOnId(null);
    }
  }

  async function handleToggleCheckIn(goal) {
    const nextCompleted = !goal.checkedInToday;
    setActingOnId(goal.id);

    // Atualização otimista, igual fizemos no check-in de atividades
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, checkedInToday: nextCompleted } : g))
    );

    try {
      await goalService.checkin(goal.id, getTodayDateString(), nextCompleted);
    } catch {
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, checkedInToday: !nextCompleted } : g))
      );
    } finally {
      setActingOnId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🎯 Metas</h1>
        {!editingGoal && <button onClick={() => setEditingGoal({})}>+ Nova meta</button>}
      </div>

      {editingGoal && (
        <GoalForm
          initialValues={editingGoal}
          onSubmit={handleSubmit}
          onCancel={() => setEditingGoal(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && goals.length === 0 && <p className="muted">Nenhuma meta cadastrada ainda.</p>}

      <ul className="activity-list">
        {goals.map((goal) => (
          <li key={goal.id} className="card">
            <div className="activity-info" style={{ flex: 1 }}>
              <div className="goal-title-row">
                <strong className={goal.checkedInToday ? 'agenda-item-done' : ''}>{goal.name}</strong>
                <label className="checkin-toggle" title="Marcar como feito hoje">
                  <input
                    type="checkbox"
                    checked={goal.checkedInToday}
                    disabled={actingOnId === goal.id}
                    onChange={() => handleToggleCheckIn(goal)}
                  />
                  <span className="muted" style={{ fontSize: '0.8rem' }}>feito hoje</span>
                </label>
              </div>
              <span className="muted">
                {GOAL_TYPE_LABELS[goal.type]}{goal.type === 'ESTUDO_HORAS' ? ' · conta só estudos vinculados' : goal.type === 'TREINO_QUANTIDADE' ? ' · conta só treinos vinculados' : ''} · {GOAL_PERIOD_LABELS[goal.period]}
              </span>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${goal.progress.percentage}%` }}
                />
              </div>
              <span className="muted">
                {formatProgressValue(goal.progress.current, goal.progress.unit)} / {formatProgressValue(goal.progress.target, goal.progress.unit)}
                {' '}({goal.progress.percentage}%)
              </span>

              {goal.type === 'PERSONALIZADA' && (
                <div className="activity-actions" style={{ marginTop: '0.4rem' }}>
                  <button className="btn-ghost" disabled={actingOnId === goal.id} onClick={() => handleProgress(goal.id, -1)}>-1</button>
                  <button className="btn-ghost" disabled={actingOnId === goal.id} onClick={() => handleProgress(goal.id, 1)}>+1</button>
                </div>
              )}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" disabled={actingOnId === goal.id} onClick={() => handleReset(goal)} title="Volta o progresso a 0 (não apaga seus registros)">Zerar</button>
              <button className="btn-ghost" onClick={() => setEditingGoal(goal)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(goal.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Goals;
