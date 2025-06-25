import type { ExtensionRepositoryContract } from '../../contracts/ExtensionRepository';
import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../../dtos/ExtensionsDto';
import type { ApiErrorDto } from '../../dtos/AuthDto';
import { Either } from '../../../utils/Either';

export class GetExtensionsUseCase {
  constructor(private extensionRepository: ExtensionRepositoryContract) {}

  async execute(token: string): Promise<Either<ApiErrorDto, ExtensionListResponseDto>> {
    if (!token || token.trim() === '') {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Authentication token is required',
          status: 401
        })
      } as any;
    }

    const request: ExtensionListRequestDto = { token };

    try {
      return await this.extensionRepository.getExtensions(request);
    } catch (error) {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Failed to fetch extensions',
          status: 500
        })
      } as any;
    }
  }
}