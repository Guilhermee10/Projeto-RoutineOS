import { formatDuration } from './format.js';
import { dayOfWeekOf } from './habits.js';
import { fitGoalsInSlot } from './timeline.js';

const MAX_SUGGESTIONS = 4;

// Gera as "Sugestões para hoje" SOMENTE a partir de dados reais. Cada
// regra só dispara se os dados existirem - sem dado, sem sugestão (nada
// de texto inventado). Ordem = prioridade; devolve no máximo 4.
//
// Entradas:
//  freeSlots     espaços livres que ainda restam hoje (já recortados)
//  flexibleGoals metas flexíveis cadastradas
//  goals         metas com progresso ({ progress: { current, target, unit, percentage } })
//  sleep         { lastMinutes, stats: { recordsCount, averageMinutes, goalMinutes } }
//  habitStats    saída de computeHabitStats
//  todayStr      "AAAA-MM-DD" de hoje
export function buildSuggestions({ freeSlots, flexibleGoals, goals, sleep, habitStats, todayStr }) {
  const suggestions = [];
  const largestSlot = freeSlots.reduce((best, s) => (!best || s.durationMinutes > best.durationMinutes ? s : best), null);

  // A) Dá pra fechar uma meta de estudo hoje
  const studyGoals = goals.filter(
    (g) => g.type === 'ESTUDO_HORAS' && g.progress.unit === 'minutos' && g.progress.percentage < 100
  );
  const closable = studyGoals
    .map((g) => ({ goal: g, remaining: g.progress.target - g.progress.current }))
    .filter(({ remaining }) => largestSlot && remaining > 0 && remaining <= largestSlot.durationMinutes)
    .sort((a, b) => a.remaining - b.remaining)[0];

  if (closable) {
    suggestions.push({
      id: 'goal-fit',
      tone: 'success',
      icon: '🎯',
      text: `Você tem ${formatDuration(largestSlot.durationMinutes)} livre entre ${largestSlot.start} e ${largestSlot.end}, o suficiente para fechar a meta "${closable.goal.name}" (faltam ${formatDuration(closable.remaining)}).`,
      action: { label: 'Registrar estudo', to: '/study' },
    });
  }

  // B) Aderência baixa nas atividades de estudo planejadas
  if (habitStats.study.planned >= 2 && habitStats.study.percent < 60) {
    suggestions.push({
      id: 'study-adherence',
      tone: 'warning',
      icon: '📚',
      text: `Você concluiu ${habitStats.study.done} de ${habitStats.study.planned} sessões de estudo planejadas até agora nesta semana.`,
      action: { label: 'Ver hábitos', to: '/habits' },
    });
  }

  // C) Meta semanal atrasada em relação ao ritmo esperado
  const dow = dayOfWeekOf(todayStr);
  const dayIndex = dow === 0 ? 7 : dow; // segunda=1 ... domingo=7
  const expected = Math.round((dayIndex / 7) * 100);
  const behind = goals
    .filter((g) => g.period === 'SEMANAL' && g.progress.percentage < 100 && g.id !== closable?.goal.id)
    .filter((g) => g.progress.percentage + 15 < expected)
    .sort((a, b) => a.progress.percentage - b.progress.percentage)[0];

  if (behind) {
    suggestions.push({
      id: 'goal-pace',
      tone: 'warning',
      icon: '🎯',
      text: `A meta "${behind.name}" está em ${behind.progress.percentage}%; até hoje o esperado é cerca de ${expected}%.`,
      action: { label: 'Ver metas', to: '/goals' },
    });
  }

  // D) Sono
  const stats = sleep?.stats;
  if (stats && stats.recordsCount >= 3) {
    const avg = stats.averageMinutes;
    if (sleep.lastMinutes != null && sleep.lastMinutes < avg - 30) {
      suggestions.push({
        id: 'sleep',
        tone: 'warning',
        icon: '😴',
        text: `Seu sono de ontem (${formatDuration(sleep.lastMinutes)}) ficou abaixo da sua média dos últimos 7 dias (${formatDuration(avg)}).`,
        action: { label: 'Ver sono', to: '/sleep' },
      });
    } else if (stats.goalMinutes && avg < stats.goalMinutes - 30) {
      suggestions.push({
        id: 'sleep',
        tone: 'warning',
        icon: '😴',
        text: `Sua média de sono nos últimos 7 dias (${formatDuration(avg)}) está abaixo da meta de ${formatDuration(stats.goalMinutes)}.`,
        action: { label: 'Ver sono', to: '/sleep' },
      });
    }
  }

  // E) Espaço livre + recomendação com as metas flexíveis (se A não cobriu)
  if (!closable && largestSlot && largestSlot.durationMinutes >= 30) {
    const picks = fitGoalsInSlot(largestSlot.durationMinutes, flexibleGoals);
    const recommendation = picks.length
      ? ` Recomendação: ${picks.map((g) => `${g.name} (${g.durationMinutes}min)`).join(' + ')}.`
      : '';
    suggestions.push({
      id: 'free-slot',
      tone: 'info',
      icon: '🕒',
      text: `Você tem ${formatDuration(largestSlot.durationMinutes)} livre entre ${largestSlot.start} e ${largestSlot.end}.${recommendation}`,
      action: { label: 'Ver otimização', to: '/optimization' },
    });
  }

  // F) Hábitos de hoje
  const { planned, pending } = habitStats.today;
  if (pending > 0) {
    suggestions.push({
      id: 'habits-today',
      tone: 'info',
      icon: '✅',
      text: `Faltam ${pending} ${pending === 1 ? 'hábito' : 'hábitos'} para concluir hoje.`,
      action: { label: 'Ver hábitos', to: '/habits' },
    });
  } else if (planned > 0) {
    suggestions.push({
      id: 'habits-today',
      tone: 'success',
      icon: '🎉',
      text: 'Todos os hábitos de hoje estão concluídos.',
    });
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
