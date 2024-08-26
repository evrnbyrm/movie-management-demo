import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class SignInDto {
  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  username: string

  @ApiProperty({ description: 'Password of the user', example: 'password' })
  @IsString()
  password: string
}
