import { useState } from 'react';
import { DAYS_OF_WEEK, toDateInputValue } from '../utils/format';

const EMPTY_FORM = {
  scaleType: 'REGULAR',
  startTime: '',
  endTime: '',
  breakMinutes: 0,
  daysOfWeek: [],
  cycleStartDate: '',
  workDaysInCycle: '',
  restDaysInCycle: '',
  daysOff: [],
  notes: '',
};

// Atalhos pra escalas conhecidas - preenche os campos de ciclo
// automaticamente, mas o usuário pode ajustar manualmente depois.
const CYCLE_PRESETS = [
  { label: '12x36', workDaysInCycle: 1, restDaysInCycle: 1 },
  { label: '15x2', workDaysInCycle: 15, restDaysInCycle: 2 },
];

function WorkScheduleForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...initialValues,
    cycleStartDate: toDateInputValue(initialValues?.cycleStartDate),
    daysOff: initialValues?.daysOff || [],
  });
  const [error, setError] = useState('');
  // modo trabalho: marco os dias que trabalho; modo folga: marco os dias de folga.
  // Nos dois casos o que vai pro backend é a lista de dias trabalhados
  // (daysOfWeek) - no modo folga a gente só inverte a seleção na tela.
  const [pickMode, setPickMode] = useState('work');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const daysOff = DAYS_OF_WEEK.map((d) => d.value).filter((d) => !form.daysOfWeek.includes(d));

  function toggleDay(day) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  }

  function toggleDayOff(day) {
    setForm((prev) => ({
      ...prev,
      daysOff: prev.daysOff.includes(day) ? prev.daysOff.filter((d) => d !== day) : [...prev.daysOff, day].sort(),
    }));
  }

  function applyPreset(preset) {
    setForm((prev) => ({
      ...prev,
      workDaysInCycle: preset.workDaysInCycle,
      restDaysInCycle: preset.restDaysInCycle,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const payload = {
      scaleType: form.scaleType,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: Number(form.breakMinutes) || 0,
      notes: form.notes,
      ...(form.scaleType === 'REGULAR'
        ? { daysOfWeek: form.daysOfWeek }
        : {
            cycleStartDate: form.cycleStartDate,
            workDaysInCycle: Number(form.workDaysInCycle),
            restDaysInCycle: Number(form.restDaysInCycle),
            daysOff: form.daysOff,
          }),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar escala de trabalho.');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <label>
        Tipo de escala
        <select value={form.scaleType} onChange={(e) => updateField('scaleType', e.target.value)}>
          <option value="REGULAR">Regular (dias fixos da semana)</option>
          <option value="CYCLE">Ciclo (ex: 12x36, 15x2)</option>
        </select>
      </label>

      <div className="form-row">
        <label>
          Início do turno
          <input type="time" value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} required />
        </label>
        <label>
          Fim do turno
          <input type="time" value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} required />
        </label>
        <label>
          Intervalo (min)
          <input type="number" min="0" value={form.breakMinutes} onChange={(e) => updateField('breakMinutes', e.target.value)} />
        </label>
      </div>

      {form.scaleType === 'REGULAR' ? (
        <div className="field-group">
          <div className="days-picker">
            <button
              type="button"
              className={pickMode === 'work' ? 'day-chip active' : 'day-chip'}
              onClick={() => setPickMode('work')}
            >
              Escolher dias de trabalho
            </button>
            <button
              type="button"
              className={pickMode === 'off' ? 'day-chip active' : 'day-chip'}
              onClick={() => setPickMode('off')}
            >
              Escolher dias de folga
            </button>
          </div>

          <span>{pickMode === 'work' ? 'Dias em que você trabalha' : 'Dias de folga (todos os outros você trabalha)'}</span>
          <div className="days-picker">
            {DAYS_OF_WEEK.map((day) => {
              const isWork = form.daysOfWeek.includes(day.value);
              const selected = pickMode === 'work' ? isWork : !isWork;
              return (
                <button
                  type="button"
                  key={day.value}
                  className={selected ? 'day-chip active' : 'day-chip'}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <p className="muted">
            Trabalha: {form.daysOfWeek.length ? DAYS_OF_WEEK.filter((d) => form.daysOfWeek.includes(d.value)).map((d) => d.label).join(', ') : 'nenhum dia'}
            {' · '}
            Folga: {daysOff.length ? DAYS_OF_WEEK.filter((d) => daysOff.includes(d.value)).map((d) => d.label).join(', ') : 'nenhuma'}
          </p>
        </div>
      ) : (
        <>
          <div className="days-picker">
            {CYCLE_PRESETS.map((preset) => (
              <button type="button" key={preset.label} className="day-chip" onClick={() => applyPreset(preset)}>
                Usar {preset.label}
              </button>
            ))}
          </div>

          <label>
            Data de início do ciclo (um dia de trabalho)
            <input
              type="date"
              value={form.cycleStartDate}
              onChange={(e) => updateField('cycleStartDate', e.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Dias trabalhando
              <input
                type="number"
                min="1"
                value={form.workDaysInCycle}
                onChange={(e) => updateField('workDaysInCycle', e.target.value)}
                required
              />
            </label>
            <label>
              Dias de folga
              <input
                type="number"
                min="0"
                value={form.restDaysInCycle}
                onChange={(e) => updateField('restDaysInCycle', e.target.value)}
                required
              />
            </label>
          </div>

          <div className="field-group">
            <span>Folgas fixas na semana (opcional)</span>
            <div className="days-picker">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  type="button"
                  key={day.value}
                  className={form.daysOff.includes(day.value) ? 'day-chip active' : 'day-chip'}
                  onClick={() => toggleDayOff(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="muted">
              Nesses dias da semana você não trabalha, mesmo que o ciclo marque trabalho.
              {form.daysOff.length > 0 &&
                ` Folga fixa: ${DAYS_OF_WEEK.filter((d) => form.daysOff.includes(d.value)).map((d) => d.label).join(', ')}.`}
            </p>
          </div>
        </>
      )}

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

export default WorkScheduleForm;
