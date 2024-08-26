import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FilterMoviesDto {
  @ApiPropertyOptional({ description: 'Filter by date (if empty, returns sessions from this day onwards)', example: '2024-08-21' })
  @IsOptional()
  @IsDateString()
  date?: string

  @ApiPropertyOptional({ description: 'Filter by age restriction', example: 13, minimum: 0, maximum: 24 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24)
  @Transform(({ value }) => parseInt(value))
  ageRestriction?: number

  @ApiPropertyOptional({ description: 'Filter by movie name', example: 'Inception' })
  @IsOptional()
  @IsString()
  movieName?: string

  @ApiPropertyOptional({ description: 'Order by ASC or DESC', example: 'ASC', default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'orderBy must be either ASC or DESC' })
  orderBy?: 'ASC' | 'DESC'
}
