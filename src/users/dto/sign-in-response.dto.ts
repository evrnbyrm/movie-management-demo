import { ApiProperty } from '@nestjs/swagger'

export class SignInResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  accessToken: string
}
