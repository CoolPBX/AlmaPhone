import type { ExtensionRepositoryContract } from '../../contracts/ExtensionRepositoryContracts'
import type {
  ExtensionListRequestDto,
  ExtensionListResponseDto,
} from '../../schemas/ExtensionSchemas'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import { Either, left } from '@/utils/Either'

export class GetExtensionsUseCase {
  constructor(private extensionRepository: ExtensionRepositoryContract) {}

  async execute(token: string): Promise<Either<ApiErrorDto, ExtensionListResponseDto>> {
    if (!token || token.trim() === '') {
      return left({
        message: 'Authentication token is required',
        status: 401,
      })
    }

    const request: ExtensionListRequestDto = { token }

    try {
      return await this.extensionRepository.getExtensions(request)
    } catch {
      return left({
        message: 'Network error occurred while fetching extensions',
        status: 500,
      })
    }
  }
}
