import { useState } from 'react';
import { useHabitWeek } from '../hooks/useHabitWeek';
import HabitTracker from '../components/dashboard/HabitTracker';

function formatRange(weekDates) {
  const fmt = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return `${fmt(weekDates[0])} – ${fmt(weekDates[6])}`;
}

// Página /habits: o mesmo HabitTracker do Dashboard, com navegação de semanas.
function HabitGrid() {
  const [weekOffset, setWeekOffset] = useState(0);
  const habits = useHabitWeek(weekOffset);

  return (
    <HabitTracker
      stats={habits.stats}
      weekDates={habits.weekDates}
      todayStr={habits.todayStr}
      onToggle={habits.toggle}
      pendingKey={habits.pendingKey}
      loading={habits.loading}
      error={habits.error}
      navigation={{
        label: formatRange(habits.weekDates),
        onPrev: () => setWeekOffset((o) => o - 1),
        onNext: () => setWeekOffset((o) => o + 1),
        onToday: weekOffset !== 0 ? () => setWeekOffset(0) : null,
      }}
    />
  );
}

export default HabitGrid;
