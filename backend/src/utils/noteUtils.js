const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

// Tags são livres, mas normalizadas: minúsculas, sem espaços nas pontas,
// sem repetição, sem vazias e com limite de quantidade/tamanho. Assim
// "AWS", " aws " e "Aws" viram a mesma tag e o filtro funciona.
function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  for (const raw of tags) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (tag) seen.add(tag);
    if (seen.size >= MAX_TAGS) break;
  }
  return [...seen];
}

// Traduz os filtros da query string (?q=&tag=&goalId=&archived=) no
// `where` do Prisma. Separado do repositório pra ser testável sem banco.
function buildNoteWhere(userId, { q, tag, goalId, archived } = {}) {
  const where = { userId, archived: archived === true };

  if (tag) where.tags = { has: String(tag).trim().toLowerCase() };
  if (goalId) where.goalId = goalId;

  const search = typeof q === 'string' ? q.trim() : '';
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}

module.exports = { normalizeTags, buildNoteWhere, MAX_TAGS, MAX_TAG_LENGTH };
