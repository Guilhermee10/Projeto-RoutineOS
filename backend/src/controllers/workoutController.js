const workoutService = require('../services/workoutService');
const { validateWorkoutInput } = require('../utils/validators');

function parseDateFilters(query) {
  return {
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  };
}

async function list(req, res, next) {
  try {
    const workouts = await workoutService.listByUser(req.userId, parseDateFilters(req.query));
    res.json(workouts);
  } catch (error) {
    next(error);
  }
}

async function stats(req, res, next) {
  try {
    const result = await workoutService.getStats(req.userId, parseDateFilters(req.query));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateWorkoutInput(req.body);
    const workout = await workoutService.create(req.userId, req.body);
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const workout = await workoutService.update(req.userId, req.params.id, req.body);
    res.json(workout);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await workoutService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, stats, create, update, remove };
