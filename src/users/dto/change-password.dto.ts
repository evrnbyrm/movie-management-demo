import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password of the user', example: 'oldPassword' })
  @IsString()
  oldPassword: string

  @ApiProperty({ description: 'The new password of the user, minimum 7 characters', example: 'newPassword' })
  @IsString()
  @MinLength(7)
  newPassword: string
}
