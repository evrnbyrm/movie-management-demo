import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { CreateMovieDto } from './create-movie.dto'
import { ApiProperty } from '@nestjs/swagger'

export class BulkCreateMoviesDto {
  @ApiProperty({ description: 'List of movies to be created in bulk', type: [CreateMovieDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovieDto)
  movies: CreateMovieDto[]
}
