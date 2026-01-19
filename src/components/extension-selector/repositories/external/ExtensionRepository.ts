import type { ExtensionRepositoryContract } from '../../domain/contracts/ExtensionRepositoryContracts'
import type {
  ExtensionListRequestDto,
  ExtensionListResponseDto,
} from '../../domain/schemas/ExtensionSchemas'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import {
  ExtensionListRequestSchema,
  ExtensionListResponseSchema,
} from '../../domain/schemas/ExtensionSchemas'
import { Either, left, right } from '@/utils/Either'
import axios, { AxiosError } from 'axios'
import config from '@/config'

export class ExtensionRepository implements ExtensionRepositoryContract {
  private readonly baseUrl: string

  constructor(baseUrl: string = config.api.baseUrl) {
    this.baseUrl = baseUrl
  }

  async getExtensions(
    request: ExtensionListRequestDto,
  ): Promise<Either<ApiErrorDto, ExtensionListResponseDto>> {
    ExtensionListRequestSchema.parse(request)

    try {
      const response = await axios.get(`${this.baseUrl}/my/extensions`, {
        headers: {
          Authorization: `${request.token}`,
          Accept: 'application/json',
        },
      })
      console.log('Response data:', response.data)
      const validatedData = ExtensionListResponseSchema.parse(response.data)
      return right(validatedData)
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
          message: 'No response from server',
          status: 0,
        }
      }
    }

    console.error('Unknown error:', error)
    return {
      message: 'An unknown error occurred',
      status: 500,
    }
  }
}
