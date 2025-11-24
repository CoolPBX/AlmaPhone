import type { Either } from '@/utils/Either'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import type {
  CheckAgentRequestDto,
  AgentListResponseDto,
  ChangeAgentStatusRequestDto,
} from '../../../agent/domain/schemas/AgentSchemas'

export interface AgentRepositoryContract {
  getMyAgents(request: CheckAgentRequestDto): Promise<Either<ApiErrorDto, AgentListResponseDto>>

  changeAgentStatus(
    request: ChangeAgentStatusRequestDto,
  ): Promise<Either<ApiErrorDto, { success: boolean }>>
}