/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to search for a key (and optionally a specific value) in intercepted requests and responses.
     * @example
     * // Search for a key in an intercepted request
     * cy.wait('@savePlay').search('playerID').should('exist')
     * 
     * // Search for a specific key-value pair
     * cy.wait('@savePlay').search('playerID', '00000000-0000-0000-0000-000000000000').should('exist')
     * 
     * @param {string} key - The key to search for in the interception object
     * @param {any} [value] - The specific value to match (optional)
     */
    search(key: string, value?: any): Chainable<SearchResult[]>
  }
}

/**
 * Result object returned by the search command
 */
interface SearchResult {
  /** The index of the interception in the array (useful when searching in multiple interceptions) */
  index: number;

  /** Which part of the HTTP transaction was searched */
  location: 'request.body' | 'request.query' | 'request.headers' | 'response.body' | 'response.headers';

  /** The matched key */
  key: string;

  /** The value associated with the key */
  value: any;

  /** An array representing the path to the matched key */
  path: string[];

  /** A string representation of the full path to the matched key */
  fullPath: string;
}
