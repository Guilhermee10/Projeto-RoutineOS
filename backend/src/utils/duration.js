const UNIT_TO_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

// Converte strings tipo "15m", "7d", "1h" em milissegundos. Evita
// depender de uma lib externa (tipo `ms`) só pra isso.
function parseDurationToMs(value) {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(`Formato de duração inválido: "${value}". Use algo como "15m", "1h", "7d".`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}

module.exports = { parseDurationToMs };
