describe('Escala de trabalho', () => {
  beforeEach(() => {
    cy.createUser().as('session');
  });

  it('escolhe os dias de FOLGA numa escala regular', function () {
    cy.visitAs(this.session, '/work-schedule');
    cy.contains('button', '+ Nova escala').click();

    cy.field('Início do turno').type('08:00');
    cy.field('Fim do turno').type('17:00');

    cy.contains('.day-chip', 'Escolher dias de folga').click();
    cy.contains('.day-chip', 'Sáb').click();
    cy.contains('.day-chip', 'Ter').click();

    cy.contains('Trabalha: Dom, Seg, Qua, Qui, Sex').should('be.visible');
    cy.contains('Folga: Ter, Sáb').should('be.visible');

    cy.contains('button', 'Salvar').click();
    cy.contains('.card', 'Regular').should('be.visible');

    cy.apiRequest(this.session, 'GET', '/work').its('body.0.daysOfWeek').should('deep.equal', [0, 1, 3, 4, 5]);
  });

  it('escala de ciclo aceita folgas fixas na semana', function () {
    cy.visitAs(this.session, '/work-schedule');
    cy.contains('button', '+ Nova escala').click();

    cy.field('Tipo de escala').select('Ciclo (ex: 12x36, 15x2)');
    cy.field('Início do turno').type('07:00');
    cy.field('Fim do turno').type('19:00');
    cy.contains('.day-chip', 'Usar 15x2').click();
    cy.field('Data de início do ciclo').type('2026-10-05');

    cy.contains('.field-group', 'Folgas fixas').contains('.day-chip', 'Dom').click();
    cy.contains('Folga fixa: Dom').should('be.visible');

    cy.contains('button', 'Salvar').click();
    cy.contains('.card', 'Folga fixa: Dom').should('be.visible');
  });
});
