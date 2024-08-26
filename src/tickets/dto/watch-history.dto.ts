import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsEnum, IsString, IsUUID, ValidateNested } from 'class-validator'
import { TimeSlot } from '../../utils/common.enums'

class HistoryDto {
  @ApiProperty({ description: 'ID of the watch history entry', example: '789e1234-b67c-89d1-a234-426614174000' })
  @IsUUID()
  id: string

  @ApiProperty({ description: 'Time slot when the movie was watched', enum: TimeSlot, example: TimeSlot.Slot1 })
  @IsEnum(TimeSlot)
  time_slot: TimeSlot

  @ApiProperty({ description: 'Date and time when the movie was watched', example: '2024-08-21T12:34:56Z' })
  @IsDateString()
  watched_at: string

  @ApiProperty({ description: 'Name of the movie that was watched', example: 'Batman' })
  @IsString()
  movie: string
}

export class WatchHistoryDto {
  @ApiProperty({ description: 'List of watch history entries', type: [HistoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryDto)
  watchHistory: HistoryDto[]
}
