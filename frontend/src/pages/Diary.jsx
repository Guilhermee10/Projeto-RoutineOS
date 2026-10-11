import { useCallback, useEffect, useMemo, useState } from 'react';
import dashboardService from '../services/dashboardService';
import activityService from '../services/activityService';
import { useNow, minutesOfDay } from '../hooks/useNow';
import { decorateTimeline, getRemainingFreeSlots } from '../utils/timeline';
import { addDaysToDateString, getTodayDateString } from '../utils/format';
import { formatLongDate } from '../utils/greeting';
import TodayTimeline from '../components/dashboard/TodayTimeline';
import TimeDistribution from '../components/dashboard/TimeDistribution';
import FreeTimeCard from '../components/dashboard/FreeTimeCard';
import Icon from '../components/ui/Icon';

// Diário: a mesma agenda do Dashboard, mas para qualquer dia.
function Diary() {
  const todayStr = getTodayDateString();
  const [date, setDate] = useState(todayStr);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const now = useNow(30_000);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    dashboardService
      .getDaily(date)
      .then((data) => !cancelled && setSummary(data))
      .catch(() => !cancelled && setError('Não foi possível carregar este dia.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  const dayRelation = date === todayStr ? 'today' : date < todayStr ? 'past' : 'future';
  const nowMinutes = minutesOfDay(now);

  const items = useMemo(
    () => (summary ? decorateTimeline(summary.activities, { nowMinutes, dayRelation }) : []),
    [summary, nowMinutes, dayRelation]
  );
  const freeSlots = useMemo(
    () =>
      summary
        ? getRemainingFreeSlots(summary.freeSlots, { nowMinutes: dayRelation === 'today' ? nowMinutes : null })
        : [],
    [summary, nowMinutes, dayRelation]
  );

  const toggle = useCallback(
    async (item) => {
      const next = !item.completed;
      const patch = (completed) =>
        setSummary((prev) => ({
          ...prev,
          activities: prev.activities.map((a) => (a.id === item.id ? { ...a, completed } : a)),
        }));
      setPendingId(item.id);
      patch(next);
      try {
        await activityService.checkin(item.id, date, next);
      } catch {
        patch(!next);
      } finally {
        setPendingId(null);
      }
    },
    [date]
  );

  return (
    <div className="dashboard">
      <div className="day-nav">
        <button type="button" className="btn-ghost" onClick={() => setDate(addDaysToDateString(date, -1))} aria-label="Dia anterior">
          <Icon name="chevronLeft" size={16} />
        </button>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button type="button" className="btn-ghost" onClick={() => setDate(addDaysToDateString(date, 1))} aria-label="Próximo dia">
          <Icon name="chevronRight" size={16} />
        </button>
        {date !== todayStr && (
          <button type="button" className="btn-ghost" onClick={() => setDate(todayStr)}>Hoje</button>
        )}
        <span className="muted">{formatLongDate(new Date(`${date}T12:00:00`))}</span>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {loading && !summary ? (
        <p className="muted">Carregando...</p>
      ) : summary ? (
        <div className="dash-row dash-row--main">
          <TodayTimeline title="Agenda do dia" items={items} onToggle={toggle} pendingId={pendingId} />
          <div className="dash-stack">
            <TimeDistribution totals={summary.categoryTotals} />
            <FreeTimeCard slots={freeSlots} flexibleGoals={[]} title="Tempo livre do dia" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Diary;
