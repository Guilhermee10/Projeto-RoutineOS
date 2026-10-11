import { useState } from 'react';
import { GOAL_TYPE_LABELS, GOAL_PERIOD_LABELS } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  type: 'ESTUDO_HORAS',
  subject: '',
  targetValue: '',
  period: 'SEMANAL',
};

const IS_MINUTES_TYPE = (type) => type === 'ESTUDO_HORAS' || type === 'SONO_HORAS';

function GoalForm({ initialValues, onSubmit, onCancel, submitting }) {
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
        type: form.type,
        period: form.period,
        targetValue: Number(form.targetValue),
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
        <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ex: Python" required />
      </label>

      <label>
        Tipo
        <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
          {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      {form.type === 'ESTUDO_HORAS' && (
        <p className="muted">
          Essa meta só soma os estudos que você vincular a ela ao registrar a sessão em Estudos.
        </p>
      )}
      {form.type === 'TREINO_QUANTIDADE' && (
        <p className="muted">
          Essa meta só conta os treinos que você vincular a ela ao registrar o treino em Treinos.
        </p>
      )}

      <div className="form-row">
        <label>
          {IS_MINUTES_TYPE(form.type) ? 'Meta (minutos)' : 'Meta (quantidade)'}
          <input
            type="number"
            min="1"
            value={form.targetValue}
            onChange={(e) => updateField('targetValue', e.target.value)}
            required
          />
        </label>
        <label>
          Período
          <select value={form.period} onChange={(e) => updateField('period', e.target.value)}>
            {Object.entries(GOAL_PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default GoalForm;
