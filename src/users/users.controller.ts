import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { AuthGuard } from '@nestjs/passport'
import { SignInDto } from './dto/sign-in.dto'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SignInResponseDto } from './dto/sign-in-response.dto'
import { UsersDto } from './dto/users.dto'
import { UserDto } from './dto/user.dto'
import { GetUser } from '../auth/get-user.decorator'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../utils/common.enums'
import { JwtUserPayload } from '../utils/types'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up as a new customer' })
  @ApiResponse({ status: 201, description: 'Customer has been successfully created.', type: UserDto })
  @ApiResponse({ status: 409, description: 'Username is already in use.' })
  create(@Body() data: CreateCustomerDto): Promise<UserDto> {
    return this.usersService.signUp(data)
  }

  @Post('/create-user')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Manager role required)', description: 'Accessible by: **Manager** role' })
  @ApiResponse({ status: 201, description: 'User has been successfully created.', type: UserDto })
  @ApiResponse({ status: 409, description: 'Username is already in use.' })
  createUser(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.usersService.createUser(data)
  }

  @Get('/my-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile details (Authenticated users only)' })
  @ApiResponse({ status: 200, description: 'User profile details.', type: UserDto })
  getProfile(@GetUser() user: JwtUserPayload): Promise<UserDto> {
    return this.usersService.findUser(user.id)
  }

  @Get('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user details by ID (Manager role required)', description: 'Accessible by: **Manager** role' })
  @ApiParam({ name: 'id', description: 'The ID of the user', type: String })
  @ApiResponse({ status: 200, description: 'User details.', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findUser(id)
  }

  @Get()
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of all users (Manager role required)', description: 'Accessible by: **Manager** role' })
  @ApiResponse({ status: 200, description: 'List of all users.', type: UsersDto })
  getAllUsers(): Promise<UsersDto> {
    return this.usersService.findAllUsers()
  }

  @Delete('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID (Manager role required)', description: 'Accessible by: **Manager** role' })
  @ApiParam({ name: 'id', description: 'The ID of the user to be deleted', type: String })
  @ApiResponse({ status: 200, description: 'User has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeUser(@Param('id') id: string): Promise<void> {
    return this.usersService.removeUser(id)
  }

  @Patch('/update-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile details (Authenticated users only)' })
  @ApiResponse({ status: 200, description: 'Profile has been successfully updated.', type: UserDto })
  @ApiResponse({ status: 409, description: 'Username is already in use.' })
  updateUser(@GetUser() user: JwtUserPayload, @Body() body: UpdateProfileDto): Promise<UserDto> {
    return this.usersService.updateUser(user.id, body)
  }

  @Patch('/change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (Authenticated users only)' })
  @ApiResponse({ status: 200, description: 'Password has been successfully changed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changePassword(@GetUser() user: JwtUserPayload, @Body() body: ChangePasswordDto): Promise<void> {
    return this.usersService.changePassword(user, body)
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in to get an access token' })
  @ApiResponse({ status: 200, description: 'Sign in successful.', type: SignInResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.usersService.signIn(signInDto)
  }
}
