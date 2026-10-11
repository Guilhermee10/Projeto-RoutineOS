require('dotenv').config();

const { assertEnv } = require('./src/config/env');

// Falha na hora (com mensagem clara) se faltar configuração essencial
assertEnv();

const app = require('./src/app');

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`RoutineOS backend rodando na porta ${PORT}`);
});
