const studyService = require('../services/studyService');
const { validateStudySessionInput } = require('../utils/validators');

function parseDateFilters(query) {
  return {
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  };
}

async function list(req, res, next) {
  try {
    const sessions = await studyService.listByUser(req.userId, parseDateFilters(req.query));
    res.json(sessions);
  } catch (error) {
    next(error);
  }
}

async function stats(req, res, next) {
  try {
    const result = await studyService.getStats(req.userId, parseDateFilters(req.query));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateStudySessionInput(req.body);
    const session = await studyService.create(req.userId, req.body);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const session = await studyService.update(req.userId, req.params.id, req.body);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await studyService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, stats, create, update, remove };
