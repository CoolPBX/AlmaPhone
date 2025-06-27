import type { Container } from './Container'
import {
  AUTH_REPOSITORY,
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  EXTENSION_REPOSITORY,
  GET_EXTENSIONS_USE_CASE,
  HTTP_CLIENT,
  API_BASE_URL,
} from './ServiceKeys'

// Import repositories
import { AuthRepository } from '@/components/login/repositories/external/AuthRepository'
import { ExtensionRepository } from '@/components/extension-selector/repositories/external/ExtensionRepository'

// Import auth use cases
import { LoginUseCase } from '@/components/login/domain/use-cases/auth/LoginUseCase'
import { LogoutUseCase } from '@/components/login/domain/use-cases/auth/LogoutUseCase'

// Import extension use cases
import { GetExtensionsUseCase } from '@/components/extension-selector/domain/use-cases/extension/GetExtensionsUseCase'

// Import HTTP client
import httpClient from '@/core/infrastructure/http/client'

export function registerServices(container: Container): void {
  // Register configuration values
  container.registerSingleton(
    API_BASE_URL,
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  )

  // Register HTTP client
  container.registerSingleton(HTTP_CLIENT, () => httpClient)

  // Register repositories using factory functions
  container.registerSingleton(AUTH_REPOSITORY, () => {
    const baseUrl = container.resolveService<string>(API_BASE_URL)
    return new AuthRepository(baseUrl)
  })

  container.registerSingleton(EXTENSION_REPOSITORY, () => {
    const baseUrl = container.resolveService<string>(API_BASE_URL)
    return new ExtensionRepository(baseUrl)
  })

  // Register auth use cases using factory functions
  container.registerSingleton(LOGIN_USE_CASE, () => {
    const authRepository = container.resolveService<AuthRepository>(AUTH_REPOSITORY)
    return new LoginUseCase(authRepository)
  })

  container.registerSingleton(LOGOUT_USE_CASE, () => {
    const authRepository = container.resolveService<AuthRepository>(AUTH_REPOSITORY)
    return new LogoutUseCase(authRepository)
  })

  // Register extension use cases using factory functions
  container.registerSingleton(GET_EXTENSIONS_USE_CASE, () => {
    const extensionRepository = container.resolveService<ExtensionRepository>(EXTENSION_REPOSITORY)
    return new GetExtensionsUseCase(extensionRepository)
  })
}
