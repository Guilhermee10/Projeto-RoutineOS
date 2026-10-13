// "Contexto da requisição": guarda, durante UMA requisição, a data e a
// hora locais que o navegador do usuário informou.
//
// Por que isso existe: o servidor (AWS) roda em UTC, mas "hoje" tem que
// ser o dia do usuário. Em vez de passar a data por parâmetro em cada
// função de cada camada, usamos AsyncLocalStorage (nativo do Node): é
// um "armazenamento preso à requisição" que qualquer função chamada
// durante ela consegue ler, e que nunca vaza pra outra requisição.
const { AsyncLocalStorage } = require('node:async_hooks');

const storage = new AsyncLocalStorage();

function runWithClientClock(clock, callback) {
  return storage.run(clock, callback);
}

// Date no padrão do projeto (meia-noite UTC do dia de calendário do
// usuário) ou null se o cliente não informou.
function getClientDate() {
  const clock = storage.getStore();
  return clock && clock.date ? new Date(`${clock.date}T00:00:00.000Z`) : null;
}

// "HH:MM" local do usuário ou null.
function getClientTime() {
  const clock = storage.getStore();
  return clock && clock.time ? clock.time : null;
}

module.exports = { runWithClientClock, getClientDate, getClientTime };
