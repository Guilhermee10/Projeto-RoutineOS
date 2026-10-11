// Depois de "zerar" uma meta, só contam os registros CRIADOS depois do
// reset. Usamos createdAt (momento exato do registro) e não a data do
// registro, porque a data é só o dia (meia-noite): um estudo lançado
// hoje, depois do reset, ainda teria data "hoje 00:00" - anterior ao
// reset - e seria ignorado por engano.
function filterSinceReset(records, resetAt) {
  if (!resetAt) return records;
  const limit = new Date(resetAt).getTime();
  return records.filter((record) => new Date(record.createdAt).getTime() >= limit);
}

module.exports = { filterSinceReset };
