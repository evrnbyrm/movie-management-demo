import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '../../utils/common.enums'

export class UserDto {
  @ApiProperty({ description: 'The ID of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string

  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  username: string

  @ApiProperty({ description: 'Age of the user', example: 30 })
  @IsInt()
  @Min(0)
  @Max(200)
  age: number

  @ApiPropertyOptional({ description: 'Role of the user', enum: UserRole, example: UserRole.Manager })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole
}
