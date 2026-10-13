const { runWithClientClock } = require('../utils/requestContext');

// O frontend manda, em toda requisição:
//   X-Client-Date: 2026-10-12   (dia local do usuário)
//   X-Client-Time: 22:30        (hora local do usuário)
// Valores inválidos são IGNORADOS (nunca viram erro): o sistema simplesmente
// cai no relógio do servidor. Não é dado sensível nem dá privilégio a
// ninguém - só decide qual dia é "hoje" nas contas do próprio usuário.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseClientDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  // rejeita datas impossíveis como 2026-02-31 (o JS "corrige" pra março)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return value;
}

function parseClientTime(value) {
  return typeof value === 'string' && TIME_RE.test(value) ? value : null;
}

function clientClock(req, res, next) {
  const date = parseClientDate(req.get('x-client-date'));
  const time = parseClientTime(req.get('x-client-time'));
  if (!date && !time) return next();
  return runWithClientClock({ date, time }, next);
}

module.exports = clientClock;
module.exports.parseClientDate = parseClientDate;
module.exports.parseClientTime = parseClientTime;
