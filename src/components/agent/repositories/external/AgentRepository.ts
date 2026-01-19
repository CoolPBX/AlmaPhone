import type { AgentRepositoryContract } from '../../domain/contracts/AgentRepositoryContracts'
import type {
  CheckAgentRequestDto,
  AgentListResponseDto,
  ChangeAgentStatusRequestDto,
} from '../../domain/schemas/AgentSchemas'
import type { ApiErrorDto } from '@/components/login/domain/schemas/AuthSchemas'
import {
  CheckAgentRequestSchema,
  AgentListResponseSchema,
  ChangeAgentStatusRequestSchema,
} from '../../domain/schemas/AgentSchemas'
import { Either, left, right } from '@/utils/Either'
import axios, { AxiosError } from 'axios'
import config from '@/config'

export class AgentRepository implements AgentRepositoryContract {
  private readonly baseUrl: string

  constructor(baseUrl: string = config.api.baseUrl) {
    this.baseUrl = baseUrl
  }

  async getMyAgents(
    request: CheckAgentRequestDto,
  ): Promise<Either<ApiErrorDto, AgentListResponseDto>> {
    CheckAgentRequestSchema.parse(request)

    try {
      const response = await axios.get(`${this.baseUrl}/my/agents`, {
        headers: {
          Authorization: `${request.token}`,
          Accept: 'application/json',
        },
      })

      const validatedData = AgentListResponseSchema.parse(response.data)
      return right(validatedData)
    } catch (error) {
      return left(this.handleError(error))
    }
  }

  async changeAgentStatus(
    request: ChangeAgentStatusRequestDto,
  ): Promise<Either<ApiErrorDto, { success: boolean }>> {
    ChangeAgentStatusRequestSchema.parse(request)

    try {
      const response = await axios.patch(
        `${this.baseUrl}/my/agent/${request.agent_uuid}`, 
        {
          agent_status: request.status, 
        },
        {
          headers: {
            Authorization: `${request.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )

      console.log('Change status response:', response.data)

      return right({
        success: response.data.message === 'Agent updated successfully',
      })
    } catch (error) {
      return left(this.handleError(error))
    }
  }

  private handleError(error: unknown): ApiErrorDto {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        console.error('API Error:', axiosError.response)
        return {
          message: 'Whoops! Something went wrong.',
          status: axiosError.response.status,
        }
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request)
        return {
          message: 'No response from server',
          status: 0,
        }
      }
    }

    console.error('Unknown error:', error)
    return {
      message: 'An unknown error occurred',
      status: 500,
    }
  }
}
