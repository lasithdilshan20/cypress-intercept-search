# cypress-intercept-search

A Cypress plugin that adds a custom command to search and assert values in intercepted requests and responses.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/lasithdilshan20/cypress-intercept-search)
[![Author](https://img.shields.io/badge/Author-Lasith%20Dilshan-orange.svg)](https://github.com/lasithdilshan20)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install --save-dev cypress-intercept-search
```

If you encounter peer dependency issues with Cypress versions, you can use the `--legacy-peer-deps` flag to bypass these checks:

```bash
npm install --save-dev cypress-intercept-search --legacy-peer-deps
```

This is useful when you're using a newer version of Cypress that isn't explicitly listed in the plugin's peer dependencies, but you know it should work fine.

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

### For TypeScript Users (cypress.config.ts)

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'
import interceptSearchPlugin from 'cypress-intercept-search'

export default defineConfig({
  e2e: {
    // any other e2e options you need, e.g. baseUrl, specPattern, etc.
    setupNodeEvents(on, config) {
      // hook in our plugin
      return interceptSearchPlugin(on, config)
    },
  },
})
```

### Using with Other Plugins

If you're using multiple plugins, you can integrate them like this:

```javascript
// In your cypress.config.js or cypress.config.ts
{
  e2e: {
    setupNodeEvents(on, config) {
      mochawesomeReporter(on);
      registerRabbitMqTasks(on);
      interceptSearchPlugin(on, config);
      return config;
    },
  }
}
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

For TypeScript users (e.g., cypress/support/e2e.ts):

```typescript
import { registerSearchCommand } from 'cypress-intercept-search/dist/commands';
registerSearchCommand();
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

### Example 1: Searching in Nested API Response

```javascript
// Set up the intercept
cy.intercept('GET', '/api/nested').as('getNested');

// Visit the page and trigger the request
cy.visit('/');
cy.get('#btn-nested').click();

// Wait for the request and search for the name property
cy.wait('@getNested')
  .search('name', 'Alice')
  .should('exist')
  .then((results) => {
    // Verify the search results contain the expected data
    expect(results[0].location).to.equal('response.body');
    expect(results[0].value).to.equal('Alice');
  });
```

### Example 2: Searching in Echo API Response

```javascript
// Set up the intercept
cy.intercept('GET', '/api/echo*').as('getEcho');

// Visit the page and trigger the request
cy.visit('/');
cy.get('#btn-echo').click();

// Wait for the request and search for the foo property
cy.wait('@getEcho')
  .search('foo', 'hello')
  .should('exist')
  .then((results) => {
    // There should be multiple matches for 'foo' in different locations
    expect(results.length).to.be.greaterThan(1);
  });
```

### Example 3: Searching in Submit API Request and Response

```javascript
// Set up the intercept
cy.intercept('POST', '/api/submit').as('postSubmit');

// Visit the page and trigger the request
cy.visit('/');
cy.get('#btn-submit').click();

// Wait for the request and search for the gamma property
cy.wait('@postSubmit')
  .search('gamma')
  .should('exist')
  .then((results) => {
    expect(results[0].value).to.equal('G');
  });
```

## Running the Examples

This project includes a test server and example tests to demonstrate the plugin's functionality.

### Starting the Test Server

```bash
npm run start
```

### Running the Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests headlessly
npm run cypress:run
```

The example tests demonstrate searching for values in different parts of HTTP requests and responses:

1. Searching for a property in a nested API response
2. Searching for query parameters in request and response
3. Searching for properties in request body and response body

## License

MIT
