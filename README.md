# cypress-intercept-search

A Cypress plugin that adds a custom command to search and assert values in intercepted requests and responses.

## Installation

```bash
npm install --save-dev cypress-intercept-search
```

## Setup

Add the plugin to your Cypress configuration:

### For Cypress 10+ (cypress.config.js)

```javascript
const { defineConfig } = require('cypress');
const interceptSearchPlugin = require('cypress-intercept-search');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return interceptSearchPlugin(on, config);
    },
  },
});
```

### For Cypress < 10 (cypress/plugins/index.js)

```javascript
const interceptSearchPlugin = require('cypress-intercept-search');

module.exports = (on, config) => {
  return interceptSearchPlugin(on, config);
};
```

### Import Commands

In your support file (e.g., cypress/support/e2e.js or cypress/support/commands.js):

```javascript
import 'cypress-intercept-search';
```

## Usage

The plugin adds a `.search()` command that can be chained after `cy.wait()` to search for specific keys and values in intercepted requests and responses.

### Basic Usage

```javascript
// Search for a key in an intercepted request
cy.intercept('POST', '/api/savePlay').as('savePlay');
cy.wait('@savePlay')
  .search('playerID')
  .should('exist');

// Search for a specific key-value pair
cy.wait('@savePlay')
  .search('playerID', '00000000-0000-0000-0000-000000000000')
  .should('exist');
```

### Advanced Usage

```javascript
// Search in multiple interceptions
cy.wait(['@savePlay', '@getPlayers'])
  .search('nameRef', 'Doe, CyJon')
  .should('have.length', 1);

// Access the search results for further assertions
cy.wait('@savePlay')
  .search('players')
  .then((results) => {
    // results is an array of found matches
    expect(results[0].location).to.equal('request'); // 'request' or 'response'
    expect(results[0].value).to.be.an('object');
    expect(results[0].fullPath).to.equal('interception[0].request.body.players');
  });
```

## API Reference

### .search(key, [value])

Searches for a key (and optionally a specific value) in the intercepted request and response.

#### Parameters

- `key` (String): The key to search for in the interception object.
- `value` (Any, optional): The specific value to match. If not provided, it will match any value for the key.

#### Returns

A Cypress chainable containing an array of search results. Each result object contains:

- `index` (Number): The index of the interception in the array (useful when searching in multiple interceptions).
- `location` (String): Either 'request' or 'response', indicating where the match was found.
- `key` (String): The matched key.
- `value` (Any): The value associated with the key.
- `path` (Array): An array representing the path to the matched key.
- `fullPath` (String): A string representation of the full path to the matched key.

## Examples

### Example 1: Verifying Player IDs

```javascript
cy.intercept('POST', '/api/savePlay').as('savePlay');
cy.get('#save-button').click();
cy.wait('@savePlay')
  .search('playerID', '00000000-0000-0000-0000-000000000000')
  .should('exist')
  .then((results) => {
    expect(results[0].location).to.equal('request');
  });
```

### Example 2: Checking Multiple Values

```javascript
cy.intercept('GET', '/api/players').as('getPlayers');
cy.visit('/players');
cy.wait('@getPlayers')
  .search('nameRef')
  .should('have.length.at.least', 1)
  .then((results) => {
    // Check that at least one player has the expected name format
    const nameRefs = results.map(result => result.value);
    expect(nameRefs).to.include('Doe, CyJon');
  });
```

### Example 3: Searching in Nested Objects

```javascript
cy.intercept('POST', '/api/savePlay').as('savePlay');
cy.get('#save-button').click();
cy.wait('@savePlay').then((interception) => {
  // Traditional way (verbose)
  const { players } = interception.request.body;
  expect(players).to.exist;
  expect(players).to.be.an('object');

  Object.entries(players).forEach(([role, player]) => {
    expect(player, `${role} should not be null`).to.not.be.null;
    expect(player.id, `${role}.id should not be default GUID`)
      .to.not.equal('00000000-0000-0000-0000-000000000000');
  });
});

// Using the plugin (more concise)
cy.wait('@savePlay')
  .search('players')
  .should('exist')
  .then((results) => {
    const players = results[0].value;
    Object.entries(players).forEach(([role, player]) => {
      expect(player, `${role} should not be null`).to.not.be.null;
      expect(player.id, `${role}.id should not be default GUID`)
        .to.not.equal('00000000-0000-0000-0000-000000000000');
    });
  });
```

## License

MIT
