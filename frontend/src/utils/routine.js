// Índice de rotina (0-100). Cada componente é um percentual de aderência;
// o que não tem dado (null) fica de fora da média em vez de contar como zero.

export function computeSleepPercent(sleepStats) {
  if (!sleepStats || !sleepStats.recordsCount || !sleepStats.goalMinutes) return null;
  return Math.min(100, Math.round((sleepStats.averageMinutes / sleepStats.goalMinutes) * 100));
}

export function getScoreVerdict(score) {
  if (score === null) return { label: 'Sem dados ainda', tone: 'neutral' };
  if (score >= 90) return { label: 'Excelente', tone: 'success' };
  if (score >= 75) return { label: 'Boa rotina', tone: 'success' };
  if (score >= 50) return { label: 'Pode melhorar', tone: 'warning' };
  return { label: 'Precisa de atenção', tone: 'danger' };
}

// Componentes (todos "% até hoje nesta semana", exceto sono):
//  Sono     -> média das últimas 7 noites vs. meta de sono
//  Estudos  -> atividades de estudo/faculdade marcadas vs. planejadas
//  Treinos  -> atividades de treino marcadas vs. planejadas
//  Hábitos  -> todas as atividades marcadas vs. planejadas
//  Trabalho -> ainda não há registro de cumprimento no backend (null);
//              a linha já existe pra receber esse dado no futuro.
export function computeRoutineScore({ sleepStats, habitStats, workPercent = null }) {
  const metrics = [
    { key: 'sleep', label: 'Sono', value: computeSleepPercent(sleepStats) },
    { key: 'study', label: 'Estudos', value: habitStats.study.percent },
    { key: 'workout', label: 'Treinos', value: habitStats.workout.percent },
    { key: 'habits', label: 'Hábitos', value: habitStats.total.percent },
    { key: 'work', label: 'Trabalho', value: workPercent },
  ];

  const available = metrics.filter((m) => m.value !== null);
  const score = available.length
    ? Math.round(available.reduce((sum, m) => sum + m.value, 0) / available.length)
    : null;

  return { score, metrics, ...getScoreVerdict(score) };
}
