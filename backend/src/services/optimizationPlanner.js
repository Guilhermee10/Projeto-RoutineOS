const { buildDayBlocks, extractCommuteBlocks } = require('../utils/dayBlocksUtils');
const { calculateFreeSlots } = require('../utils/dashboardUtils');
const { createTimePool } = require('../utils/slotPoolUtils');
const { WAKING_WINDOW } = require('../config/schedule');

const PRIORITY_WEIGHT = { ALTA: 3, MEDIA: 2, BAIXA: 1 };

// Núcleo PURO do motor de otimização: recebe dados já carregados e
// devolve as sugestões, sem tocar em banco nem em relógio. Por isso é
// fácil de testar (ver tests/unit/optimizationPlanner.test.js) - o
// service só busca os dados, chama esta função e persiste o resultado.
//
// Algoritmo (guloso):
//  1. Para cada dia da semana, monta dois "pools" consumíveis: tempo
//     livre real e janelas de transporte.
//  2. Ordena as metas por prioridade (ALTA escolhe primeiro).
//  3. Para cada meta, tenta encaixar uma sessão por dia no tempo livre;
//     se ainda faltar e a meta for compatível com transporte, tenta as
//     janelas de transporte.
//  4. O que não coube vira "unmet" (sinal de rotina sobrecarregada).
function planWeek({ dates, activities, workSchedules, flexibleGoals }) {
  const dayContexts = dates.map((date) => {
    const blocks = buildDayBlocks(date, activities, workSchedules);
    const freeSlots = calculateFreeSlots(blocks, WAKING_WINDOW);
    const commuteBlocks = extractCommuteBlocks(blocks);

    return {
      date,
      freePool: createTimePool(freeSlots),
      commutePool: createTimePool(
        commuteBlocks.map((b) => ({ start: b.startTime, end: b.endTime }))
      ),
    };
  });

  const sortedGoals = [...flexibleGoals].sort(
    (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  );

  const slots = [];
  const unmet = [];

  for (const goal of sortedGoals) {
    let placed = 0;

    for (const day of dayContexts) {
      if (placed >= goal.frequencyPerWeek) break;
      const claimed = day.freePool.claim(goal.durationMinutes);
      if (claimed) {
        slots.push(buildSlot(goal.id, day.date, claimed, false));
        placed += 1;
      }
    }

    if (placed < goal.frequencyPerWeek && goal.suitableForCommute) {
      for (const day of dayContexts) {
        if (placed >= goal.frequencyPerWeek) break;
        const claimed = day.commutePool.claim(goal.durationMinutes);
        if (claimed) {
          slots.push(buildSlot(goal.id, day.date, claimed, true));
          placed += 1;
        }
      }
    }

    if (placed < goal.frequencyPerWeek) {
      unmet.push({
        flexibleGoalId: goal.id,
        name: goal.name,
        requested: goal.frequencyPerWeek,
        placed,
        missing: goal.frequencyPerWeek - placed,
      });
    }
  }

  return { slots, unmet };
}

function buildSlot(flexibleGoalId, date, claimed, duringCommute) {
  return {
    flexibleGoalId,
    date,
    startTime: claimed.startTime,
    endTime: claimed.endTime,
    duringCommute,
  };
}

module.exports = { planWeek };
