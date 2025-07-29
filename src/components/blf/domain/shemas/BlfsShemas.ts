import { z } from 'zod'

// BLF schemas
export const BlfItemSchema = z.object({
  id: z.string().uuid().optional(), // Para identificar BLFs localmente
  extension: z.string().min(1, 'Extension is required'),
  label: z.string().min(1, 'Label is required'),
  status: z.enum(['idle', 'busy', 'ringing', 'unavailable']).default('idle'),
})

export type BlfItemDto = z.infer<typeof BlfItemSchema>