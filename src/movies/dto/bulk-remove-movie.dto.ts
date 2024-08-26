import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator'

export class BulkRemoveMoviesDto {
  @ApiProperty({
    description: 'Array of movie IDs to delete',
    type: String,
    isArray: true,
    example: ['e0bf9c37-1a73-4c7a-a5ef-36e7068acdc0', '79954881-bc94-41c9-8b82-e95e529823df'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids: string[]
}
