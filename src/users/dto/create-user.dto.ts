import { IsEnum, IsOptional } from 'class-validator'
import { UserRole } from '../../utils/common.enums'
import { CreateCustomerDto } from './create-customer.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto extends CreateCustomerDto {
  @ApiPropertyOptional({ description: 'Role of the user', enum: UserRole, example: UserRole.Manager })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole
}
