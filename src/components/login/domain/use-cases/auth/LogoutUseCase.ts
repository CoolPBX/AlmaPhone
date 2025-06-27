import { left, type Either } from '@/utils/Either'
import type { AuthRepositoryContract } from '../../contracts/AuthRepositoryContracts'
import type { ApiErrorDto } from '../../schemas/AuthSchemas'

export class LogoutUseCase {
  constructor(private authRepository: AuthRepositoryContract) {}

  async execute(): Promise<Either<ApiErrorDto, void>> {
    try {
      return await this.authRepository.logout()
    } catch {
      return left({
        message: 'Network error occurred during logout',
        status: 500,
      })
    }
  }
}
