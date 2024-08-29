import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator'

export class CreateMovieDto {
  @ApiProperty({ description: 'Name of the movie, cannot be empty', example: 'Inception' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Age restriction for the movie', example: 13, minimum: 0, maximum: 24 })
  @IsInt()
  @Min(0)
  @Max(24)
  age_restriction: number
}
