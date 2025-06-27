import type { App } from 'vue'
import { registerServices } from './ServiceRegistration'
import { setupContainer } from './Container'

// Setup dependency injection for the Vue app
export function setupDependencyInjection(app: App): void {
  // Create and setup the container
  const container = setupContainer(app)

  // Register all services
  registerServices(container)
}

// Export everything from the DI system
export * from './Container'
export * from './ServiceKeys'
export * from './ServiceRegistration'
