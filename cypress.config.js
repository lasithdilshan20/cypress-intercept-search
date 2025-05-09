const { defineConfig } = require('cypress');
// When using TypeScript with default export, we need to access the .default property
// when requiring the module in CommonJS
const interceptSearchPlugin = require('./dist/index').default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return interceptSearchPlugin(on, config);
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
  },
});
