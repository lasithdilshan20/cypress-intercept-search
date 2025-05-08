describe('Cypress Intercept Search Plugin Examples', () => {
  beforeEach(() => {
    // Set up a mock server response for our examples
    // Mock the JSONPlaceholder todos API
    cy.intercept('GET', 'https://data.services.jetbrains.com/geo').as('getGeo');
  });

  it('should search in JSONPlaceholder todos API response', () => {
      cy.visit('https://www.jetbrains.com/')

    cy.wait('@getGeo')
      .search('name', 'Denmark')
      .should('exist');
  });
});