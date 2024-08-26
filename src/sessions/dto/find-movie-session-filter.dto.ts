import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class FindMovieSessionsFiter {
  @ApiPropertyOptional({ description: 'Filter by date', example: '2024-08-21' })
  @IsDateString()
  @IsOptional()
  date: string
}
