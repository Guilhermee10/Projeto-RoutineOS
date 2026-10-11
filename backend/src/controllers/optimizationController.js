const optimizationService = require('../services/optimizationService');

async function analyze(req, res, next) {
  try {
    // ?date=2026-09-28 (opcional) - qualquer data dentro da semana
    // que se quer analisar. Sem isso, usa a semana corrente.
    const result = await optimizationService.analyzeWeek(req.userId, req.query.date);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { analyze };
