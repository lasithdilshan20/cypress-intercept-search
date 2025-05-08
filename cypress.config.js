const { defineConfig } = require('cypress');
// When using TypeScript with default export, we need to access the .default property
// when requiring the module in CommonJS
const interceptSearchPlugin = require('./dist/index').default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return interceptSearchPlugin(on, config);
    },
    baseUrl: 'https://example.cypress.io',
    supportFile: 'cypress/support/e2e.js',
  },
});
