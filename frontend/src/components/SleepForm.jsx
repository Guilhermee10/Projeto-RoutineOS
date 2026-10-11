import { useState } from 'react';

const EMPTY_FORM = {
  date: '',
  wentToSleepAt: '',
  wokeUpAt: '',
  interruptions: 0,
  quality: '',
  notes: '',
};

const QUALITY_LABELS = { RUIM: 'Ruim', REGULAR: 'Regular', BOA: 'Boa', OTIMA: 'Ótima' };

function SleepForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      // Payload explícito (nunca ...form): em edição, o form nasce de um
      // registro vindo da API, com campos extras (id, durationMinutes...)
      await onSubmit({
        date: form.date,
        wentToSleepAt: form.wentToSleepAt,
        wokeUpAt: form.wokeUpAt,
        interruptions: Number(form.interruptions) || 0,
        quality: form.quality || undefined,
        notes: form.notes,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar registro de sono.');
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
          Foi dormir
          <input type="time" value={form.wentToSleepAt} onChange={(e) => updateField('wentToSleepAt', e.target.value)} required />
        </label>
        <label>
          Acordou
          <input type="time" value={form.wokeUpAt} onChange={(e) => updateField('wokeUpAt', e.target.value)} required />
        </label>
      </div>

      <div className="form-row">
        <label>
          Interrupções
          <input type="number" min="0" value={form.interruptions} onChange={(e) => updateField('interruptions', e.target.value)} />
        </label>
        <label>
          Qualidade
          <select value={form.quality} onChange={(e) => updateField('quality', e.target.value)}>
            <option value="">Não informar</option>
            {Object.entries(QUALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

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

export default SleepForm;
