import type { ApiErrorDto } from '@/domain/dtos/AuthDto'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { LoginRequestDto, LoginResponseDto, UserDataDto } from '../domain/dtos/AuthDto'
import { LoginUseCase } from '../domain/use-cases/auth/LoginUseCase'
import { LogoutUseCase } from '../domain/use-cases/auth/LogoutUseCase'
import { AuthRepository } from '../infrastructure/repositories/AuthRepository'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserDataDto | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Repositories & Use Cases
  const authRepository = new AuthRepository()
  const loginUseCase = new LoginUseCase(authRepository)
  const logoutUseCase = new LogoutUseCase(authRepository)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userEmail = computed(() => user.value?.user_email || '')
  const apiKey = computed(() => user.value?.api_key || '')

  // Actions
  const login = async (credentials: LoginRequestDto): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await loginUseCase.execute(credentials)

      return result.fold(
        // Error case
        (err: ApiErrorDto) => {
          error.value = err.message
          return false
        },
        // Success case
        (response: LoginResponseDto) => {
          console.log('Login successful:', response.data.api_key)

          user.value = response.data
          token.value = response.data.api_key
          // Persistir en localStorage
          localStorage.setItem('auth_token', response.data.api_key)
          localStorage.setItem('user_data', JSON.stringify(response.data))

          return true
        },
      )
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      await logoutUseCase.execute()
    } finally {
      // Limpiar estado independientemente del resultado
      user.value = null
      token.value = null
      error.value = null

      // Limpiar localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      isLoading.value = false
    }
  }

  const restoreSession = (): boolean => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        return true
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        return false
      }
    }

    return false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    userEmail,
    apiKey,

    // Actions
    login,
    logout,
    restoreSession,
    clearError,
  }
})
