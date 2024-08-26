import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { TimeSlot } from '../../utils/common.enums'

export class SessionDto {
  @ApiProperty({ description: 'Room ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  room_id: string

  @ApiProperty({ description: 'Room number', example: 'Room 101' })
  @IsString()
  room_number: string

  @ApiProperty({ description: 'Session ID', example: '456e1234-b67c-89d1-a234-426614174000' })
  @IsString()
  sessionId: string

  @ApiProperty({ description: 'Date of the session', example: '2024-08-21' })
  @IsString()
  date: string

  @ApiProperty({ description: 'Time slot of the session', enum: TimeSlot, example: TimeSlot.Slot1 })
  @IsEnum(TimeSlot)
  timeSlot: TimeSlot
}

export class MovieWithSessions {
  @ApiProperty({ description: 'Movie ID', example: '789e4567-b89d-23c4-d567-426614174000' })
  @IsString()
  movieId: string

  @ApiProperty({ description: 'Title of the movie', example: 'Inception' })
  @IsString()
  movieTitle: string

  @ApiProperty({ description: 'Sessions associated with the movie', type: () => SessionDto, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => SessionDto)
  sessions: Record<string, SessionDto[]>
}

export class MoviesWithSessionsDto {
  @ApiProperty({ description: 'List of movies with their respective sessions', type: [MovieWithSessions] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieWithSessions)
  movies: MovieWithSessions[]
}
