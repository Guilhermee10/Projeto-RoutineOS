const sleepService = require('../services/sleepService');
const { validateSleepInput } = require('../utils/validators');

function parseDateFilters(query) {
  return {
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  };
}

async function list(req, res, next) {
  try {
    const records = await sleepService.listByUser(req.userId, parseDateFilters(req.query));
    res.json(records);
  } catch (error) {
    next(error);
  }
}

async function stats(req, res, next) {
  try {
    const goalMinutes = req.query.goalMinutes ? Number(req.query.goalMinutes) : undefined;
    const result = await sleepService.getStats(req.userId, {
      ...parseDateFilters(req.query),
      ...(goalMinutes && { goalMinutes }),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateSleepInput(req.body);
    const record = await sleepService.create(req.userId, req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const record = await sleepService.update(req.userId, req.params.id, req.body);
    res.json(record);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await sleepService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, stats, create, update, remove };
