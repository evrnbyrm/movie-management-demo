import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../users.service'
import { User } from '../user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { CreateCustomerDto } from '../dto/create-customer.dto'
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { getMockRepository, generateMockCustomer, generateMultiple, generateMockUser } from '../../../test/common'
import { UserRole } from '../../utils/common.enums'

describe('UsersService', () => {
  let service: UsersService
  let usersTable: Record<string, User>
  const jwtService = new JwtService({ secret: 'token' })

  beforeEach(async () => {
    usersTable = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: getMockRepository<User>(usersTable),
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a new customer', async () => {
    const user = generateMockCustomer()
    const createdUser = await service.signUp(user)

    expect(createdUser).toBeDefined()
    expect(compare(user.password, createdUser.password)).toBeTruthy()
  })

  it('should create customer even if role is given', async () => {
    const user = generateMockCustomer()
    const createdUser = await service.signUp({ ...user, role: UserRole.Manager } as CreateCustomerDto)

    expect(createdUser.role).toBe(UserRole.Customer)
    expect(Object.values(usersTable).length).toBe(1)
  })

  it('should throw ConflictException if username already exists', async () => {
    const user = generateMockCustomer()
    const createdUser = await service.signUp(user)
    expect(compare(user.password, createdUser.password)).toBeTruthy()

    jest.spyOn(service, 'isUsernameAvailable').mockResolvedValue(false)

    await expect(service.signUp(user)).rejects.toThrow(ConflictException)
  })

  it('should create user with desired Role', async () => {
    const user1 = generateMockCustomer()
    const user2 = generateMockCustomer()

    const createdUser1 = await service.createUser({ ...user1, role: UserRole.Customer })
    const createdUser2 = await service.createUser({ ...user2, role: UserRole.Manager })

    expect(createdUser1.role).toBe(UserRole.Customer)
    expect(createdUser2.role).toBe(UserRole.Manager)
  })

  it('should find user by id', async () => {
    const users = generateMultiple<CreateUserDto>(generateMockUser)
    const createdUsers = await Promise.all(users.map((u) => service.createUser(u)))

    const foundUser = await service.findUser(createdUsers[2].id)

    expect(foundUser).toBeDefined()
    expect(foundUser).toEqual({ ...createdUsers[2] })
  })

  it('should throw NotFoundException if user id does not exits', async () => {
    await Promise.all(generateMultiple<CreateUserDto>(generateMockUser).map((u) => service.createUser(u)))
    await expect(service.findUser('123456')).rejects.toThrow(NotFoundException)
  })

  it('should list all users', async () => {
    expect((await service.findAllUsers()).users).toEqual([])

    const users = generateMultiple<CreateUserDto>(generateMockUser, 20)
    await Promise.all(users.map((u) => service.createUser(u)))

    const dbUsers = await service.findAllUsers()
    expect(users.every((user) => !!dbUsers.users.find((u) => u.username === user.username))).toBeTruthy()
  })

  it('should update a user profile', async () => {
    const user = await service.createUser(generateMockUser())
    const username = 'mockUsername'

    const updatedUser = await service.updateUser(user.id, { username })
    expect(updatedUser.username).toBe(username)
    expect(updatedUser.id).toBe(user.id)
    expect(usersTable[user.id]).toEqual({ ...user, username })
  })

  it('should not update user profile when user not found', async () => {
    await service.createUser(generateMockUser())
    await expect(service.updateUser('123456', { age: 23 })).rejects.toThrow(NotFoundException)
  })

  it('should not update user profile when username already exists', async () => {
    const users = await Promise.all(generateMultiple<CreateUserDto>(generateMockUser, 2).map((u) => service.createUser(u)))
    await expect(service.updateUser(users[0].id, { username: users[1].username })).rejects.toThrow(ConflictException)
  })

  it('should remove user by id', async () => {
    const users = await Promise.all(generateMultiple<CreateUserDto>(generateMockUser).map((u) => service.createUser(u)))
    const userToRemove = users[0]

    expect(usersTable[userToRemove.id]).toBeDefined()

    await service.removeUser(userToRemove.id)
    await expect(service.findUser(userToRemove.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw NotFoundException on remove if user id does not exits', async () => {
    await Promise.all(generateMultiple<CreateUserDto>(generateMockUser).map((u) => service.createUser(u)))
    await expect(service.removeUser('12344556')).rejects.toThrow(NotFoundException)
  })

  it('should sign in user', async () => {
    const user = generateMockCustomer()
    const password = user.password
    const { id } = await service.signUp(user)

    expect(usersTable[id]).toBeDefined()
    const token = await service.signIn({ username: user.username, password })
    expect(jwtService.decode(token.accessToken).id).toBe(id)
  })

  it('should not sign in user if credentials are invalid', async () => {
    const user = generateMockCustomer()
    const password = user.password
    const { id } = await service.signUp(user)

    expect(usersTable[id]).toBeDefined()
    await expect(service.signIn({ username: user.username, password: '1234' })).rejects.toThrow(UnauthorizedException)
    await expect(service.signIn({ username: 'mockName', password: password })).rejects.toThrow(UnauthorizedException)
  })

  it('should change password', async () => {
    const user = generateMockUser()
    const oldPassword = user.password
    const createdUser = await service.signUp(user)

    await service.changePassword(createdUser, { oldPassword, newPassword: '123' })
    const token = await service.signIn({ username: user.username, password: '123' })
    expect(jwtService.decode(token.accessToken).username).toBe(user.username)
  })

  it('should change password', async () => {
    const createdUser = await service.signUp(generateMockUser())

    await expect(service.changePassword(createdUser, { oldPassword: '123', newPassword: '234' })).rejects.toThrow(UnauthorizedException)
  })
})
