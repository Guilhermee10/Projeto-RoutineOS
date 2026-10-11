import { useEffect, useState } from 'react';
import activityService from '../services/activityService';
import { getWeekDates, DAYS_OF_WEEK, CATEGORY_ICONS } from '../utils/format';

function dayOfWeekOf(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

function dayNumberOf(dateStr) {
  return dateStr.slice(8, 10);
}

function checkInKey(activityId, dateStr) {
  return `${activityId}|${dateStr}`;
}

// Componente autocontido (busca os próprios dados) pra poder ser
// solto tanto na página /habits quanto embutido no Dashboard, sem
// precisar duplicar a lógica de fetch/estado em dois lugares.
function HabitWeekGrid() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activities, setActivities] = useState([]);
  const [checkedSet, setCheckedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingKey, setTogglingKey] = useState(null);

  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      activityService.list(),
      activityService.listCheckIns(weekDates[0], weekDates[6]),
    ])
      .then(([activitiesData, checkInsData]) => {
        if (cancelled) return;
        setActivities(activitiesData);
        setCheckedSet(
          new Set(checkInsData.map((c) => checkInKey(c.activityId, c.date.slice(0, 10))))
        );
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar a grade de hábitos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function handleToggle(activity, dateStr) {
    const key = checkInKey(activity.id, dateStr);
    const nextChecked = !checkedSet.has(key);
    setTogglingKey(key);

    setCheckedSet((prev) => {
      const next = new Set(prev);
      if (nextChecked) next.add(key);
      else next.delete(key);
      return next;
    });

    try {
      await activityService.checkin(activity.id, dateStr, nextChecked);
    } catch {
      setCheckedSet((prev) => {
        const next = new Set(prev);
        if (nextChecked) next.delete(key);
        else next.add(key);
        return next;
      });
    } finally {
      setTogglingKey(null);
    }
  }

  const weekLabel = `${weekDates[0].slice(8, 10)}/${weekDates[0].slice(5, 7)} - ${weekDates[6].slice(8, 10)}/${weekDates[6].slice(5, 7)}`;

  return (
    <section className="card habit-week-grid">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>✅ Hábitos</h2>
        <div className="week-nav">
          <button className="btn-ghost" onClick={() => setWeekOffset((w) => w - 1)}>←</button>
          <span className="muted">{weekLabel}</span>
          <button className="btn-ghost" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Hoje</button>
          <button className="btn-ghost" onClick={() => setWeekOffset((w) => w + 1)}>→</button>
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}
      {!loading && activities.length === 0 && (
        <p className="muted">Nenhuma atividade cadastrada ainda - cadastre em "Atividades" primeiro.</p>
      )}

      {!loading && activities.length > 0 && (
        <div className="habit-grid-wrapper">
          <table className="habit-grid">
            <thead>
              <tr>
                <th className="habit-grid-name-col">Atividade</th>
                {weekDates.map((dateStr) => (
                  <th key={dateStr}>
                    {DAYS_OF_WEEK.find((d) => d.value === dayOfWeekOf(dateStr))?.label}
                    <br />
                    <span className="muted" style={{ fontWeight: 400 }}>{dayNumberOf(dateStr)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="habit-grid-name-col">
                    {CATEGORY_ICONS[activity.category]} {activity.name}
                  </td>
                  {weekDates.map((dateStr) => {
                    const scheduledToday = activity.daysOfWeek.includes(dayOfWeekOf(dateStr));
                    const key = checkInKey(activity.id, dateStr);
                    return (
                      <td key={dateStr} className="habit-grid-cell">
                        {scheduledToday ? (
                          <input
                            type="checkbox"
                            checked={checkedSet.has(key)}
                            disabled={togglingKey === key}
                            onChange={() => handleToggle(activity, dateStr)}
                          />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default HabitWeekGrid;
