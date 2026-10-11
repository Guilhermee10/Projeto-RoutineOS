// Comandos reutilizáveis dos testes.
//
// Ideia central: em vez de cadastrar/logar pela tela em TODO teste (lento e
// frágil), criamos o usuário direto pela API e injetamos os tokens no
// localStorage. Só o teste de autenticação usa a tela de login de verdade.

const PASSWORD = 'Senha1234!';

// Cada teste cria um usuário novo e único - nada de limpar o banco depois,
// e os testes não interferem uns nos outros.
Cypress.Commands.add('createUser', (name = 'Teste E2E') => {
  const email = `e2e+${Date.now()}${Cypress._.random(1000, 9999)}@routineos.test`;
  return cy
    .request('POST', `${Cypress.env('apiUrl')}/auth/register`, { name, email, password: PASSWORD })
    .then(({ body }) => ({ ...body, email, password: PASSWORD }));
});

// Abre uma página já autenticada.
Cypress.Commands.add('visitAs', (session, path = '/') => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('routineos_access_token', session.accessToken);
      win.localStorage.setItem('routineos_refresh_token', session.refreshToken);
      win.localStorage.setItem('routineos_user', JSON.stringify(session.user));
    },
  });
});

// Chamada direta à API com o token do usuário (preparar dados do teste).
Cypress.Commands.add('apiRequest', (session, method, path, body) =>
  cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${path}`,
    body,
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
);

// Campo de formulário pelo texto do <label> (o app não usa ids/data-cy).
Cypress.Commands.add('field', (labelText) => cy.contains('label', labelText).find('input, select, textarea'));

// Data de hoje no formato do app: dia do calendário local, AAAA-MM-DD.
Cypress.Commands.add('todayString', () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return cy.wrap(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
});
