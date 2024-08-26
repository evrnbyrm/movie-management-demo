import { Test, TestingModule } from '@nestjs/testing'
import { MovieSessionsService } from '../movie-sessions.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MovieSession } from '../movie-session.entity'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { CreateMovieSessionDto } from '../dto/create-movie-session.dto'
import { getMockRepository, generateMockMovie, generateMockRoom, generateMockSession, generateMultiple } from '../../../test/common'
import { MoviesService } from '../../movies/movies.service'
import { RoomsService } from '../../rooms/rooms.service'
import { TimeSlot } from '../../utils/common.enums'

describe('SessionsService', () => {
  let service: MovieSessionsService
  let sessionsTable: Record<string, MovieSession>

  beforeEach(async () => {
    sessionsTable = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieSessionsService,
        {
          provide: getRepositoryToken(MovieSession),
          useValue: getMockRepository<MovieSession>(sessionsTable),
        },
        {
          provide: MoviesService,
          useValue: {
            findMovie: generateMockMovie,
          },
        },
        {
          provide: RoomsService,
          useValue: {
            findRoom: generateMockRoom,
          },
        },
      ],
    }).compile()

    service = module.get<MovieSessionsService>(MovieSessionsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a movie session', async () => {
    const movieSession = generateMockSession()

    const { id } = await service.createMovieSession(movieSession)

    expect(sessionsTable[id]).toBeDefined()
    expect(sessionsTable[id].date).toBe(movieSession.date)
    expect(sessionsTable[id].time_slot).toBe(movieSession.time_slot)
  })

  it('should throw ConflictException if movie session already exists', async () => {
    const movieSession = generateMockSession()
    const createdSession = await service.createMovieSession(movieSession)
    jest.spyOn(service, 'findOverlappingSession').mockResolvedValue(createdSession)

    await expect(service.createMovieSession({ ...movieSession, movie_id: 'movie2' })).rejects.toThrow(ConflictException)
  })

  it('should find all movie sessions', async () => {
    const sessions = generateMultiple<CreateMovieSessionDto>(generateMockSession)
    await Promise.all(sessions.map((s) => service.createMovieSession(s)))
    const allSessions = await service.findAllMovieSessions()

    expect(allSessions.sessions).toBeDefined()
    expect(allSessions.sessions.length).toBe(sessions.length)
    expect(allSessions.sessions.length).toBe(Object.keys(sessionsTable).length)
    expect(sessions.every((s) => !!allSessions.sessions.find((responseSession) => responseSession.date === s.date && responseSession.time_slot === s.time_slot))).toBeTruthy()
  })

  it('should find movie session by id', async () => {
    const generatedSessions = await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession, 5).map((r) => service.createMovieSession(r)))
    const foundSession = await service.findMovieSession(generatedSessions[2].id)

    expect(foundSession).toBeDefined()
    expect(foundSession).toEqual(generatedSessions[2])
  })

  it('should throw NotFoundException when movie session not found by id', async () => {
    await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession).map((s) => service.createMovieSession(s)))
    await expect(service.findMovieSession('123')).rejects.toThrow(NotFoundException)
  })

  it('should update a movie session', async () => {
    const generatedSession = await service.createMovieSession(generateMockSession())
    const updateDto = { date: '12-11-24' }
    const updatedSession = await service.updateMovieSession(generatedSession.id, updateDto)

    expect(sessionsTable[generatedSession.id]).toEqual({ ...generatedSession, ...updateDto })
    expect(updatedSession).toEqual(sessionsTable[generatedSession.id])
  })

  it('should throw NotFoundException on update if movie session id is not found ', async () => {
    await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession).map((s) => service.createMovieSession(s)))
    await expect(service.updateMovieSession('123', { time_slot: TimeSlot.Slot3 })).rejects.toThrow(NotFoundException)
  })

  it('should throw ConflictException on update if date/room/timeslot configuration already exists', async () => {
    await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession).map((s) => service.createMovieSession(s)))
    jest.spyOn(service, 'findOverlappingSession').mockResolvedValue(Object.values(sessionsTable)[1])
    await expect(service.updateMovieSession(Object.keys(sessionsTable)[0], { date: '1970-11-11' })).rejects.toThrow(ConflictException)
  })

  it('should remove a movie session', async () => {
    const generatedSessions = await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession, 5).map((s) => service.createMovieSession(s)))
    await service.removeMovieSession(generatedSessions[1].id)

    expect(sessionsTable[generatedSessions[1].id]).toBeUndefined()
    expect(Object.keys(sessionsTable).length).toBe(generatedSessions.length - 1)
  })

  it('should throw error on delete if movie session id is not found', async () => {
    await Promise.all(generateMultiple<CreateMovieSessionDto>(generateMockSession).map((s) => service.createMovieSession(s)))
    await expect(service.removeMovieSession('123')).rejects.toThrow(NotFoundException)
  })
})
