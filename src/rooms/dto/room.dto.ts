import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'
import { CreateRoomDto } from './create-room.dto'

export class RoomDto extends CreateRoomDto {
  @ApiProperty({ description: 'The ID of the room', example: '789e1234-b67c-89d1-a234-426614174000' })
  @IsUUID()
  id: string

  @ApiProperty({ description: 'Room number, must be unique', example: 'Room 101' })
  @IsString()
  room_number: string
}
