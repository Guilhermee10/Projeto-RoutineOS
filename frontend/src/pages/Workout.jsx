import { useEffect, useState } from 'react';
import workoutService from '../services/workoutService';
import goalService from '../services/goalService';
import WorkoutForm from '../components/WorkoutForm';
import { formatMinutes, toDateInputValue, formatDateDisplay } from '../utils/format';

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [workoutGoals, setWorkoutGoals] = useState([]);

  useEffect(() => {
    loadAll();
    goalService
      .list()
      .then((all) => setWorkoutGoals(all.filter((g) => g.type === 'TREINO_QUANTIDADE')))
      .catch(() => setWorkoutGoals([]));
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([workoutService.list(), workoutService.getStats()])
      .then(([workoutsData, statsData]) => {
        setWorkouts(workoutsData);
        setStats(statsData);
      })
      .catch(() => setError('Não foi possível carregar os treinos.'))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editingWorkout?.id) {
        await workoutService.update(editingWorkout.id, form);
      } else {
        await workoutService.create(form);
      }
      setEditingWorkout(null);
      loadAll();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esse treino?')) return;
    await workoutService.remove(id);
    loadAll();
  }

  function openEdit(workout) {
    setEditingWorkout({ ...workout, date: toDateInputValue(workout.date) });
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏋️ Treinos</h1>
        {!editingWorkout && <button onClick={() => setEditingWorkout({})}>+ Registrar treino</button>}
      </div>

      {stats && (
        <section className="card">
          <div className="stats-grid">
            <div><span className="muted">Total</span><strong>{formatMinutes(stats.totalMinutes)}</strong></div>
            <div><span className="muted">Treinos</span><strong>{stats.totalWorkouts}</strong></div>
            <div><span className="muted">Média/semana</span><strong>{stats.averagePerWeek}</strong></div>
          </div>
          {Object.keys(stats.byType).length > 0 && (
            <ul className="category-list" style={{ marginTop: '0.8rem' }}>
              {Object.entries(stats.byType).map(([type, count]) => (
                <li key={type}><span>{type}</span><strong>{count}x</strong></li>
              ))}
            </ul>
          )}
        </section>
      )}

      {editingWorkout && (
        <WorkoutForm
          initialValues={editingWorkout}
          goals={workoutGoals}
          onSubmit={handleSubmit}
          onCancel={() => setEditingWorkout(null)}
          submitting={submitting}
        />
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && workouts.length === 0 && <p className="muted">Nenhum treino registrado ainda.</p>}

      <ul className="activity-list">
        {workouts.map((workout) => (
          <li key={workout.id} className="card">
            <div className="activity-info">
              <strong>{workout.type}</strong>
              <span>{formatDateDisplay(workout.date)} · {formatMinutes(workout.durationMinutes)}</span>
              {workout.objective && <span className="muted">{workout.objective}</span>}
              {workout.goalId && workoutGoals.find((g) => g.id === workout.goalId) && (
                <span className="chip chip--accent">🎯 {workoutGoals.find((g) => g.id === workout.goalId).name}</span>
              )}
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => openEdit(workout)}>Editar</button>
              <button className="btn-ghost" onClick={() => handleDelete(workout.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Workout;
