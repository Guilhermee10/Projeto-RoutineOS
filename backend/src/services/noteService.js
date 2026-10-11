const noteRepository = require('../repositories/noteRepository');
const goalRepository = require('../repositories/goalRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const { normalizeTags, buildNoteWhere } = require('../utils/noteUtils');

const UPDATABLE_FIELDS = ['title', 'content', 'tags', 'pinned', 'archived', 'goalId'];

async function assertGoalBelongsToUser(userId, goalId) {
  if (!goalId) return;
  const goal = await goalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw new AppError('Meta não encontrada.', 404);
}

function listByUser(userId, filters, options) {
  return noteRepository.findAll(buildNoteWhere(userId, filters), options);
}

// Lista de tags em uso com a contagem de notas de cada uma, da mais
// usada pra menos usada (alimenta o filtro por tag da tela).
async function listTags(userId) {
  const all = await noteRepository.findDistinctTags(userId);
  const counts = all.reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {});
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

async function create(userId, data) {
  const input = pickFields(data, UPDATABLE_FIELDS);
  if (input.tags !== undefined) input.tags = normalizeTags(input.tags);
  await assertGoalBelongsToUser(userId, input.goalId);
  return noteRepository.create({ ...input, userId });
}

async function update(userId, id, data) {
  const existing = await noteRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Anotação não encontrada.', 404);

  const input = pickFields(data, UPDATABLE_FIELDS);
  if (input.tags !== undefined) input.tags = normalizeTags(input.tags);
  await assertGoalBelongsToUser(userId, input.goalId);
  return noteRepository.update(id, input);
}

async function remove(userId, id) {
  const existing = await noteRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Anotação não encontrada.', 404);
  await noteRepository.remove(id);
}

module.exports = { listByUser, listTags, create, update, remove };
