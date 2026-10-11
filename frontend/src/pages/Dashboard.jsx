import { useCallback, useEffect, useMemo, useState } from 'react';
import noteService from '../services/noteService';
import { useDashboardData } from '../hooks/useDashboardData';
import { useHabitWeek } from '../hooks/useHabitWeek';
import { useNow, minutesOfDay } from '../hooks/useNow';
import { computeRoutineScore } from '../utils/routine';
import { decorateTimeline, getRemainingFreeSlots } from '../utils/timeline';
import { buildSuggestions } from '../utils/suggestions';
import { formatDuration } from '../utils/format';
import StatCard from '../components/dashboard/StatCard';
import RoutineScore from '../components/dashboard/RoutineScore';
import TodayTimeline from '../components/dashboard/TodayTimeline';
import TimeDistribution from '../components/dashboard/TimeDistribution';
import HabitTracker from '../components/dashboard/HabitTracker';
import FreeTimeCard from '../components/dashboard/FreeTimeCard';
import SuggestionCard from '../components/dashboard/SuggestionCard';
import GoalsCard from '../components/dashboard/GoalsCard';
import NotesCard from '../components/dashboard/NotesCard';

function streakBadge(streak) {
  if (!streak || streak.current <= 0) return null;
  return <span className="chip chip--warning">🔥 {streak.current}</span>;
}

function Dashboard() {
  const data = useDashboardData();
  const habits = useHabitWeek(0);
  const now = useNow(30_000);
  const nowMinutes = minutesOfDay(now);

  // Anotações recentes (fixadas primeiro). Se a API falhar, o cartão só
  // fica vazio - o resto do Dashboard continua funcionando.
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    noteService.list({ limit: 4 }).then(setNotes).catch(() => setNotes([]));
  }, []);
  const quickAddNote = useCallback(async (content) => {
    const created = await noteService.create({ content });
    setNotes((prev) => [created, ...prev].slice(0, 4));
  }, []);

  const { summary, sleep, goals, flexibleGoals, streaks } = data;

  // Marcar uma atividade na timeline do dia = mesmo check-in da grade
  // de hábitos, então os dois ficam sempre em sincronia.
  const timelineItems = useMemo(
    () =>
      summary
        ? decorateTimeline(
            summary.activities.map((a) => ({
              ...a,
              completed: habits.checkedSet.has(`${a.id}|${summary.date}`) || (habits.loading && a.completed),
            })),
            { nowMinutes, dayRelation: 'today' }
          )
        : [],
    [summary, habits.checkedSet, habits.loading, nowMinutes]
  );

  const freeSlots = useMemo(
    () => (summary ? getRemainingFreeSlots(summary.freeSlots, { nowMinutes }) : []),
    [summary, nowMinutes]
  );

  const routine = useMemo(
    () => computeRoutineScore({ sleepStats: sleep.stats, habitStats: habits.stats }),
    [sleep.stats, habits.stats]
  );

  const suggestions = useMemo(
    () =>
      summary
        ? buildSuggestions({
            freeSlots,
            flexibleGoals,
            goals,
            sleep: { lastMinutes: sleep.lastRecord?.durationMinutes ?? null, stats: sleep.stats },
            habitStats: habits.stats,
            todayStr: habits.todayStr,
          })
        : [],
    [summary, freeSlots, flexibleGoals, goals, sleep, habits.stats, habits.todayStr]
  );

  if (data.loading) return <p className="muted">Carregando sua rotina de hoje...</p>;
  if (data.error) return <p className="alert-error">{data.error}</p>;

  const sleepGoal = sleep.stats?.goalMinutes;
  const sleepProgress = sleepGoal && sleep.lastRecord ? Math.min(100, Math.round((sleep.lastRecord.durationMinutes / sleepGoal) * 100)) : null;
  const { study, workout } = habits.stats;

  function handleTimelineToggle(item) {
    habits.toggle(item.id, summary.date);
  }

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <StatCard
          icon="😴"
          title="Sono"
          value={sleep.lastRecord ? formatDuration(sleep.lastRecord.durationMinutes) : '—'}
          target={sleepGoal ? `/ ${formatDuration(sleepGoal)}` : undefined}
          hint={sleep.lastRecord ? 'Última noite' : 'Sem registro recente'}
          progress={sleepProgress}
          progressTone={sleepProgress !== null && sleepProgress >= 90 ? 'success' : 'accent'}
          badge={streakBadge(streaks?.sleep)}
        />
        <StatCard
          icon="📚"
          title="Estudos"
          value={study.planned > 0 ? `${study.done}` : '—'}
          target={study.planned > 0 ? `/ ${study.planned}` : undefined}
          hint={study.planned > 0 ? 'sessões na semana' : 'Nada planejado ainda'}
          progress={study.percent}
          progressTone={study.percent !== null && study.percent >= 75 ? 'success' : 'accent'}
          badge={streakBadge(streaks?.study)}
        />
        <StatCard
          icon="🏋️"
          title="Treinos"
          value={workout.planned > 0 ? `${workout.done}` : '—'}
          target={workout.planned > 0 ? `/ ${workout.planned}` : undefined}
          hint={workout.planned > 0 ? 'treinos na semana' : 'Nada planejado ainda'}
          progress={workout.percent}
          progressTone={workout.percent !== null && workout.percent >= 75 ? 'success' : 'accent'}
          badge={streakBadge(streaks?.workout)}
        />
        <StatCard
          icon="⚡"
          title="Rotina"
          value={routine.score === null ? '—' : `${routine.score}%`}
          hint={routine.label}
          progress={routine.score}
          progressTone={routine.tone === 'danger' ? 'danger' : routine.tone === 'warning' ? 'warning' : 'success'}
        />
      </div>

      <div className="dash-row dash-row--main">
        <TodayTimeline items={timelineItems} onToggle={handleTimelineToggle} pendingId={null} />
        <div className="dash-stack">
          <RoutineScore result={routine} />
          <GoalsCard goals={goals} onToggle={data.toggleGoalCheckIn} pendingId={data.pendingGoalId} />
          <NotesCard notes={notes} onQuickAdd={quickAddNote} />
        </div>
      </div>

      <div className="dash-row dash-row--even">
        <TimeDistribution totals={summary.categoryTotals} />
        <div className="dash-stack">
          <FreeTimeCard slots={freeSlots} flexibleGoals={flexibleGoals} />
          <SuggestionCard suggestions={suggestions} />
        </div>
      </div>

      <div className="dash-full">
        <HabitTracker
          stats={habits.stats}
          weekDates={habits.weekDates}
          todayStr={habits.todayStr}
          onToggle={habits.toggle}
          pendingKey={habits.pendingKey}
          loading={habits.loading}
          error={habits.error}
        />
      </div>
    </div>
  );
}

export default Dashboard;
