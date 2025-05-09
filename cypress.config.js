const { defineConfig } = require('cypress');
// Import the plugin directly without .default
const interceptSearchPlugin = require('./dist/index');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return interceptSearchPlugin(on, config);
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
  },
});
