import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { MovieSessionDto } from './movie-session.dto'

export class MovieSessionsDto {
  @ApiProperty({ description: 'List of movie sessions', type: [MovieSessionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieSessionDto)
  sessions: MovieSessionDto[]
}
