/**
 * Cypress Intercept Search Plugin
 * 
 * This plugin adds a custom command to Cypress that allows searching through
 * intercepted requests and responses for specific values.
 */

// Recursive function to search for a key-value pair in an object
function searchInObject(obj, key, value) {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  // Check if the current object has the key with the specified value
  if (obj[key] !== undefined) {
    if (value === undefined || obj[key] === value) {
      return { key, value: obj[key], path: [key] };
    }
  }

  // Recursively search in nested objects and arrays
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const result = searchInObject(obj[prop], key, value);
      if (result) {
        result.path = [prop, ...result.path];
        return result;
      }
    }
  }

  // If we're dealing with an array, search each element
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = searchInObject(obj[i], key, value);
      if (result) {
        result.path = [`[${i}]`, ...result.path];
        return result;
      }
    }
  }

  return null;
}

/**
 * Adds the 'search' command to Cypress
 * @param {Object} Cypress - The Cypress object
 */
function registerSearchCommand(Cypress) {
  Cypress.Commands.add('search', { prevSubject: true }, (subject, key, value) => {
    // Ensure subject is an interception or array of interceptions
    if (!subject) {
      throw new Error('No interception found. Make sure to use cy.wait() before calling search().');
    }

    // Handle both single interception and array of interceptions
    const interceptions = Array.isArray(subject) ? subject : [subject];

    // Search results array
    const results = [];

    // Search in each interception
    interceptions.forEach((interception, index) => {
      // Search in request
      if (interception.request) {
        const requestResult = searchInObject(interception.request, key, value);
        if (requestResult) {
          results.push({
            index,
            location: 'request',
            ...requestResult,
            fullPath: `interception[${index}].request.${requestResult.path.join('.')}`
          });
        }
      }

      // Search in response
      if (interception.response) {
        const responseResult = searchInObject(interception.response, key, value);
        if (responseResult) {
          results.push({
            index,
            location: 'response',
            ...responseResult,
            fullPath: `interception[${index}].response.${responseResult.path.join('.')}`
          });
        }
      }
    });

    // Log the search results
    Cypress.log({
      name: 'search',
      message: `${key}${value !== undefined ? ` = ${value}` : ''}`,
      consoleProps: () => ({
        'Key': key,
        'Value': value,
        'Results': results,
        'Interceptions': interceptions
      })
    });

    // Return the results for chaining
    // This allows assertions like .should('exist') or .should('have.length', 2)
    return cy.wrap(results, { log: false });
  });
}

/**
 * Plugin initialization
 * @param {Object} on - Event handlers
 * @param {Object} config - Cypress configuration
 */
function interceptSearchPlugin(on, config) {
  // Plugin tasks can be added here if needed
  return config;
}

// Only register the command when Cypress is available (browser context)
if (typeof window !== 'undefined' && window.Cypress) {
  registerSearchCommand(window.Cypress);
}

// Export the plugin for use in cypress.config.js
module.exports = interceptSearchPlugin;
