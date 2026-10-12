describe('Metas e estudos', () => {
  beforeEach(() => {
    cy.createUser().as('session');
  });

  // Regressão do bug "estudar marcava metas sozinho": estudo só conta pra
  // uma meta quando o usuário vincula.
  it('estudo sem vínculo NÃO preenche a meta; com vínculo preenche; zerar volta a 0', function () {
    cy.todayString().then((today) => {
      cy.apiRequest(this.session, 'POST', '/goals', {
        name: 'Curso de AWS',
        type: 'ESTUDO_HORAS',
        targetValue: 60,
        period: 'SEMANAL',
      });
      // estudo registrado SEM escolher meta
      cy.apiRequest(this.session, 'POST', '/studies', {
        date: today,
        subject: 'Inglês',
        durationMinutes: 45,
      });

      cy.visitAs(this.session, '/goals');
      cy.contains('.card', 'Curso de AWS').should('contain', '0min / 1h (0%)');

      // agora pela tela, vinculando à meta
      cy.visit('/study');
      cy.contains('button', '+ Registrar estudo').click();
      cy.field('Data').type(today);
      cy.field('Matéria').type('AWS');
      cy.field('Duração').type('30');
      cy.field('Contar para uma meta').select('Curso de AWS');
      cy.contains('button', 'Salvar').click();
      cy.contains('.card', 'AWS').should('contain', 'Curso de AWS');

      cy.visit('/goals');
      cy.contains('.card', 'Curso de AWS').should('contain', '30min / 1h (50%)');

      // zerar
      cy.on('window:confirm', () => true);
      cy.contains('.card', 'Curso de AWS').contains('button', 'Zerar').click();
      cy.contains('.card', 'Curso de AWS').should('contain', '0min / 1h (0%)');
    });
  });

  it('a API recusa vincular estudo a uma meta de outro tipo', function () {
    cy.todayString().then((today) => {
      cy.apiRequest(this.session, 'POST', '/goals', {
        name: 'Treinar 3x',
        type: 'TREINO_QUANTIDADE',
        targetValue: 3,
        period: 'SEMANAL',
      }).then(({ body: goal }) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/studies`,
          headers: { Authorization: `Bearer ${this.session.accessToken}` },
          body: { date: today, subject: 'Inglês', durationMinutes: 30, goalId: goal.id },
          failOnStatusCode: false,
        })
          .its('status')
          .should('eq', 422);
      });
    });
  });
});
