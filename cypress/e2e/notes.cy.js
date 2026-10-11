describe('Anotações', () => {
  beforeEach(() => {
    cy.createUser().as('session');
  });

  it('cria uma anotação com checklist, marca itens e mantém depois de recarregar', function () {
    cy.visitAs(this.session, '/notes');
    cy.contains('Nenhuma anotação ainda').should('be.visible');

    cy.contains('button', '+ Nova anotação').click();
    cy.get('.note-title-input').type('Compras');
    // Enter numa linha de checklist continua a lista automaticamente
    cy.get('.note-textarea').type('- [ ] leite{enter}pão{enter}ovos');
    cy.field('Tags').type('mercado, casa');
    cy.contains('button', 'Salvar').click();

    cy.contains('.note-card', 'Compras').within(() => {
      cy.get('input[type="checkbox"]').should('have.length', 3);
      cy.contains('0/3').should('be.visible');
      cy.contains('#mercado').should('be.visible');

      cy.get('input[type="checkbox"]').first().check();
      cy.contains('1/3').should('be.visible');
    });

    cy.reload();
    cy.contains('.note-card', 'Compras').contains('1/3').should('be.visible');
  });

  it('busca e arquiva', function () {
    cy.apiRequest(this.session, 'POST', '/notes', { title: 'Ideias de TCC', content: '- tema A\n- tema B', tags: ['faculdade'] });
    cy.apiRequest(this.session, 'POST', '/notes', { title: 'Receita', content: 'bolo de cenoura' });

    cy.visitAs(this.session, '/notes');
    cy.get('input[type="search"]').type('cenoura');
    cy.contains('.note-card', 'Receita').should('be.visible');
    cy.contains('.note-card', 'Ideias de TCC').should('not.exist');

    cy.get('input[type="search"]').clear().type('nada-disso');
    cy.contains('Nenhuma anotação encontrada').should('be.visible');

    cy.get('input[type="search"]').clear();
    cy.contains('.note-card', 'Receita').contains('button', 'Arquivar').click();
    cy.contains('.note-card', 'Receita').should('not.exist');

    cy.contains('button', 'Arquivadas').click();
    cy.contains('.note-card', 'Receita').should('be.visible');
  });

  it('o usuário só enxerga as próprias anotações', function () {
    cy.apiRequest(this.session, 'POST', '/notes', { title: 'Segredo', content: 'só meu' });
    cy.createUser('Outro').then((other) => {
      cy.apiRequest(other, 'GET', '/notes').its('body').should('have.length', 0);
    });
  });
});
