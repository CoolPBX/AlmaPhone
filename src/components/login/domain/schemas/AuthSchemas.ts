import { z } from 'zod'

// Request schemas
export const LoginRequestSchema = z.object({
  user_email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Response schemas
export const UserDataSchema = z.object({
  // user_uuid: z.string().uuid('Invalid user UUID'),
  // domain_uuid: z.string().uuid('Invalid domain UUID'),
  // contact_uuid: z.string().uuid('Invalid contact UUID').nullable(),
  username: z.string().min(1, 'Username is required'),
  user_email: z.string().email('Invalid email format'),
  user_status: z.string().nullable(),
  api_key: z.string().min(1, 'API key is required'),
  // user_totp_secret: z.string().nullable(),
  // user_enabled: z.string().min(1, 'User enabled status is required'),
  // add_user: z.string().nullable(),
  // add_date: z.string().nullable(),
  // insert_date: z.string().nullable(),
  // insert_user: z.string().nullable(),
  // update_date: z.string().min(1, 'Update date is required'),
  // update_user: z.string().min(1, 'Update user is required'),
})

export const AvailableExtensionsSchema = z.object({
  api_key: z.string().min(1, 'API key is required'),
  extension_uuid: z.string().uuid('Invalid extension UUID'),
  domain_uuid: z.string().uuid('Invalid domain UUID'),
  extension: z.string().min(1, 'Extension is required'),
  password: z.string().min(1, 'Password is required'),
})

export const LoginResponseSchema = z.object({
  data: UserDataSchema,
  //   available_extensions: AvailableExtensionsSchema,
})

export const ApiErrorSchema = z.object({
  message: z.string().min(1, 'Error message is required'),
  status: z.number().int().min(100).max(599, 'Invalid HTTP status code'),
  errors: z.record(z.array(z.string())).optional(),
})

// Type inference from schemas
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>
export type UserDataDto = z.infer<typeof UserDataSchema>
// export type AvailableExtensionsDto = z.infer<typeof AvailableExtensionsSchema>
export type LoginResponseDto = z.infer<typeof LoginResponseSchema>
export type ApiErrorDto = z.infer<typeof ApiErrorSchema>
