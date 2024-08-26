import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'
import { UserDto } from './user.dto'

export class UsersDto {
  @ApiProperty({ description: 'List of users', type: [UserDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[]
}
