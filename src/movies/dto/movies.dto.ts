import { Type } from 'class-transformer'
import { MovieDto } from './movie.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'

export class MoviesDto {
  @ApiProperty({ description: 'List of movies', type: [MovieDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieDto)
  movies: MovieDto[]
}
