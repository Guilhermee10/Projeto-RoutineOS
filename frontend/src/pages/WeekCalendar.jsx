import { useEffect, useState } from 'react';
import calendarService from '../services/calendarService';
import { getWeekDates, DAYS_OF_WEEK, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/format';

const CALENDAR_START_MINUTES = 6 * 60; // 06:00 - mesma janela (WAKING_WINDOW) usada no resto do app
const CALENDAR_END_MINUTES = 23 * 60; // 23:00
const HOUR_HEIGHT_PX = 48;
const CALENDAR_HEIGHT_PX = ((CALENDAR_END_MINUTES - CALENDAR_START_MINUTES) / 60) * HOUR_HEIGHT_PX;

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Converte horário em posição/altura dentro da grade, já recortando
// (clamp) o que passar da janela 06:00-23:00 pra não quebrar o layout.
function blockStyle(startTime, endTime, category) {
  const start = Math.max(timeToMinutes(startTime), CALENDAR_START_MINUTES);
  const end = Math.min(timeToMinutes(endTime), CALENDAR_END_MINUTES);
  const top = ((start - CALENDAR_START_MINUTES) / 60) * HOUR_HEIGHT_PX;
  const height = Math.max(((end - start) / 60) * HOUR_HEIGHT_PX, 16); // altura mínima pra não sumir

  return {
    top: `${top}px`,
    height: `${height}px`,
    background: CATEGORY_COLORS[category] || CATEGORY_COLORS.OUTROS,
  };
}

const HOUR_MARKS = Array.from(
  { length: CALENDAR_END_MINUTES / 60 - CALENDAR_START_MINUTES / 60 + 1 },
  (_, i) => CALENDAR_START_MINUTES / 60 + i
);

function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    calendarService
      .getWeekly(weekDates[0])
      .then((data) => {
        if (!cancelled) setCalendar(data);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar o calendário.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  const weekLabel = `${weekDates[0].slice(8, 10)}/${weekDates[0].slice(5, 7)} - ${weekDates[6].slice(8, 10)}/${weekDates[6].slice(5, 7)}`;

  return (
    <div>
      <div className="page-header">
        <h1>🗓️ Calendário</h1>
        <div className="week-nav">
          <button className="btn-ghost" onClick={() => setWeekOffset((w) => w - 1)}>← Semana anterior</button>
          <span className="muted">{weekLabel}</span>
          <button className="btn-ghost" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Hoje</button>
          <button className="btn-ghost" onClick={() => setWeekOffset((w) => w + 1)}>Próxima semana →</button>
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}

      {!loading && calendar && (
        <div className="card calendar-wrapper">
          <div className="calendar-grid">
            <div className="calendar-gutter">
              <div className="calendar-day-header">&nbsp;</div>
              <div className="calendar-gutter-body" style={{ height: CALENDAR_HEIGHT_PX }}>
                {HOUR_MARKS.map((hour) => (
                  <div key={hour} className="calendar-hour-label" style={{ top: (hour - CALENDAR_START_MINUTES / 60) * HOUR_HEIGHT_PX }}>
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {calendar.days.map((day) => (
              <div key={day.date} className="calendar-day-column">
                <div className="calendar-day-header">
                  {DAYS_OF_WEEK.find((d) => d.value === day.dayOfWeek)?.label}
                  <br />
                  <span className="muted" style={{ fontWeight: 400 }}>{day.date.slice(8, 10)}</span>
                </div>
                <div className="calendar-day-body" style={{ height: CALENDAR_HEIGHT_PX }}>
                  {HOUR_MARKS.map((hour) => (
                    <div
                      key={hour}
                      className="calendar-hour-line"
                      style={{ top: (hour - CALENDAR_START_MINUTES / 60) * HOUR_HEIGHT_PX }}
                    />
                  ))}
                  {day.blocks.map((block) => (
                    <div
                      key={block.id}
                      className="calendar-block"
                      style={blockStyle(block.startTime, block.endTime, block.category)}
                      title={`${block.name} · ${block.startTime}-${block.endTime}`}
                    >
                      {CATEGORY_ICONS[block.category]} {block.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeekCalendar;
