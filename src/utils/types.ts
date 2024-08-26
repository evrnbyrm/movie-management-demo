import { UserRole } from './common.enums'
import z from 'zod'

export const jwtUserPayload = z.object({
  id: z.string().uuid(),
  username: z.string(),
  age: z.number(),
  role: z.nativeEnum(UserRole),
})
export type JwtUserPayload = z.infer<typeof jwtUserPayload>
