import { IsArray, ValidateNested } from 'class-validator'
import { TicketDto } from './ticket.dto'
import { Type } from 'class-transformer'

export class TicketsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[]
}
