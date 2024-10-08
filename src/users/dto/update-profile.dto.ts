import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'New username of the user, cannot be empty', example: 'john_doe_updated' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string

  @ApiPropertyOptional({ description: 'New age of the user', example: 31 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  age?: number
}
