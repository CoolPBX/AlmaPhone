import type { AuthRepositoryContract } from '@/components/login/domain/contracts/AuthRepositoryContracts'
import type {
  LoginRequestDto,
  LoginResponseDto,
  ApiErrorDto,
} from '@/components/login/domain/schemas/AuthSchemas'
import { Either, left } from '@/utils/Either'

export class LoginUseCase {
  constructor(private authRepository: AuthRepositoryContract) {}

  async execute(credentials: LoginRequestDto): Promise<Either<ApiErrorDto, LoginResponseDto>> {
    // Validaciones básicas
    if (!credentials.user_email || !credentials.password) {
      return left({
        message: 'Username and password are required',
        status: 400,
      })
    }

    // Validar formato de email si es necesario
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.user_email)) {
      return left({
        message: 'Invalid email format',
        status: 400,
      })
    }

    try {
      return await this.authRepository.login(credentials)
    } catch {
      return left({
        message: 'Network error occurred',
        status: 500,
      })
    }
  }
}
