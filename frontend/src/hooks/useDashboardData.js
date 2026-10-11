import { useCallback, useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import streakService from '../services/streakService';
import goalService from '../services/goalService';
import flexibleGoalService from '../services/flexibleGoalService';
import sleepService from '../services/sleepService';
import { addDaysToDateString, getTodayDateString } from '../utils/format';

const SLEEP_WINDOW_DAYS = 7;

// Carrega tudo que o Dashboard precisa em paralelo. Só o resumo do dia é
// obrigatório: se qualquer outra fonte falhar (ou não tiver dado), o
// bloco correspondente simplesmente some/fica vazio em vez de derrubar
// a tela inteira.
export function useDashboardData() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    summary: null,
    streaks: null,
    goals: [],
    flexibleGoals: [],
    sleep: { lastRecord: null, stats: null },
  });
  const [pendingGoalId, setPendingGoalId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const from = addDaysToDateString(getTodayDateString(), -(SLEEP_WINDOW_DAYS - 1));

    Promise.allSettled([
      dashboardService.getDaily(),
      streakService.get(),
      goalService.list(),
      flexibleGoalService.list(),
      sleepService.list({ from }),
      sleepService.getStats({ from }),
    ]).then(([summary, streaks, goals, flexibleGoals, sleepList, sleepStats]) => {
      if (cancelled) return;
      const value = (r, fallback) => (r.status === 'fulfilled' ? r.value : fallback);

      if (summary.status === 'rejected') {
        setState((prev) => ({ ...prev, loading: false, error: 'Não foi possível carregar o dashboard.' }));
        return;
      }

      const records = value(sleepList, []);
      setState({
        loading: false,
        error: '',
        summary: summary.value,
        streaks: value(streaks, null),
        goals: value(goals, []),
        flexibleGoals: value(flexibleGoals, []),
        // a API devolve do mais recente pro mais antigo
        sleep: { lastRecord: records[0] || null, stats: value(sleepStats, null) },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleGoalCheckIn = useCallback(async (goal) => {
    const nextCompleted = !goal.checkedInToday;
    const patch = (checkedInToday) =>
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => (g.id === goal.id ? { ...g, checkedInToday } : g)),
      }));

    setPendingGoalId(goal.id);
    patch(nextCompleted); // otimista
    try {
      await goalService.checkin(goal.id, getTodayDateString(), nextCompleted);
    } catch {
      patch(!nextCompleted);
    } finally {
      setPendingGoalId(null);
    }
  }, []);

  return { ...state, pendingGoalId, toggleGoalCheckIn };
}
