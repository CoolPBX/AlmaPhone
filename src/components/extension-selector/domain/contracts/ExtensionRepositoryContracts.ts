import type { Either } from '@/utils/Either'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import type { ExtensionListRequestDto, ExtensionListResponseDto } from '../schemas/ExtensionSchemas'

export interface ExtensionRepositoryContract {
  getExtensions(
    request: ExtensionListRequestDto,
  ): Promise<Either<ApiErrorDto, ExtensionListResponseDto>>
}
