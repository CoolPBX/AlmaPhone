import { z } from 'zod'

// Request schemas
export const ExtensionListRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

// Response schemas
export const ExtensionItemSchema = z.object({
  extension_uuid: z.string().uuid('Invalid extension UUID'),
  domain_uuid: z.string().uuid('Invalid domain UUID'),
  extension: z.string().min(1, 'Extension is required'),
  password: z.string().min(1, 'Password is required'),
  description: z.string().nullable(),
  enabled: z.boolean().optional(),
})

export const ExtensionListResponseSchema = z.object({
  data: z.array(ExtensionItemSchema),
  meta: z
    .object({
      total: z.number().int().nonnegative('Total must be a non-negative integer'),
      per_page: z.number().int().positive('Per page must be a positive integer'),
      current_page: z.number().int().positive('Current page must be a positive integer'),
    })
    .optional(),
})

// Type inference from schemas
export type ExtensionListRequestDto = z.infer<typeof ExtensionListRequestSchema>
export type ExtensionItemDto = z.infer<typeof ExtensionItemSchema>
export type ExtensionListResponseDto = z.infer<typeof ExtensionListResponseSchema>
