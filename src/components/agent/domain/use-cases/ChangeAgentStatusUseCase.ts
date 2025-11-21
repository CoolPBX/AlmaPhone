import type { AgentRepositoryContract } from '../../domain/contracts/AgentRepositoryContracts'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import { Either, left } from '@/utils/Either'

export class ChangeAgentStatusUseCase {
  constructor(private agentRepository: AgentRepositoryContract) {}

  async execute(
    token: string,
    agentName: string,
    status: string,
  ): Promise<Either<ApiErrorDto, { success: boolean }>> {
    if (!token || token.trim() === '') {
      return left({
        message: 'Authentication token is required',
        status: 401,
      })
    }

    if (!agentName || agentName.trim() === '') {
      return left({
        message: 'Agent name is required',
        status: 400,
      })
    }

    if (!status || status.trim() === '') {
      return left({
        message: 'Status is required',
        status: 400,
      })
    }

    try {
      return await this.agentRepository.changeAgentStatus({ token, agent_name: agentName, status })
    } catch {
      return left({
        message: 'Network error occurred while changing agent status',
        status: 500,
      })
    }
  }
}