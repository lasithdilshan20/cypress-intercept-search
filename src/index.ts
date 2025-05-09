// Plugin entry: imports the commands registration
import { registerSearchCommand } from './commands';

/**
 * Plugin initialization
 * @param {Object} on - Event handlers
 * @param {Object} config - Cypress configuration
 */
function interceptSearchPlugin(on: any, config: any) {
  // Plugin tasks can be added here if needed
  return config;
}

// Register the command when in browser context
if (typeof window !== 'undefined' && (window as any).Cypress) {
  registerSearchCommand();
}

// Export the plugin for use in cypress.config.js
// Using module.exports for CommonJS compatibility
// This will allow users to require the plugin without .default
export = interceptSearchPlugin;
