import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, Max, Min } from 'class-validator'

export class CreateCustomerDto {
  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  username: string

  @ApiProperty({ description: 'Password of the user', example: 'password' })
  @IsString()
  password: string

  @ApiProperty({ description: 'Age of the user', example: 30 })
  @IsInt()
  @Min(0)
  @Max(200)
  age: number
}
