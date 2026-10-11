const {
  formatMinutesLabel,
  getUpcomingActivityNotifications,
  getGoalProgressNotifications,
} = require('../../src/utils/notificationUtils');

describe('formatMinutesLabel', () => {
  test('formata minutos como "XhYY", "Xh" ou "Ymin"', () => {
    expect(formatMinutesLabel(100)).toBe('1h40');
    expect(formatMinutesLabel(60)).toBe('1h');
    expect(formatMinutesLabel(45)).toBe('45min');
  });
});

describe('getUpcomingActivityNotifications', () => {
  const activities = [
    { id: 'a1', name: 'Python', startTime: '15:20' },
    { id: 'a2', name: 'Treino', startTime: '16:30' },
    { id: 'a3', name: 'Já passou', startTime: '14:30' },
    { id: 'a4', name: 'Agora mesmo', startTime: '15:00' },
  ];

  test('só notifica atividades que começam dentro da janela e ainda não começaram', () => {
    const result = getUpcomingActivityNotifications(activities, '15:00');
    expect(result).toEqual([
      { id: 'upcoming-a1', type: 'UPCOMING_ACTIVITY', icon: '🔔', message: 'Hora de Python - começa em 20min' },
    ]);
  });

  test('janela customizada inclui atividades mais distantes', () => {
    const result = getUpcomingActivityNotifications(activities, '15:00', 120);
    expect(result.map((n) => n.id)).toEqual(['upcoming-a1', 'upcoming-a2']);
  });

  test('lista vazia não gera notificações', () => {
    expect(getUpcomingActivityNotifications([], '15:00')).toEqual([]);
  });
});

describe('getGoalProgressNotifications', () => {
  const goals = [
    { id: 'g1', name: 'Inglês', progress: { percentage: 83, current: 500, target: 600, unit: 'minutos' } },
    { id: 'g2', name: 'Treinos', progress: { percentage: 100, current: 4, target: 4, unit: 'treinos' } },
    { id: 'g3', name: 'Leitura', progress: { percentage: 50, current: 2, target: 4, unit: 'unidades' } },
  ];

  test('notifica só metas entre o threshold e 100% (exclusive)', () => {
    const result = getGoalProgressNotifications(goals);
    expect(result).toEqual([
      { id: 'goal-g1', type: 'GOAL_NEAR_TARGET', icon: '🔔', message: 'Meta "Inglês" - você está a 1h40 de bater!' },
    ]);
  });

  test('meta 100% não notifica (já foi batida)', () => {
    const result = getGoalProgressNotifications(goals);
    expect(result.find((n) => n.id === 'goal-g2')).toBeUndefined();
  });

  test('threshold customizado muda o que é "perto"', () => {
    const result = getGoalProgressNotifications(goals, 40);
    expect(result.map((n) => n.id)).toEqual(['goal-g1', 'goal-g3']);
  });
});
