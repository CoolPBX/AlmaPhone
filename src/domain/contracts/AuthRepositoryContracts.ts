import type { LoginRequestDto, LoginResponseDto } from '../dtos/AuthDto';
import type { Either } from '../../utils/Either';
import type { ApiErrorDto } from '../dtos/AuthDto';

export interface AuthRepositoryContract {
  login(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>>;
  logout(): Promise<Either<ApiErrorDto, void>>;
  refreshToken(): Promise<Either<ApiErrorDto, LoginResponseDto>>;
}