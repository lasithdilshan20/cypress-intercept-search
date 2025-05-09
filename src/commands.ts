export interface Interception {
  request: {
    body?: any;
    query?: any;
    headers?: any;
  };
  response?: {
    body?: any;
    headers?: any;
  };
}

/**
 * A single match result for a searched key/value in an intercept.
 */
export interface SearchResult {
  /** Full Cypress interception object */
  intercept: Interception;
  /** Which part of the HTTP transaction was searched */
  location:
    | 'request.body'
    | 'request.query'
    | 'request.headers'
    | 'response.body'
    | 'response.headers';
  /** Path of property names to the matched key */
  path: string[];
  /** The actual value matched */
  value: any;
}

/**
 * Recursively walks an object to collect matches.
 */
function collectMatches(
  obj: any,
  keyToFind: string,
  valueToMatch: any,
  path: string[] = [],
  matches: SearchResult[] = [],
  intercept?: Interception,
  location?: SearchResult['location'],
  visited: Set<any> = new Set()
): SearchResult[] {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return matches;
  }

  if (visited.has(obj)) {
    return matches;
  }

  visited.add(obj);

  for (const key of Object.keys(obj)) {
    const currentPath = [...path, key];
    const val = obj[key];

    if (
      key === keyToFind &&
      (valueToMatch === undefined || val === valueToMatch)
    ) {
      matches.push({
        intercept: intercept!,
        location: location!,
        path: currentPath,
        value: val,
      });
    }

    if (val !== null && typeof val === 'object' && !visited.has(val)) {
      collectMatches(val, keyToFind, valueToMatch, currentPath, matches, intercept, location, visited);
    }
  }

  return matches;
}

/**
 * Scans one or more interceptions for the given key/value.
 */
function searchIntercepts(
  interceptions: Interception | Interception[],
  key: string,
  value?: any
): SearchResult[] {
  const list = Array.isArray(interceptions) ? interceptions : [interceptions];
  const results: SearchResult[] = [];

  list.forEach((i) => {
    const visited = new Set<any>();

    collectMatches(i.request.body, key, value, [], results, i, 'request.body', visited);
    collectMatches(i.request.query, key, value, [], results, i, 'request.query', visited);
    collectMatches(i.request.headers, key, value, [], results, i, 'request.headers', visited);

    if (i.response) {
      collectMatches(i.response.body, key, value, [], results, i, 'response.body', visited);
      collectMatches(i.response.headers, key, value, [], results, i, 'response.headers', visited);
    }
  });

  return results;
}

// Extend Cypress Chainable
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Search the previous intercept(s) for any property named `key`,
       * optionally with exact value `value`. Returns an array of matches.
       */
      search(key: string, value?: any): Chainable<SearchResult[]>;
    }
  }
}

export function registerSearchCommand() {
  // @ts-ignore - Cypress is available in the browser context
  Cypress.Commands.add(
    'search',
    { prevSubject: true },
    (
      subject: Interception | Interception[],
      key: string,
      value?: any
    ) => {
      const matches = searchIntercepts(subject, key, value);
      const valueStr = value !== undefined ? ` with value "${value}"` : '';
      const matchCount = matches.length;
      const matchText = matchCount === 1 ? 'match' : 'matches';
      const message = `search ${key}${valueStr}`;

      // @ts-ignore - Cypress is available in the browser context
      Cypress.log({
        name: 'search',
        message: `${key}${valueStr}`,
        consoleProps: () => ({
          'Key': key,
          'Value': value,
          'Matches': matches,
          'Match Count': matchCount,
          'Match Locations': matches.map(m => `${m.location} at ${m.path.join('.')}`)
        })
      });

      // @ts-ignore - cy is available in the browser context
      const wrappedMatches = cy.wrap(matches, { log: false });

      // @ts-ignore - Adding custom property for better assertion messages
      wrappedMatches.toString = function() {
        if (matches.length === 0) {
          return `${message} (no matches found)`;
        }
        const matchDetails = matches.map((match, idx) => {
          const locationInfo = `${match.location} at ${match.path.join('.')}`;
          const valueStr = typeof match.value === 'object' ? JSON.stringify(match.value) : match.value;

          return `Match ${idx + 1}: {
  location: "${match.location}",
  path: [${match.path.map(p => `"${p}"`).join(', ')}],
  value: ${valueStr}
}`;
        });

        return `${message} (found ${matchCount} ${matchText}):\n${matchDetails.join('\n')}`;
      };

      // @ts-ignore - Adding custom property for better assertion messages
      wrappedMatches.inspect = wrappedMatches.toString;

      return wrappedMatches;
    }
  );
}
