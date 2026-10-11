const scheduledSlotService = require('../services/scheduledSlotService');

async function list(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      from: req.query.from ? new Date(req.query.from) : undefined,
      to: req.query.to ? new Date(req.query.to) : undefined,
    };
    const slots = await scheduledSlotService.listByUser(req.userId, filters);
    res.json(slots);
  } catch (error) {
    next(error);
  }
}

async function confirm(req, res, next) {
  try {
    const slot = await scheduledSlotService.confirm(req.userId, req.params.id);
    res.json(slot);
  } catch (error) {
    next(error);
  }
}

async function reject(req, res, next) {
  try {
    await scheduledSlotService.reject(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, confirm, reject };
