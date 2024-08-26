import { IsDateString, IsEnum, IsUUID, Validate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { MovieDto } from '../../movies/dto/movie.dto'
import { RoomDto } from '../../rooms/dto/room.dto'
import { TimeSlot } from '../../utils/common.enums'

export class MovieSessionDto {
  @ApiProperty({ description: 'The ID of the movie session', example: '456e7890-c123-45d6-e789-123456789abc' })
  @IsUUID()
  id: string

  @ApiProperty({ description: 'The date of the movie session', example: '2024-08-21' })
  @IsDateString()
  date: string

  @ApiProperty({ description: 'The time slot for the movie session', enum: TimeSlot, example: TimeSlot.Slot1 })
  @IsEnum(TimeSlot)
  time_slot: TimeSlot

  @ApiProperty({ description: 'Details of the movie' })
  @Validate(MovieDto)
  movie: MovieDto

  @ApiProperty({ description: 'Details of the room' })
  @Validate(RoomDto)
  room: RoomDto
}
