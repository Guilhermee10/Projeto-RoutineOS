const noteService = require('../services/noteService');
const { validateNoteInput } = require('../utils/validators');

async function list(req, res, next) {
  try {
    const { q, tag, goalId, archived, limit } = req.query;
    const notes = await noteService.listByUser(
      req.userId,
      { q, tag, goalId, archived: archived === 'true' },
      { limit: limit ? Math.min(Number(limit) || 0, 100) || undefined : undefined }
    );
    res.json(notes);
  } catch (error) {
    next(error);
  }
}

async function tags(req, res, next) {
  try {
    res.json(await noteService.listTags(req.userId));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    validateNoteInput(req.body, { partial: false });
    res.status(201).json(await noteService.create(req.userId, req.body));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    validateNoteInput(req.body, { partial: true });
    res.json(await noteService.update(req.userId, req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await noteService.remove(req.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, tags, create, update, remove };
