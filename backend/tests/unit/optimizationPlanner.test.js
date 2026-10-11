const { planWeek } = require('../../src/services/optimizationPlanner');
const { getDatesOfWeek } = require('../../src/utils/dateUtils');

const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
const monday = utc(2026, 9, 28); // segunda-feira
const dates = getDatesOfWeek(monday);

const baseArgs = { dates, activities: [], workSchedules: [], flexibleGoals: [] };

describe('planWeek - fase 1 (tempo livre)', () => {
  test('encaixa uma meta simples no tempo livre disponível', () => {
    const goal = {
      id: 'g1',
      name: 'Inglês',
      durationMinutes: 30,
      frequencyPerWeek: 3,
      priority: 'MEDIA',
      suitableForCommute: false,
    };

    const { slots, unmet } = planWeek({ ...baseArgs, flexibleGoals: [goal] });

    expect(slots).toHaveLength(3);
    expect(unmet).toHaveLength(0);
    // não pode encaixar duas vezes no MESMO dia (uma por dia, no máximo)
    const uniqueDays = new Set(slots.map((s) => s.date.toISOString()));
    expect(uniqueDays.size).toBe(3);
  });

  test('metas de prioridade ALTA são encaixadas antes das de prioridade BAIXA', () => {
    // Um único dia de tempo livre (segunda tem uma atividade ocupando
    // quase o dia inteiro, sobrando só 1h à noite - espaço pra só UMA
    // das duas metas de 45min que competem pelo mesmo horário)
    const activities = [
      { daysOfWeek: [1], startTime: '06:00', endTime: '22:00', category: 'TRABALHO' },
    ];
    const highPriority = {
      id: 'alta', name: 'Meta Alta', durationMinutes: 45,
      frequencyPerWeek: 1, priority: 'ALTA', suitableForCommute: false,
    };
    const lowPriority = {
      id: 'baixa', name: 'Meta Baixa', durationMinutes: 45,
      frequencyPerWeek: 1, priority: 'BAIXA', suitableForCommute: false,
    };

    // Restringe a semana a um único dia (segunda) pra forçar a disputa
    const oneDay = [dates[0]];
    const { slots, unmet } = planWeek({
      dates: oneDay,
      activities,
      workSchedules: [],
      flexibleGoals: [lowPriority, highPriority], // ordem de entrada proposital: baixa primeiro
    });

    expect(slots).toHaveLength(1);
    expect(slots[0].flexibleGoalId).toBe('alta'); // ALTA venceu mesmo entrando depois
    expect(unmet).toEqual([
      { flexibleGoalId: 'baixa', name: 'Meta Baixa', requested: 1, placed: 0, missing: 1 },
    ]);
  });

  test('meta que não cabe em nenhum lugar aparece inteira em unmet', () => {
    const activities = [
      { daysOfWeek: [1, 2, 3, 4, 5, 6, 0], startTime: '06:00', endTime: '23:00', category: 'TRABALHO' },
    ];
    const goal = {
      id: 'g1', name: 'Meta Impossível', durationMinutes: 60,
      frequencyPerWeek: 2, priority: 'MEDIA', suitableForCommute: false,
    };

    const { slots, unmet } = planWeek({ ...baseArgs, activities, flexibleGoals: [goal] });

    expect(slots).toHaveLength(0);
    expect(unmet).toEqual([
      { flexibleGoalId: 'g1', name: 'Meta Impossível', requested: 2, placed: 0, missing: 2 },
    ]);
  });
});

describe('planWeek - fase 2 (janelas de transporte)', () => {
  test('meta NÃO compatível com transporte ignora as janelas de deslocamento', () => {
    // Dia lotado de trabalho, com uma janela de transporte de 50min -
    // mas a meta não é suitableForCommute, então não deve usá-la.
    const activities = [
      { daysOfWeek: [1], startTime: '09:00', endTime: '18:00', category: 'TRABALHO' },
      { daysOfWeek: [1], startTime: '08:00', endTime: '08:50', category: 'TRANSPORTE' },
    ];
    const goal = {
      id: 'g1', name: 'Programação', durationMinutes: 40,
      frequencyPerWeek: 1, priority: 'MEDIA', suitableForCommute: false,
    };

    const oneDay = [dates[0]];
    const { slots, unmet } = planWeek({ dates: oneDay, activities, workSchedules: [], flexibleGoals: [goal] });

    // Encaixou fora do transporte (tem tempo livre no resto do dia)
    expect(slots).toHaveLength(1);
    expect(slots[0].duringCommute).toBe(false);
    expect(unmet).toHaveLength(0);
  });

  test('meta compatível com transporte é sugerida DENTRO da janela de deslocamento quando necessário', () => {
    // Dia inteiro ocupado (inclusive a manhã antes do transporte),
    // exceto pela própria janela de transporte de 50min - única forma
    // de encaixar é usando o transporte.
    const activities = [
      { daysOfWeek: [1], startTime: '06:00', endTime: '08:00', category: 'OUTROS' },
      { daysOfWeek: [1], startTime: '08:50', endTime: '23:00', category: 'TRABALHO' },
      { daysOfWeek: [1], startTime: '08:00', endTime: '08:50', category: 'TRANSPORTE' },
    ];
    const goal = {
      id: 'g1', name: 'Inglês', durationMinutes: 30,
      frequencyPerWeek: 1, priority: 'MEDIA', suitableForCommute: true,
    };

    const oneDay = [dates[0]];
    const { slots, unmet } = planWeek({ dates: oneDay, activities, workSchedules: [], flexibleGoals: [goal] });

    expect(slots).toHaveLength(1);
    expect(slots[0].duringCommute).toBe(true);
    expect(slots[0].startTime).toBe('08:00');
    expect(unmet).toHaveLength(0);
  });

  test('duas metas compatíveis com transporte podem dividir a mesma janela', () => {
    const activities = [
      { daysOfWeek: [1], startTime: '06:00', endTime: '08:00', category: 'OUTROS' },
      { daysOfWeek: [1], startTime: '08:50', endTime: '23:00', category: 'TRABALHO' },
      { daysOfWeek: [1], startTime: '08:00', endTime: '08:50', category: 'TRANSPORTE' }, // 50min
    ];
    const ingles = {
      id: 'ingles', name: 'Inglês', durationMinutes: 30,
      frequencyPerWeek: 1, priority: 'ALTA', suitableForCommute: true,
    };
    const revisao = {
      id: 'revisao', name: 'Revisão', durationMinutes: 20,
      frequencyPerWeek: 1, priority: 'MEDIA', suitableForCommute: true,
    };

    const oneDay = [dates[0]];
    const { slots, unmet } = planWeek({
      dates: oneDay, activities, workSchedules: [], flexibleGoals: [ingles, revisao],
    });

    expect(slots).toHaveLength(2);
    expect(unmet).toHaveLength(0);
    const ingSlot = slots.find((s) => s.flexibleGoalId === 'ingles');
    const revSlot = slots.find((s) => s.flexibleGoalId === 'revisao');
    expect(ingSlot).toEqual({ flexibleGoalId: 'ingles', date: dates[0], startTime: '08:00', endTime: '08:30', duringCommute: true });
    expect(revSlot).toEqual({ flexibleGoalId: 'revisao', date: dates[0], startTime: '08:30', endTime: '08:50', duringCommute: true });
  });
});

describe('planWeek - integra escala de trabalho (WorkSchedule)', () => {
  test('um turno 12x36 ocupa o dia e reduz o tempo livre disponível', () => {
    const workSchedules = [{
      scaleType: 'CYCLE',
      cycleStartDate: monday, // trabalha na própria segunda
      workDaysInCycle: 1,
      restDaysInCycle: 1,
      startTime: '07:00',
      endTime: '19:00',
      breakMinutes: 60,
    }];
    const goal = {
      id: 'g1', name: 'Leitura', durationMinutes: 240, // 4h - não cabe fora do turno de 12h
      frequencyPerWeek: 1, priority: 'MEDIA', suitableForCommute: false,
    };

    const oneDay = [dates[0]]; // segunda: dia de trabalho no ciclo
    const { slots } = planWeek({ dates: oneDay, activities: [], workSchedules, flexibleGoals: [goal] });

    // Sobra 06:00-07:00 (1h) e 19:00-23:00 (4h) - cabe na janela da noite
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe('19:00');
  });
});
