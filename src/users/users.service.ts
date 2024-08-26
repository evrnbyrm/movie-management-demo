import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import * as bc from 'bcryptjs'
import { SignInDto } from './dto/sign-in.dto'
import { JwtService } from '@nestjs/jwt'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UsersDto } from './dto/users.dto'
import { SignInResponseDto } from './dto/sign-in-response.dto'
import { UserRole } from '../utils/common.enums'
import { JwtUserPayload, jwtUserPayload } from '../utils/types'

const SALT_LENGTH = 10

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateCustomerDto, role = UserRole.Customer): Promise<User> {
    const { password, username } = createUserDto

    if (!(await this.isUsernameAvailable(username))) {
      throw new ConflictException(`User with username: ${username} already exists`)
    }
    createUserDto.password = await bc.hash(password, SALT_LENGTH)

    const user = this.userRepository.create({ ...createUserDto, role })
    return this.userRepository.save(user)
  }

  async createUser(createCustomer: CreateUserDto): Promise<User> {
    const { role, ...createUserDto } = createCustomer
    return this.signUp(createUserDto, role)
  }

  async findAllUsers(): Promise<UsersDto> {
    const users = await this.userRepository.find()
    return { users }
  }

  async findUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`Cannot find user with ID: ${id}`)
    }
    return user
  }

  async updateUser(id: string, updateUserDto: UpdateProfileDto): Promise<User> {
    const user = await this.findUser(id)
    const { username } = updateUserDto
    if (username && !(await this.isUsernameAvailable(username))) {
      throw new ConflictException(`User with username: ${username} already exists`)
    }

    Object.assign(user, updateUserDto)
    return this.userRepository.save(user)
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findUser(id)
    await this.userRepository.remove(user)
  }

  async changePassword(requestUser: JwtUserPayload, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findUser(requestUser.id)
    const { newPassword, oldPassword } = changePasswordDto
    if (!bc.compareSync(oldPassword, user.password)) {
      throw new UnauthorizedException('Old password you entered is incorrect')
    }
    user.password = await bc.hash(newPassword, SALT_LENGTH)
    await this.userRepository.save(user)
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { username }, select: ['username'] })
    return !existingUser
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    const { password, username } = signInDto
    const user = await this.userRepository.findOne({ where: { username }, select: ['age', 'id', 'password', 'username', 'role'] })

    if (user && (await bc.compare(password, user.password))) {
      const accessToken = this.jwtService.sign(jwtUserPayload.parse(user)) // parsing to drop password (can be used in other table columns)
      return { accessToken }
    } else {
      throw new UnauthorizedException('Please check your credentials')
    }
  }
}
