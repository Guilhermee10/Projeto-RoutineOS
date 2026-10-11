import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import activityService from '../services/activityService';
import { getWeekDates, getTodayDateString } from '../utils/format';
import { checkInKey, computeHabitStats } from '../utils/habits';

// Fonte ÚNICA da verdade dos hábitos de uma semana: atividades + check-ins.
// Dashboard (timeline, hábitos, índice de rotina) e a página /habits
// leem daqui, então marcar um hábito em qualquer lugar atualiza tudo.
export function useHabitWeek(weekOffset = 0) {
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayStr = getTodayDateString();

  const [activities, setActivities] = useState([]);
  const [checkedSet, setCheckedSet] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingKey, setPendingKey] = useState(null);

  // ref pra o toggle sempre enxergar o estado mais recente sem
  // precisar ser recriado a cada render
  const checkedRef = useRef(checkedSet);
  checkedRef.current = checkedSet;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      activityService.list(),
      activityService.listCheckIns(weekDates[0], weekDates[6]),
    ])
      .then(([activitiesData, checkInsData]) => {
        if (cancelled) return;
        setActivities(activitiesData);
        setCheckedSet(new Set(checkInsData.map((c) => checkInKey(c.activityId, c.date.slice(0, 10)))));
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar os hábitos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekDates]);

  const toggle = useCallback(async (activityId, dateStr) => {
    const key = checkInKey(activityId, dateStr);
    const nextChecked = !checkedRef.current.has(key);
    setPendingKey(key);

    const apply = (checked) =>
      setCheckedSet((prev) => {
        const next = new Set(prev);
        if (checked) next.add(key);
        else next.delete(key);
        return next;
      });

    apply(nextChecked); // otimista: a tela muda antes da resposta do servidor
    try {
      await activityService.checkin(activityId, dateStr, nextChecked);
    } catch {
      apply(!nextChecked); // desfaz se o servidor recusar
    } finally {
      setPendingKey(null);
    }
  }, []);

  const stats = useMemo(
    () => computeHabitStats({ activities, checkedSet, weekDates, todayStr }),
    [activities, checkedSet, weekDates, todayStr]
  );

  return { weekDates, todayStr, activities, checkedSet, stats, loading, error, pendingKey, toggle };
}
