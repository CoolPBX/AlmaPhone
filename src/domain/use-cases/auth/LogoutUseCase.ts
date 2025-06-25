import type { AuthRepositoryContract } from '../../contracts/AuthRepositoryContracts';
import type { ApiErrorDto } from '../../dtos/AuthDto';
import { Either } from '../../../utils/Either';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepositoryContract) {}

  async execute(): Promise<Either<ApiErrorDto, void>> {
    try {
      return await this.authRepository.logout();
    } catch (error) {
      return {
        isLeft: () => true,
        isRight: () => false,
        fold: (onLeft: any) => onLeft({
          message: 'Failed to logout',
          status: 500
        })
      } as any;
    }
  }
}
