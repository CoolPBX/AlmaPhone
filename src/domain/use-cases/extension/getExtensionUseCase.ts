import type { ExtensionRepositoryContract } from '../../contracts/ExtensionRepository'
import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../../dtos/ExtensionsDto'
import type { ApiErrorDto } from '../../dtos/AuthDto'
import { Either, left } from '../../../utils/Either'

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
