const Anthropic = require('@anthropic-ai/sdk');
const reportService = require('./reportService');
const AppError = require('../utils/AppError');
const { formatMinutesLabel } = require('../utils/notificationUtils');

function buildPrompt(report) {
  const studyDiff = report.study.diffFromPreviousWeekMinutes;
  const studyDiffLabel = `${studyDiff >= 0 ? '+' : '-'}${formatMinutesLabel(Math.abs(studyDiff))}`;

  return `Você resume a semana de rotina pessoal de um usuário do RoutineOS, um app de organização de rotina pessoal.

Dados da semana (${report.weekStart} a ${report.weekEnd}):
- Sono: média de ${formatMinutesLabel(report.sleep.averageMinutes)} por noite
- Estudos: ${formatMinutesLabel(report.study.totalMinutes)} no total (${studyDiffLabel} vs. semana anterior)
- Treinos: ${formatMinutesLabel(report.workouts.totalMinutes)} em ${report.workouts.count} treino(s)
- Trabalho: ${formatMinutesLabel(report.work.totalMinutes)}
- Transporte: ${formatMinutesLabel(report.commute.totalMinutes)}
- Tempo livre total: ${formatMinutesLabel(report.freeTime.totalMinutes)}
- ${report.goalsUsagePercentage}% do tempo livre foi usado por metas confirmadas

Escreva um resumo curto (3 a 4 frases), em português do Brasil, tom
amigável e direto, destacando o que mais se destacou na semana
(positivo ou um alerta) e UMA sugestão prática pra semana seguinte.
Não use markdown, não cumprimente, não repita todos os números - vá
direto ao resumo em prosa.`;
}

async function generateWeeklySummary(userId, referenceDateString) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AppError(
      'O resumo por IA é um recurso opcional e está desativado nesta demonstração.',
      503
    );
  }

  const report = await reportService.getWeeklyReport(userId, referenceDateString);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let message;
  try {
    message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(report) }],
    });
  } catch (error) {
    // Nunca deixamos o erro cru da API (pode conter detalhes internos)
    // vazar pro cliente - logamos pra debug e devolvemos algo genérico.
    console.error('Erro ao chamar a API da Anthropic:', error.message);
    throw new AppError('Não foi possível gerar o resumo por IA agora. Tente novamente mais tarde.', 502);
  }

  const textBlock = message.content.find((block) => block.type === 'text');

  return {
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    summary: textBlock?.text?.trim() || '',
  };
}

module.exports = { generateWeeklySummary };
