import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsUUID } from 'class-validator'
import { TimeSlot } from '../../utils/common.enums'

export class CreateMovieSessionDto {
  @ApiProperty({ description: 'Date of the movie session', example: '2024-08-21' })
  @IsDateString()
  date: string

  @ApiProperty({ description: 'Time slot for the movie session', enum: TimeSlot, example: TimeSlot.Slot1 })
  @IsEnum(TimeSlot)
  time_slot: TimeSlot

  @ApiProperty({ description: 'ID of the movie', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  movie_id: string

  @ApiProperty({ description: 'ID of the room', example: '789e1234-b67c-89d1-a234-426614174000' })
  @IsUUID()
  room_id: string
}
