const reportService = require('../services/reportService');
const aiSummaryService = require('../services/aiSummaryService');

async function weekly(req, res, next) {
  try {
    // ?date= (opcional) - qualquer dia dentro da semana a analisar
    const report = await reportService.getWeeklyReport(req.userId, req.query.date);
    res.json(report);
  } catch (error) {
    next(error);
  }
}

// POST (não GET) de propósito: isso dispara uma chamada de verdade
// pra API da Anthropic (custa tempo e, em produção, dinheiro) - não é
// uma leitura "de graça" que devesse acontecer sem o usuário pedir.
async function weeklyAiSummary(req, res, next) {
  try {
    const result = await aiSummaryService.generateWeeklySummary(req.userId, req.body.date);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { weekly, weeklyAiSummary };
