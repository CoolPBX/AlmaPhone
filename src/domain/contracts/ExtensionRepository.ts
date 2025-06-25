import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../dtos/ExtensionsDto';
import type { Either } from '../../utils/Either';
import type { ApiErrorDto } from '../dtos/AuthDto';

export interface ExtensionRepositoryContract {
  getExtensions(request: ExtensionListRequestDto): Promise<Either<ApiErrorDto, ExtensionListResponseDto>>;
}