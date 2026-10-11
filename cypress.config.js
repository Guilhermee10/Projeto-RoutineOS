const { defineConfig } = require('cypress');

// Os testes E2E precisam de TUDO rodando: banco (docker compose up -d),
// backend (porta 3333) e frontend (porta 5173). Ver README, seção "Testes E2E".
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    defaultCommandTimeout: 8000,
    env: {
      apiUrl: 'http://localhost:3333/api',
    },
  },
});
