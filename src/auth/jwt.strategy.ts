import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { JwtUserPayload, jwtUserPayload } from '../utils/types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    })
  }

  async validate(user: JwtUserPayload) {
    // can be checked from users service in the future
    const parsedPayload = jwtUserPayload.safeParse(user)
    if (!parsedPayload.success || !user.id) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }
    return user
  }
}
