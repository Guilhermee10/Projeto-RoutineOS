const goalService = require('../services/goalService');
const goalCheckInService = require('../services/goalCheckInService');
const { validateGoalInput, validateProgressIncrement, validateCheckInInput } = require('../utils/validators');

async function list(req, res, next) {
  try {
    const goals = await goalService.listByUser(req.userId);
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateGoalInput(req.body);
    const goal = await goalService.create(req.userId, req.body);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const goal = await goalService.update(req.userId, req.params.id, req.body);
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await goalService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function registerProgress(req, res, next) {
  try {
    validateProgressIncrement(req.body);
    const goal = await goalService.registerManualProgress(req.userId, req.params.id, req.body.increment);
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

// Marca/desmarca se o usuário "tocou" nessa meta hoje - diferente do
// /progress, que é a medida de verdade (horas/quantidade).
async function checkin(req, res, next) {
  try {
    validateCheckInInput(req.body);
    const result = await goalCheckInService.setCheckIn(
      req.userId,
      req.params.id,
      req.body.date,
      req.body.completed
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resetProgress(req, res, next) {
  try {
    const goal = await goalService.resetProgress(req.userId, req.params.id);
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove, registerProgress, checkin, resetProgress };
