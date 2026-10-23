/**
 * Default configuration, used by production builds.
 *
 * `environment.development.ts` replaces this file while serving or building in
 * development — see the `fileReplacements` entry in angular.json.
 */
export const environment = {
  production: true,

  /** Base URL of the Spring Boot backend. */
  backendBaseUrl: 'http://localhost:8080',
};
