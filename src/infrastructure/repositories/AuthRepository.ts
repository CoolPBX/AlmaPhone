import type { AuthRepositoryContract } from '@/domain/contracts/AuthRepositoryContracts'
import type { LoginRequestDto, LoginResponseDto, ApiErrorDto } from '@/domain/dtos/AuthDto'
import { Either, left, right } from '@/utils/Either'
import axios, { AxiosError } from 'axios'

export class AuthRepository implements AuthRepositoryContract {
  private readonly baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') {
    this.baseUrl = baseUrl
  }

  async login(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>> {
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

      return right(response.data)
    } catch (error) {
      return left(this.handleError(error))
    }
  }

  async logout(): Promise<Either<ApiErrorDto, void>> {
    try {
      await axios.post(
        `${this.baseUrl}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `${this.getStoredToken()}`,
            Accept: 'application/json',
          },
        },
      )

      return right(undefined)
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

      return right(response.data)
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

    return {
      message: 'Unknown error occurred',
      status: 500,
    }
  }

  private getStoredToken(): string {
    return localStorage.getItem('auth_token') || ''
  }
}
