import { IsUUID } from 'class-validator'
import { CreateMovieDto } from './create-movie.dto'
import { ApiProperty } from '@nestjs/swagger'

export class MovieDto extends CreateMovieDto {
  @ApiProperty({ description: 'The ID of the movie', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string
}
