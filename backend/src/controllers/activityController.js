const activityService = require('../services/activityService');
const activityCheckInService = require('../services/activityCheckInService');
const { validateActivityInput, validateActivityUpdateInput, validateCheckInInput } = require('../utils/validators');
const { getWeekRange } = require('../utils/dateUtils');

async function list(req, res, next) {
  try {
    const activities = await activityService.listByUser(req.userId);
    res.json(activities);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateActivityInput(req.body);
    const activity = await activityService.create(req.userId, req.body);
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    validateActivityUpdateInput(req.body);
    const activity = await activityService.update(req.userId, req.params.id, req.body);
    res.json(activity);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await activityService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Marca/desmarca se a atividade foi feita num dia específico.
async function checkin(req, res, next) {
  try {
    validateCheckInInput(req.body);
    const result = await activityCheckInService.setCheckIn(
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

// Devolve todos os check-ins de um intervalo de datas de uma vez - usado
// pela grade semanal de hábitos, pra não precisar de 7 chamadas (uma
// por dia) só pra saber o que já foi marcado na semana.
async function listCheckIns(req, res, next) {
  try {
    let from, to;
    if (req.query.from && req.query.to) {
      from = new Date(req.query.from);
      to = new Date(req.query.to);
    } else {
      ({ monday: from, sunday: to } = getWeekRange());
    }
    const checkIns = await activityCheckInService.listInRange(req.userId, from, to);
    res.json(checkIns);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove, checkin, listCheckIns };
