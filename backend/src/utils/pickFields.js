// Devolve um objeto novo só com os campos permitidos (e só os que
// realmente vieram preenchidos - `undefined` fica de fora, mas `null`,
// `0`, `false` e `''` são valores válidos e passam).
//
// Serve de "porteiro" entre o que o cliente manda no body e o que vai
// pro Prisma: qualquer campo fora da lista (id, createdAt, userId,
// campos calculados como durationMinutes/progress...) é descartado em
// vez de estourar um erro de validação do Prisma.
function pickFields(source, allowedFields) {
  return allowedFields.reduce((picked, field) => {
    if (source[field] !== undefined) {
      picked[field] = source[field];
    }
    return picked;
  }, {});
}

module.exports = { pickFields };
