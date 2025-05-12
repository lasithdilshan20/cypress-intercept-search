import { registerSearchCommand } from './commands';

/**
 * Plugin initialization
 * @param {Object} on - Event handlers
 * @param {Object} config - Cypress configuration
 */
function interceptSearchPlugin(on: any, config: any) {
  return config;
}

if (typeof window !== 'undefined' && (window as any).Cypress) {
  registerSearchCommand();
}

export = interceptSearchPlugin;
