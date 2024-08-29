import { IsString, IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateRoomDto {
  @ApiProperty({ description: 'Room number, must be unique and not empty', example: 'Room 101' })
  @IsString()
  @IsNotEmpty()
  room_number: string

  @ApiPropertyOptional({ description: 'Optional capacity of the room', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number // Optional capacity field
}
