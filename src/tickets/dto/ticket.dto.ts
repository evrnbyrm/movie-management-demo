import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsBoolean, IsDateString, Validate } from 'class-validator'
import { MovieSessionDto } from '../../sessions/dto/movie-session.dto'
import { UserDto } from '../../users/dto/user.dto'

export class TicketDto {
  @ApiProperty({ description: 'ID of the ticket', example: '456e7890-c123-45d6-e789-123456789abc' })
  @IsUUID()
  id: string

  @ApiProperty({ description: 'Date when the ticket was purchased', example: '2024-08-21T12:34:56Z' })
  @IsDateString()
  purchase_date: Date

  @ApiProperty({ description: 'Details of the user who purchased the ticket' })
  @Validate(UserDto)
  user: UserDto

  @ApiProperty({ description: 'Details of the movie session for which the ticket was purchased' })
  @Validate(MovieSessionDto)
  session: MovieSessionDto

  @ApiProperty({ description: 'Whether the ticket has been used', example: false })
  @IsBoolean()
  used: boolean
}
