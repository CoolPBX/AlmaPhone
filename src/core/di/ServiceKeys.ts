// Authentication services
export const AUTH_REPOSITORY = 'AuthRepository'
export const AUTH_STORE = 'AuthStore'
export const LOGIN_USE_CASE = 'LoginUseCase'

// Extension services
export const EXTENSION_REPOSITORY = 'ExtensionRepository'
export const EXTENSION_STORE = 'ExtensionStore'
export const GET_EXTENSIONS_USE_CASE = 'GetExtensionsUseCase'

// Infrastructure services
export const HTTP_CLIENT = 'HttpClient'
export const API_BASE_URL = 'ApiBaseUrl'

// Service key type
export type ServiceKey =
  | typeof AUTH_REPOSITORY
  | typeof AUTH_STORE
  | typeof LOGIN_USE_CASE
  | typeof EXTENSION_REPOSITORY
  | typeof EXTENSION_STORE
  | typeof GET_EXTENSIONS_USE_CASE
  | typeof HTTP_CLIENT
  | typeof API_BASE_URL
