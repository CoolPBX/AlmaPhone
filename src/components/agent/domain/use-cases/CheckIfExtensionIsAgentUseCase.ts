import type { AgentRepositoryContract } from '../../domain/contracts/AgentRepositoryContracts'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import type { AgentItemDto } from '../schemas/AgentSchemas'
import { Either, left, right } from '@/utils/Either'

export class CheckIfExtensionIsAgentUseCase {
  constructor(private agentRepository: AgentRepositoryContract) {}

  async execute(
    token: string,
    extension: string,
  ): Promise<Either<ApiErrorDto, AgentItemDto | null>> {
    if (!token || token.trim() === '') {
      return left({
        message: 'Authentication token is required',
        status: 401,
      })
    }

    if (!extension || extension.trim() === '') {
      return left({
        message: 'Extension is required',
        status: 400,
      })
    }

    try {
      const result = await this.agentRepository.getMyAgents({ token })

      return result.fold(
        (error) => left(error),
        (response) => {
          const agentInfo = response.data.find((agent) => {
            const match = agent.agent_contact.match(/user\/(\d+)@/)
            const agentExtension = match ? match[1] : null

            return agentExtension === extension
          })

          return right(agentInfo || null)
        },
      )
    } catch {
      return left({
        message: 'Network error occurred while checking agent status',
        status: 500,
      })
    }
  }
}
