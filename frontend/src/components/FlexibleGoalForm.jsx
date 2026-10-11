import { useState } from 'react';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  durationMinutes: '',
  frequencyPerWeek: '',
  activityType: 'ESTUDO',
  fitMode: 'MANUAL',
  priority: 'MEDIA',
  suitableForCommute: false,
};

const FIT_MODE_LABELS = {
  MANUAL: 'Manual (confirmo uma por uma)',
  AUTO: 'Automático (revejo a semana toda de uma vez)',
};

function FlexibleGoalForm({ initialValues, onSubmit, onCancel, submitting }) {
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
        name: form.name,
        durationMinutes: Number(form.durationMinutes),
        frequencyPerWeek: Number(form.frequencyPerWeek),
        activityType: form.activityType,
        fitMode: form.fitMode,
        priority: form.priority,
        suitableForCommute: form.suitableForCommute,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar meta.');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <label>
        Nome da meta
        <input
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex: Inglês"
          required
        />
      </label>

      <div className="form-row">
        <label>
          Duração por sessão (min)
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(e) => updateField('durationMinutes', e.target.value)}
            required
          />
        </label>
        <label>
          Vezes por semana
          <input
            type="number"
            min="1"
            max="7"
            value={form.frequencyPerWeek}
            onChange={(e) => updateField('frequencyPerWeek', e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Categoria
        <select value={form.activityType} onChange={(e) => updateField('activityType', e.target.value)}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label>
        Prioridade
        <select value={form.priority} onChange={(e) => updateField('priority', e.target.value)}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label>
        Como encaixar
        <select value={form.fitMode} onChange={(e) => updateField('fitMode', e.target.value)}>
          {Object.entries(FIT_MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.suitableForCommute}
          onChange={(e) => updateField('suitableForCommute', e.target.checked)}
        />
        Pode ser feita durante o transporte (ex: inglês, revisão, podcast)
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default FlexibleGoalForm;
