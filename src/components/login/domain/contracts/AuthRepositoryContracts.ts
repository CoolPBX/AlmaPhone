import type {
  LoginRequestDto,
  LoginResponseDto,
} from '@/components/login/domain/schemas/AuthSchemas'
import type { Either } from '@/utils/Either'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'

export interface AuthRepositoryContract {
  login(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>>
  logout(): Promise<Either<ApiErrorDto, void>>
  refreshToken(): Promise<Either<ApiErrorDto, LoginResponseDto>>
}
