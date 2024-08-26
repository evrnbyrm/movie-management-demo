import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { RoomDto } from './room.dto'

export class RoomsDto {
  @ApiProperty({ description: 'List of rooms', type: [RoomDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms: RoomDto[]
}
