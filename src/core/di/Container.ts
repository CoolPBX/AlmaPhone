import { type App, type InjectionKey } from 'vue'

export interface ServiceConstructor<T = unknown> {
  new (...args: unknown[]): T
}

export interface ServiceFactory<T = unknown> {
  (): T
}

export type ServiceDefinition<T = unknown> = ServiceConstructor<T> | ServiceFactory<T> | T

export interface ServiceRegistryEntry {
  definition: ServiceDefinition
  cachedInstance?: unknown
  isSingleton: boolean
  dependencyKeys?: string[]
}

export interface ServiceRegistry {
  [serviceKey: string]: ServiceRegistryEntry
}

export interface ServiceRegistrationOptions {
  isSingleton?: boolean
  dependencyKeys?: string[]
}

export interface InjectableMarker {
  __injectable?: boolean
}

export class Container {
  private serviceRegistry: ServiceRegistry = {}
  private vueApp?: App

  constructor(app?: App) {
    this.vueApp = app
  }

  registerService<T>(
    serviceKey: string,
    serviceDefinition: ServiceDefinition<T>,
    options: ServiceRegistrationOptions = {},
  ): void {
    const { isSingleton = true, dependencyKeys = [] } = options

    this.serviceRegistry[serviceKey] = {
      definition: serviceDefinition,
      isSingleton,
      dependencyKeys,
    }

    if (this.vueApp) {
      const injectionKey = Symbol(serviceKey) as InjectionKey<T>
      this.vueApp.provide(injectionKey, this.resolveService<T>(serviceKey))
    }
  }

  registerSingleton<T>(
    serviceKey: string,
    serviceDefinition: ServiceDefinition<T>,
    dependencyKeys: string[] = [],
  ): void {
    this.registerService(serviceKey, serviceDefinition, { isSingleton: true, dependencyKeys })
  }

  registerTransient<T>(
    serviceKey: string,
    serviceDefinition: ServiceDefinition<T>,
    dependencyKeys: string[] = [],
  ): void {
    this.registerService(serviceKey, serviceDefinition, { isSingleton: false, dependencyKeys })
  }

  resolveService<T>(serviceKey: string): T {
    const serviceEntry = this.serviceRegistry[serviceKey]
    if (!serviceEntry) {
      throw new Error(`Service '${serviceKey}' is not registered`)
    }

    if (serviceEntry.isSingleton && serviceEntry.cachedInstance) {
      return serviceEntry.cachedInstance as T
    }

    const instance = this.createServiceInstance<T>(serviceEntry)

    if (serviceEntry.isSingleton) {
      serviceEntry.cachedInstance = instance
    }

    return instance
  }

  private createServiceInstance<T>(serviceEntry: ServiceRegistryEntry): T {
    const { definition, dependencyKeys = [] } = serviceEntry

    if (typeof definition !== 'function') {
      return definition as T
    }

    const resolvedDependencies = dependencyKeys.map((dependencyKey: string) =>
      this.resolveService(dependencyKey),
    )

    if (this.isFactoryFunction(definition)) {
      return (definition as ServiceFactory<T>)()
    }

    return new (definition as ServiceConstructor<T>)(...resolvedDependencies)
  }

  private isFactoryFunction(definition: ServiceDefinition): boolean {
    return typeof definition === 'function' && !definition.prototype?.constructor
  }

  getRegisteredServiceKeys(): string[] {
    return Object.keys(this.serviceRegistry)
  }

  clearAllServices(): void {
    this.serviceRegistry = {}
  }

  hasService(serviceKey: string): boolean {
    return serviceKey in this.serviceRegistry
  }
}

let globalContainer: Container | null = null

export function getContainer(): Container {
  if (!globalContainer) {
    throw new Error('Container not initialized. Call setupContainer() first.')
  }
  return globalContainer
}

export function setupContainer(app: App): Container {
  globalContainer = new Container(app)
  return globalContainer
}

export function Injectable<T extends ServiceConstructor>(constructor: T): T {
  ;(constructor as unknown as { __injectable: boolean }).__injectable = true
  return constructor
}

export function createInjectionKey<T>(key: string): InjectionKey<T> {
  return Symbol(key) as InjectionKey<T>
}

export function useService<T>(key: string): T {
  return getContainer().resolveService<T>(key)
}

export function useOptionalService<T>(key: string, defaultValue?: T): T | undefined {
  try {
    return getContainer().resolveService<T>(key)
  } catch {
    return defaultValue
  }
}
