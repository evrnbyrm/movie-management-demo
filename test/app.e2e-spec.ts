import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { JwtService } from '@nestjs/jwt'
import { generateMockCustomer, generateMockUser, generateMockRoom, generateMockMovie, getCurrentTimeSlot } from './common'
import { CustomExceptionFilter } from '../src/filters/custom-exception.filter'
import { ResponseInterceptor } from '../src/interceptors/response-interceptor.interceptor'
import { CreateMovieSessionDto } from '../src/sessions/dto/create-movie-session.dto'
import { User } from '../src/users/user.entity'
import { UserRole, TimeSlot } from '../src/utils/common.enums'

describe('AppController (e2e)', () => {
  const customer = generateMockCustomer() as User
  const manager = { ...generateMockUser(), role: UserRole.Manager } as User
  let customerToken: string = ''
  let managerToken: string = ''

  const jwt = new JwtService({ secret: process.env.JWT_SECRET_KEY })
  const forbiddenMessage = 'You are not allowed to perform this action'

  let app: INestApplication
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    // These can also be done inside app.module providing into global variables such as APP_PIPE etc.
    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    app.useGlobalInterceptors(new ResponseInterceptor())
    app.useGlobalFilters(new CustomExceptionFilter())
    await app.init()
  })

  it('sign up as customer', async () => {
    await request(app.getHttpServer())
      .post('/users/signup')
      .send(customer)
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { username, password, id } = response.body
        expect(username).toBe(customer.username)
        expect(password).toBeUndefined()
        customer.id = id
      })
  })

  it('sign in as customer', async () => {
    await request(app.getHttpServer())
      .post('/users/signin')
      .send({ username: customer.username, password: customer.password })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { accessToken } = response.body
        customerToken = accessToken
        expect(accessToken).toBeDefined()
        expect(jwt.decode(accessToken).id).toBe(customer.id)
      })
  })

  it('shows users profile', async () => {
    await request(app.getHttpServer())
      .get('/users/my-profile')
      .auth(customerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { id, age } = response.body
        expect(customer.id).toBe(id)
        expect(customer.age).toBe(age)
      })
  })

  it('returns unauthorized response if token is not provided', async () => {
    await request(app.getHttpServer())
      .get('/users/my-profile')
      .expect(HttpStatus.UNAUTHORIZED)
      .then((response) => {
        const { errorDetails } = response.body
        expect(errorDetails).toBeDefined()
        expect(errorDetails.message).toBe(new UnauthorizedException().message)
      })
  })

  it('should return forbidden response if customer tries to create manager', async () => {
    await request(app.getHttpServer())
      .post('/users/create-user')
      .send(customer)
      .auth(customerToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
      .then((response) => {
        const { errorDetails } = response.body
        expect(errorDetails).toBeDefined()
        expect(errorDetails.message).toBe(forbiddenMessage)
      })
  })

  it('should create manager user if manager token is used', async () => {
    // craetion of initial manager, uuid is needed also
    managerToken = await jwt.signAsync({ ...manager, id: customer.id })

    await request(app.getHttpServer())
      .post('/users/create-user')
      .send(manager)
      .auth(managerToken, { type: 'bearer' })
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { id, username } = response.body
        expect(id).toBeDefined()
        expect(username).toBe(manager.username)
        manager.id = id
      })

    await request(app.getHttpServer())
      .post('/users/signin')
      .send({ username: manager.username, password: manager.password })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { accessToken } = response.body
        expect(accessToken).toBeDefined()
        expect(jwt.decode(accessToken).id).toBe(manager.id)
        managerToken = accessToken
      })
  })

  it('should get all users', async () => {
    await request(app.getHttpServer())
      .get('/users/')
      .auth(managerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { users } = response.body
        expect(users).toBeDefined()
        expect(users.find((u) => u.id === customer.id)).toBeTruthy()
        expect(users.find((u) => u.id === manager.id).username).toBe(manager.username)
      })
  })

  it('should get user by id', async () => {
    await request(app.getHttpServer())
      .get(`/users/${customer.id}`)
      .auth(managerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { username, password } = response.body
        expect(username).toBeDefined()
        expect(username).toBe(customer.username)
        expect(password).toBeUndefined()
      })
  })

  it('should create a session', async () => {
    // creates room
    await request(app.getHttpServer())
      .post(`/rooms/create`)
      .auth(managerToken, { type: 'bearer' })
      .send(generateMockRoom())
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { id } = response.body
        expect(id).toBeDefined()
      })

    // gets room
    const { body: roomsBody } = await request(app.getHttpServer()).get(`/rooms`).auth(managerToken, { type: 'bearer' }).expect(HttpStatus.OK)
    expect(roomsBody.rooms).toBeDefined()
    expect(roomsBody.rooms.length).toBe(1)
    const room_id = roomsBody.rooms[0].id

    // creates movie
    await request(app.getHttpServer())
      .post(`/movies/create`)
      .auth(managerToken, { type: 'bearer' })
      .send(generateMockMovie())
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { id } = response.body
        expect(id).toBeDefined()
      })

    const { body: moviesBody } = await request(app.getHttpServer()).get(`/movies`).auth(managerToken, { type: 'bearer' }).expect(HttpStatus.OK)
    expect(moviesBody.movies).toBeDefined()
    expect(moviesBody.movies.length).toBe(1)
    const movie_id = moviesBody.movies[0].id

    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time_slot = getCurrentTimeSlot(now) ?? TimeSlot.Slot1
    const movieSession: CreateMovieSessionDto = {
      movie_id,
      room_id,
      date,
      time_slot,
    }

    // creates movie session
    await request(app.getHttpServer())
      .post(`/sessions/create`)
      .auth(managerToken, { type: 'bearer' })
      .send(movieSession)
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { id } = response.body
        expect(id).toBeDefined()
      })

    const nextDay = new Date(now)
    nextDay.setDate(now.getDate() + 1)
    // creates another session for next day
    await request(app.getHttpServer())
      .post('/sessions/create')
      .auth(managerToken, { type: 'bearer' })
      .send({
        ...movieSession,
        date: nextDay.toISOString().split('T')[0],
      })
      .expect(HttpStatus.CREATED)
      .then((response) => {
        const { id } = response.body
        expect(id).toBeDefined()
      })
  })

  it('should buy ticket after listing sessions', async () => {
    const today = new Date().toISOString().split('T')[0]

    const { body: filteredMovies } = await request(app.getHttpServer()).get('/movies/in-theatres').query({ date: today }).expect(HttpStatus.OK)
    expect(Object.keys(filteredMovies.movies[0].sessions).length).toBe(1)
    expect(filteredMovies.movies[0].sessions[today]).toBeDefined()

    // buys ticket
    const { sessionId } = filteredMovies.movies[0].sessions[today][0]
    const { body: responseTicket } = await request(app.getHttpServer()).post('/tickets/buy').auth(customerToken, { type: 'bearer' }).send({ session_id: sessionId }).expect(HttpStatus.CREATED)
    expect(responseTicket.session.id).toBe(sessionId)

    // checks own tickets
    await request(app.getHttpServer())
      .get('/tickets/my-tickets')
      .auth(customerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { tickets } = response.body
        expect(tickets).toBeDefined()
        expect(tickets.length).toBe(1)
        expect(tickets[0].id).toBe(responseTicket.id)
      })

    await request(app.getHttpServer())
      .get('/movies/in-theatres')
      .expect(HttpStatus.OK)
      .then((response) => {
        const { movies } = response.body
        expect(movies).toBeDefined()
        expect(movies.length).toBe(1)
        expect(Object.keys(movies[0].sessions).length).toBe(2)
      })
  })

  it('should cancel movie then trigger ticket to be deleted', async () => {
    await request(app.getHttpServer())
      .get(`/movies`)
      .auth(managerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then(async (response) => {
        const { movies } = response.body
        expect(movies).toBeDefined()
        expect(movies.length).toBe(1)
        await request(app.getHttpServer()).delete(`/movies/${movies[0].id}`).auth(managerToken, { type: 'bearer' }).expect(HttpStatus.OK)
      })

    // checks own tickets
    await request(app.getHttpServer())
      .get('/tickets/my-tickets')
      .auth(customerToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { tickets } = response.body
        expect(tickets).toBeDefined()
        expect(tickets.length).toBe(0)
      })
  })
})
