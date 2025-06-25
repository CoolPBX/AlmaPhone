import type { AuthRepositoryContract } from '../../contracts/AuthRepositoryContracts';
import type { LoginRequestDto, LoginResponseDto, ApiErrorDto } from '../../dtos/AuthDto';
import { Either } from '../../../utils/Either';

export class LoginUseCase {
  constructor(private authRepository: AuthRepositoryContract) {}

  async execute(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>> {
    // Validaciones básicas
    if (!credentials.user_email || !credentials.password) {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Username and password are required',
          status: 400
        })
      } as any;
    }

    // Validar formato de email si es necesario
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.user_email)) {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Invalid email format',
          status: 400
        })
      } as any;
    }

    try {
      return await this.authRepository.login(credentials);
    } catch (error) {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Network error occurred',
          status: 500
        })
      } as any;
    }
  }
}
