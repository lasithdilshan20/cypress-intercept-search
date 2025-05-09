describe('Cypress Intercept Search Plugin Examples', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/nested').as('getNested');
    cy.intercept('GET', '/api/echo*').as('getEcho');
    cy.intercept('POST', '/api/submit').as('postSubmit');
    cy.intercept('PUT', '/api/update/*').as('putUpdate');
  });

  it('should search for name property in nested API response', () => {
    cy.visit('/');

    cy.get('#btn-nested').click();

    cy.wait('@getNested')
      .search('name', 'Alice')
      .should('exist')
      .then((results) => {
        expect(results[0].location).to.equal('response.body');
        expect(results[0].value).to.equal('Alice');
      });
  });

  it('should search in echo API response with query parameters', () => {
    cy.visit('/');

    cy.get('#btn-echo').click();

    cy.wait('@getEcho')
      .search('foo', 'hello')
      .should('exist')
      .then((results) => {
        expect(results.length).to.be.greaterThan(1);
      });
  });

  it('should search in submit API request and response', () => {
    cy.visit('/');

    cy.get('#btn-submit').click();

    cy.wait('@postSubmit')
      .search('gamma')
      .should('exist')
      .then((results) => {
        expect(results[0].value).to.equal('G');
      });
  });
});