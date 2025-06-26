import type { ExtensionRepositoryContract } from '../../domain/contracts/ExtensionRepository';
import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../../domain/dtos/ExtensionsDto';
import type { ApiErrorDto } from '../../domain/dtos/AuthDto';
import { Either, left, right } from '../../utils/Either';
import axios, { AxiosError } from 'axios';

export class ExtensionRepository implements ExtensionRepositoryContract {
  private readonly baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') {
    this.baseUrl = baseUrl
  }

  async getExtensions(
    request: ExtensionListRequestDto,
  ): Promise<Either<ApiErrorDto, ExtensionListResponseDto>> {
    try {
      const response = await axios.get(`${this.baseUrl}/my/extensions`, {
        headers: {
          Authorization: `${request.token}`,
          Accept: 'application/json',
        },
      })
      
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
}