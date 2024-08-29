import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator'

export class CreateCustomerDto {
  @ApiProperty({ description: 'Username of the user, cannot be empty', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ description: 'Password of the user, minimum 7 characters', example: 'password' })
  @IsString()
  @MinLength(7)
  password: string

  @ApiProperty({ description: 'Age of the user', example: 30 })
  @IsInt()
  @Min(0)
  @Max(200)
  age: number
}
