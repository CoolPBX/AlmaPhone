import type { ExtensionRepositoryContract } from '../../domain/contracts/ExtensionRepository';
import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../../domain/dtos/ExtensionsDto';
import type { ApiErrorDto } from '../../domain/dtos/AuthDto';
import { Either, left, right } from '../../utils/Either';
import axios, { AxiosError } from 'axios';

export class ExtensionRepository implements ExtensionRepositoryContract {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://coolpbx.local') {
    this.baseUrl = baseUrl;
  }

  async getExtensions(request: ExtensionListRequestDto): Promise<Either<ApiErrorDto, ExtensionListResponseDto>> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/my/extensions`, {
        headers: {
          'Authorization': `${request.token}`,
          'Accept': 'application/json'
        }
      });

      return right(response.data);
    } catch (error) {
      return left(this.handleError(error));
    }
  }

  private handleError(error: any): ApiErrorDto {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const data = axiosError.response.data as any;
        return {
          message: data.message || 'An error occurred',
          status: axiosError.response.status,
          errors: data.errors || undefined
        };
      }
      
      if (axiosError.request) {
        return {
          message: 'Network error - No response from server',
          status: 0
        };
      }
    }

    return {
      message: error.message || 'Unknown error occurred',
      status: 500
    };
  }
}