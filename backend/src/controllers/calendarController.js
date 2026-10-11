const calendarService = require('../services/calendarService');

async function weekly(req, res, next) {
  try {
    const calendar = await calendarService.getWeeklyCalendar(req.userId, req.query.date);
    res.json(calendar);
  } catch (error) {
    next(error);
  }
}

module.exports = { weekly };
