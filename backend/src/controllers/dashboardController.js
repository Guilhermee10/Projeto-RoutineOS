const dashboardService = require('../services/dashboardService');

async function daily(req, res, next) {
  try {
    // ?date=2026-09-28 (opcional) - sem isso, usa a data de hoje
    const summary = await dashboardService.getDailySummary(req.userId, req.query.date);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = { daily };
