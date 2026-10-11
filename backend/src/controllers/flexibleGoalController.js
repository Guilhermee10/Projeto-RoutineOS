const flexibleGoalService = require('../services/flexibleGoalService');
const { validateFlexibleGoalInput } = require('../utils/validators');

async function list(req, res, next) {
  try {
    const goals = await flexibleGoalService.listByUser(req.userId);
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateFlexibleGoalInput(req.body);
    const goal = await flexibleGoalService.create(req.userId, req.body);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const goal = await flexibleGoalService.update(req.userId, req.params.id, req.body);
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await flexibleGoalService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove };
