import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CreateTicketDto {
  @ApiProperty({ description: 'ID of the movie session', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  session_id: string
}
