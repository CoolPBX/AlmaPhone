import { z } from 'zod'


export const AgentItemSchema = z.object({
  agent_name: z.string().min(1, 'Agent name is required'),
  agent_type: z.string(),
  agent_call_timeout: z.number().int(),
  agent_id: z.string().nullable(),
  agent_contact: z.string().min(1, 'Agent contact is required'),
  agent_status: z.string().min(1, 'Agent status is required'),
  agent_logout: z.string().nullable(),
  agent_max_no_answer: z.number().int(),
  agent_wrap_up_time: z.number().int(),
  agent_reject_delay_time: z.number().int(),
  agent_busy_delay_time: z.number().int(),
  agent_no_answer_delay_time: z.number().int(),
  agent_record: z.boolean(),
})

export const AgentListResponseSchema = z.object({
  data: z.array(AgentItemSchema),
})

export const CheckAgentRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const ChangeAgentStatusRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  agent_name: z.string().min(1, 'Agent name is required'),
  status: z.string().min(1, 'Status is required'),
})

export type AgentItemDto = z.infer<typeof AgentItemSchema>
export type AgentListResponseDto = z.infer<typeof AgentListResponseSchema>
export type CheckAgentRequestDto = z.infer<typeof CheckAgentRequestSchema>
export type ChangeAgentStatusRequestDto = z.infer<typeof ChangeAgentStatusRequestSchema>