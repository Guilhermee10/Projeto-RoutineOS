import { useState } from 'react';

const EMPTY_FORM = {
  date: '',
  type: '',
  durationMinutes: '',
  objective: '',
  notes: '',
  goalId: '',
};

function WorkoutForm({ initialValues, goals = [], onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        date: form.date,
        type: form.type,
        durationMinutes: Number(form.durationMinutes),
        objective: form.objective,
        notes: form.notes,
        goalId: form.goalId || null,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar treino.');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <label>
        Data
        <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} required />
      </label>

      <div className="form-row">
        <label>
          Tipo de treino
          <input
            value={form.type}
            onChange={(e) => updateField('type', e.target.value)}
            placeholder="Ex: Musculação, Corrida"
            required
          />
        </label>
        <label>
          Duração (min)
          <input type="number" min="1" value={form.durationMinutes} onChange={(e) => updateField('durationMinutes', e.target.value)} required />
        </label>
      </div>

      <label>
        Objetivo (opcional)
        <input value={form.objective} onChange={(e) => updateField('objective', e.target.value)} />
      </label>

      <label>
        Contar para uma meta (opcional)
        <select value={form.goalId || ''} onChange={(e) => updateField('goalId', e.target.value)}>
          <option value="">Nenhuma - não conta para meta</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>{goal.name}</option>
          ))}
        </select>
      </label>

      <label>
        Observações (opcional)
        <input value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default WorkoutForm;
