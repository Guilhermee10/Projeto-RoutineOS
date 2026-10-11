describe('Autenticação', () => {
  it('redireciona quem não está logado para /login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('cadastra uma conta pela tela e entra no Dashboard', () => {
    const email = `e2e+${Date.now()}@routineos.test`;
    cy.visit('/register');
    cy.field('Nome').type('Maria Teste');
    cy.field('E-mail').type(email);
    cy.field('Senha').type('Senha1234!');
    cy.contains('button', 'Criar conta').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('h1', /Bom dia|Boa tarde|Boa noite/).should('contain', 'Maria');
  });

  it('recusa senha curta no cadastro', () => {
    cy.visit('/register');
    cy.field('Nome').type('Maria Teste');
    cy.field('E-mail').type(`e2e+${Date.now()}@routineos.test`);
    cy.field('Senha').type('curta');
    cy.contains('button', 'Criar conta').click();
    cy.location('pathname').should('eq', '/register');
  });

  it('mostra erro genérico com senha errada', () => {
    cy.createUser().then((user) => {
      cy.visit('/login');
      cy.field('E-mail').type(user.email);
      cy.field('Senha').type('senha-errada-123');
      cy.contains('button', 'Entrar').click();
      cy.contains('.alert-error', 'E-mail ou senha inválidos').should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('faz login e logout', () => {
    cy.createUser().then((user) => {
      cy.visit('/login');
      cy.field('E-mail').type(user.email);
      cy.field('Senha').type(user.password);
      cy.contains('button', 'Entrar').click();
      cy.location('pathname').should('eq', '/');

      cy.get('button[aria-label="Sair"]').click();
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage').invoke('getItem', 'routineos_access_token').should('be.null');
    });
  });

  it('protege a API: sem token a resposta é 401', () => {
    cy.request({ url: `${Cypress.env('apiUrl')}/activities`, failOnStatusCode: false })
      .its('status')
      .should('eq', 401);
  });
});
