import type { AuthRepositoryContract } from '@/components/login/domain/contracts/AuthRepositoryContracts'
import type {
  LoginRequestDto,
  LoginResponseDto,
  ApiErrorDto,
} from '@/components/login/domain/schemas/AuthSchemas'
import {
  LoginRequestSchema,
  LoginResponseSchema,
} from '@/components/login/domain/schemas/AuthSchemas'
import { Either, left, right } from '@/utils/Either'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import config from '@/config'

export class AuthRepository implements AuthRepositoryContract {
  private readonly baseUrl: string

  constructor(baseUrl: string = config.api.baseUrl) {
    this.baseUrl = baseUrl
  }

  async login(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>> {
    LoginRequestSchema.parse(credentials)

    try {
      const response = await axios.post(
        `${this.baseUrl}/authenticate`,
        {
          user_email: credentials.user_email,
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )

      try {
        // Validate the response - log and return error if invalid
        const validatedData = LoginResponseSchema.parse(response.data)
        return right(validatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw error
        }
        console.error('Unknown login response validation error:', error)
        return left({
          message: 'Login response validation failed',
          status: 502,
        })
      }
    } catch (error) {
      return left(this.handleError(error))
    }
  }

  async refreshToken(): Promise<Either<ApiErrorDto, LoginResponseDto>> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `${this.getStoredToken()}`,
            Accept: 'application/json',
          },
        },
      )

      try {
        // Validate the response - log and return error if invalid
        const validatedData = LoginResponseSchema.parse(response.data)
        return right(validatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw error
        }

        console.error('Unknown refresh token response validation error:', error)
        return left({
          message: 'Refresh token response validation failed',
          status: 502,
        })
      }
    } catch (error) {
      return left(this.handleError(error))
    }
  }

  private handleError(error: unknown): ApiErrorDto {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        console.error('API Error:', axiosError.response)
        return {
          message: 'Whoops! Something went wrong.',
          status: axiosError.response.status,
        }
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request)
        return {
          message: 'Whoops! Something went wrong.',
          status: 500,
        }
      }
    }

    console.error('Unknown error:', error)
    return {
      message: 'Unknown error occurred',
      status: 500,
    }
  }

  private getStoredToken(): string {
    return localStorage.getItem('auth_token') || ''
  }
}
