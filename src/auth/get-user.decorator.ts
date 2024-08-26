import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtUserPayload } from '../utils/types'

export const GetUser = createParamDecorator((_, ctx: ExecutionContext): JwtUserPayload => {
  const req = ctx.switchToHttp().getRequest()
  return req.user
})
