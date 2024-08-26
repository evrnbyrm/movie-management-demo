import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password of the user', example: 'oldPassword' })
  @IsString()
  oldPassword: string

  @ApiProperty({ description: 'The new password of the user', example: 'newPassword' })
  @IsString()
  newPassword: string
}
