import { useState } from 'react';
import { CATEGORY_LABELS, PRIORITY_LABELS, DAYS_OF_WEEK } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  category: 'OUTROS',
  startTime: '',
  endTime: '',
  daysOfWeek: [],
  priority: 'MEDIA',
  location: '',
  notes: '',
  commuteMinutes: '',
};

function ActivityForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...initialValues,
    // o backend manda null quando não há deslocamento cadastrado; o
    // input numérico controlado precisa de string vazia, não null.
    commuteMinutes: initialValues?.commuteMinutes ?? '',
  });
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.daysOfWeek.length === 0) {
      setError('Selecione ao menos um dia da semana.');
      return;
    }
    try {
      // Envia só os campos editáveis, explicitamente - nunca ...form
      // inteiro. initialValues pode vir com campos "extras" (id,
      // createdAt, durationMinutes calculado etc) quando é uma edição;
      // espalhar o form todo mandaria esse lixo de volta pro backend.
      await onSubmit({
        name: form.name,
        category: form.category,
        startTime: form.startTime,
        endTime: form.endTime,
        daysOfWeek: form.daysOfWeek,
        priority: form.priority,
        location: form.location,
        notes: form.notes,
        commuteMinutes: form.commuteMinutes === '' ? null : Number(form.commuteMinutes),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar atividade.');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <label>
        Nome
        <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
      </label>

      <label>
        Categoria
        <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label>
          Início
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => updateField('startTime', e.target.value)}
            required
          />
        </label>
        <label>
          Fim
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => updateField('endTime', e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Dias da semana
        <div className="days-picker">
          {DAYS_OF_WEEK.map((day) => (
            <button
              type="button"
              key={day.value}
              className={form.daysOfWeek.includes(day.value) ? 'day-chip active' : 'day-chip'}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
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
        Local (opcional)
        <input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
      </label>

      <label>
        🚌 Tempo de deslocamento até aqui, em minutos (opcional)
        <input
          type="number"
          min="0"
          value={form.commuteMinutes}
          onChange={(e) => updateField('commuteMinutes', e.target.value)}
          placeholder="Ex: 20"
        />
      </label>
      {form.commuteMinutes !== '' && Number(form.commuteMinutes) > 0 && (
        <p className="muted" style={{ marginTop: '-0.6rem' }}>
          Vai gerar um bloco de transporte automático antes e depois dessa atividade.
        </p>
      )}

      <label>
        Observações (opcional)
        <input value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ActivityForm;
