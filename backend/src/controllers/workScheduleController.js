const workScheduleService = require('../services/workScheduleService');
const { validateWorkScheduleInput } = require('../utils/validators');
const AppError = require('../utils/AppError');
const { getWeekRange } = require('../utils/dateUtils');

async function list(req, res, next) {
  try {
    const schedules = await workScheduleService.listByUser(req.userId);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateWorkScheduleInput(req.body);
    const schedule = await workScheduleService.create(req.userId, req.body);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const schedule = await workScheduleService.update(req.userId, req.params.id, req.body);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await workScheduleService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Se from/to não vierem, usa a semana corrente (segunda a domingo)
function resolveRange(query) {
  if (query.from && query.to) {
    return { from: new Date(query.from), to: new Date(query.to) };
  }
  const { monday, sunday } = getWeekRange();
  return { from: monday, to: sunday };
}

async function hours(req, res, next) {
  try {
    const range = resolveRange(req.query);
    if (range.to < range.from) {
      throw new AppError('"to" não pode ser anterior a "from".', 422);
    }
    const summary = await workScheduleService.getHoursSummary(req.userId, range);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove, hours };
