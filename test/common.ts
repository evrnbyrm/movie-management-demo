import { faker } from '@faker-js/faker'
import { CreateRoomDto } from '../src/rooms/dto/create-room.dto'
import { Room } from '../src/rooms/room.entity'
import { Movie } from '../src/movies/movie.entity'
import { CreateMovieDto } from '../src/movies/dto/create-movie.dto'
import { CreateMovieSessionDto } from '../src/sessions/dto/create-movie-session.dto'
import { MovieSession } from '../src/sessions/movie-session.entity'
import { CreateTicketDto } from '../src/tickets/dto/create-ticket.dto'
import { CreateCustomerDto } from '../src/users/dto/create-customer.dto'
import { CreateUserDto } from '../src/users/dto/create-user.dto'
import { User } from '../src/users/user.entity'
import { UserRole, TimeSlot } from '../src/utils/common.enums'

export const getMockRepository = <CustomEntity extends { id?: string }>(table: Record<string, CustomEntity>) => ({
  create: (createDto: Omit<CustomEntity, 'id'> | Omit<CustomEntity, 'id'>[]): CustomEntity => {
    return createDto as CustomEntity
  },
  save: async (entity: CustomEntity | CustomEntity[]): Promise<CustomEntity | CustomEntity[]> => {
    if (Array.isArray(entity)) {
      return Promise.resolve(
        entity.map((e) => {
          e.id ??= faker.string.uuid()
          table[e.id] = e
          return e
        }) as CustomEntity[],
      )
    }
    entity.id ??= faker.string.uuid()
    table[entity.id] = entity
    return Promise.resolve(entity as CustomEntity)
  },
  findOne: async ({ where }: { where: Partial<CustomEntity> }): Promise<CustomEntity | null> => {
    const entries = Object.entries(where)
    return Promise.resolve(Object.values(table).find((entity) => entries.every(([key, value]) => entity[key] === value)))
  },
  find: async (): Promise<CustomEntity[]> => {
    return Promise.resolve(Object.values(table))
  },
  remove: async (entity: CustomEntity): Promise<CustomEntity> => {
    const deletedEntity = table[entity.id]
    delete table[entity.id]
    return Promise.resolve(deletedEntity)
  },
})

export const generateMultiple = <T>(entityFn: () => T, length = faker.number.int({ min: 3, max: 20 })): T[] =>
  Array.from({ length })
    .fill(0)
    .map(() => entityFn())

export const generateMockMovie = (id?: string): CreateMovieDto | Movie => ({
  id,
  age_restriction: faker.number.int({ min: 0, max: 24 }),
  name: faker.commerce.productName(),
})

export const generateMockRoom = (id?: string): CreateRoomDto | Room => ({
  id,
  room_number: `Room ${faker.number.int({ min: 1_000, max: 9_999 })}`,
  capacity: faker.datatype.boolean() ? faker.number.int({ min: 100, max: 1_000 }) : undefined,
})

export const generateMockCustomer = (): CreateCustomerDto => ({
  age: faker.number.int({ min: 1, max: 100 }),
  password: faker.internet.password(),
  username: faker.internet.userName(),
})

export const generateMockUser = (id?: string): CreateUserDto | User => ({
  id,
  age: faker.number.int({ min: 1, max: 100 }),
  password: faker.internet.password(),
  username: faker.internet.userName(),
  role: faker.helpers.enumValue(UserRole),
})

export const generateMockSession = (id?: string): CreateMovieSessionDto & Partial<MovieSession> => ({
  id,
  date: faker.date.soon().toISOString().split('T')[0],
  movie_id: faker.string.uuid(),
  room_id: faker.string.uuid(),
  time_slot: faker.helpers.enumValue(TimeSlot),
  movie: id ? (generateMockMovie() as Movie) : undefined,
})

export const generateMockTicket = (id?: string): CreateTicketDto => ({
  session_id: id ?? faker.string.uuid(),
})

export const getCurrentTimeSlot = (date: Date): TimeSlot => {
  const hoursIn = date.getHours()

  for (const slot of Object.values(TimeSlot)) {
    const [start, end] = slot.split('-').map((s) => Number(s.split(':')[0]))
    if (hoursIn >= start && hoursIn < end) {
      return slot
    }
  }

  return null
}
