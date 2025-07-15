import type { Component } from 'vue'

export interface RouteConfig {
  path: string
  name?: string
  component: () => Promise<Component>
  layout?: 'centered' | 'dashboard'
  meta?: {
    title?: string
    requiresAuth?: boolean
    requiresExtension?: boolean
  }
}

export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  requiresExtension?: boolean
}

// Default meta properties to avoid repetition
export const createRouteMeta = (overrides: RouteMeta = {}): RouteMeta => ({
  title: 'AlmaPhone',
  requiresAuth: true,
  requiresExtension: true,
  ...overrides,
})

// Layout wrapper components
export const withLayout = (config: RouteConfig) => {
  if (config.layout === 'centered') {
    return {
      path: config.path,
      name: config.name,
      component: () => import('@/core/presentation/layouts/CenteredLayout.vue'),
      meta: config.meta,
      children: [
        {
          path: '',
          component: config.component,
        },
      ],
    }
  }

  if (config.layout === 'dashboard') {
    return {
      path: config.path,
      name: config.name,
      component: () => import('@/core/presentation/layouts/DashboardLayout.vue'),
      meta: config.meta,
      children: [
        {
          path: '',
          component: config.component,
        },
      ],
    }
  }

  // No layout - direct component
  return {
    path: config.path,
    name: config.name,
    component: config.component,
    meta: config.meta,
  }
}

// Helper function to create route configurations easily
export const createRoute = (
  path: string,
  component: () => Promise<Component>,
  options: {
    name?: string
    layout?: 'centered' | 'dashboard'
    meta?: RouteMeta
  } = {},
): RouteConfig => ({
  path,
  name: options.name,
  component,
  layout: options.layout,
  meta: createRouteMeta(options.meta),
})

// Predefined route creators for common patterns
export const createPublicRoute = (
  path: string,
  component: () => Promise<Component>,
  options: {
    name?: string
    layout?: 'centered' | 'dashboard'
    title?: string
  } = {},
) =>
  createRoute(path, component, {
    name: options.name,
    layout: options.layout || 'centered',
    meta: createRouteMeta({
      title: options.title,
      requiresAuth: false,
      requiresExtension: false, 
    }),
  })

export const createProtectedRoute = (
  path: string,
  component: () => Promise<Component>,
  options: {
    name?: string
    layout?: 'centered' | 'dashboard'
    title?: string
    requiresExtension?: boolean
  } = {},
) =>
  createRoute(path, component, {
    name: options.name,
    layout: options.layout || 'dashboard',
  meta: createRouteMeta({
      title: options.title,
      requiresAuth: true, // All protected routes require auth
      requiresExtension: options.requiresExtension, // Extension requirement implies auth requirement
    }),
  })