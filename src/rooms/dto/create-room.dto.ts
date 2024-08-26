import { IsString, IsOptional, IsInt, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateRoomDto {
  @ApiProperty({ description: 'Room number, must be unique', example: 'Room 101' })
  @IsString()
  room_number: string

  @ApiPropertyOptional({ description: 'Optional capacity of the room', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number // Optional capacity field
}
