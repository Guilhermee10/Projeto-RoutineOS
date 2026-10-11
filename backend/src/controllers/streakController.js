const streakService = require('../services/streakService');

async function get(req, res, next) {
  try {
    const streaks = await streakService.getStreaks(req.userId);
    res.json(streaks);
  } catch (error) {
    next(error);
  }
}

module.exports = { get };
