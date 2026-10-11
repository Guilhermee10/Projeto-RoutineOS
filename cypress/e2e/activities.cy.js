describe('Atividades', () => {
  beforeEach(() => {
    cy.createUser().as('session');
  });

  it('cria, edita e remove uma atividade', function () {
    cy.visitAs(this.session, '/activities');
    cy.contains('Nenhuma atividade cadastrada ainda.').should('be.visible');

    // criar
    cy.contains('button', '+ Nova atividade').click();
    cy.field('Nome').type('Estudar Cypress');
    cy.field('Categoria').select('Estudo');
    cy.field('Início').type('09:00');
    cy.field('Fim').type('10:00');
    cy.contains('.day-chip', 'Seg').click();
    cy.contains('.day-chip', 'Ter').click();
    cy.contains('button', 'Salvar').click();
    cy.contains('.card', 'Estudar Cypress').should('be.visible');

    // editar (regressão: o update não pode mandar campos extras pro Prisma)
    cy.contains('.card', 'Estudar Cypress').contains('button', 'Editar').click();
    cy.field('Nome').clear().type('Estudar Cypress hoje');
    cy.contains('button', 'Salvar').click();
    cy.contains('.card', 'Estudar Cypress hoje').should('be.visible');

    // remover
    cy.on('window:confirm', () => true);
    cy.contains('.card', 'Estudar Cypress hoje').contains('button', 'Remover').click();
    cy.contains('Estudar Cypress hoje').should('not.exist');
  });

  it('não deixa um usuário ver as atividades de outro', function () {
    cy.apiRequest(this.session, 'POST', '/activities', {
      name: 'Atividade privada',
      category: 'ESTUDO',
      startTime: '09:00',
      endTime: '10:00',
      daysOfWeek: [1],
    });

    cy.createUser('Outro Usuário').then((other) => {
      cy.apiRequest(other, 'GET', '/activities').its('body').should('have.length', 0);
    });
  });

  it('o check-in aparece no rastreador de hábitos do Dashboard', function () {
    cy.todayString().then((today) => {
      const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay();
      cy.apiRequest(this.session, 'POST', '/activities', {
        name: 'Ler 20 páginas',
        category: 'ESTUDO',
        startTime: '06:00',
        endTime: '06:30',
        daysOfWeek: [dayOfWeek],
      });
    });

    cy.visitAs(this.session, '/habits');
    cy.contains('.habit-row', 'Ler 20 páginas')
      .find('button.habit-cell.is-today')
      .should('have.attr', 'aria-checked', 'false')
      .click()
      .should('have.attr', 'aria-checked', 'true');

    cy.reload();
    cy.contains('.habit-row', 'Ler 20 páginas')
      .find('button.habit-cell.is-today')
      .should('have.attr', 'aria-checked', 'true');
  });
});
