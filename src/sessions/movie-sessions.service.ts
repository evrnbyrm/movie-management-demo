import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { MovieSession } from './movie-session.entity'
import { CreateMovieSessionDto } from './dto/create-movie-session.dto'
import { FindMovieSessionsFiter } from './dto/find-movie-session-filter.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MovieSessionsDto } from './dto/movie-sessions.dto'
import { MoviesService } from '../movies/movies.service'
import { RoomsService } from '../rooms/rooms.service'
import { TimeSlot, TableNames } from '../utils/common.enums'

@Injectable()
export class MovieSessionsService {
  constructor(
    @InjectRepository(MovieSession)
    private movieSessionsRepository: Repository<MovieSession>,
    private moviesService: MoviesService,
    private roomsService: RoomsService,
  ) {}

  async createMovieSession(createMovieSessionDto: CreateMovieSessionDto): Promise<MovieSession> {
    const { date, movie_id, room_id, time_slot } = createMovieSessionDto

    const movie = await this.moviesService.findMovie(movie_id)
    const room = await this.roomsService.findRoom(room_id)

    const existingSession = await this.findOverlappingSession(date, room_id, time_slot)
    if (existingSession) {
      throw new ConflictException(`A session is already defined for room: ${room.room_number}, date: ${date} and time slot: ${time_slot} for ${existingSession.movie.name}`)
    }

    const session = await this.movieSessionsRepository.create({
      ...createMovieSessionDto,
      movie,
      room,
    })

    return this.movieSessionsRepository.save(session)
  }

  async findAllMovieSessions(): Promise<MovieSessionsDto> {
    const sessions = await this.movieSessionsRepository.find({ relations: ['movie', 'room'] })
    return { sessions }
  }

  async findMovieSession(id: string): Promise<MovieSession> {
    const session = await this.movieSessionsRepository.findOne({ where: { id }, relations: ['movie', 'room'] })
    if (!session) {
      throw new NotFoundException(`Cannot find session with ID: ${id}`)
    }
    return session
  }

  async updateMovieSession(id: string, updateMovieSessionDto: Partial<CreateMovieSessionDto>): Promise<MovieSession> {
    const session = await this.findMovieSession(id)
    const { date = session.date, movie_id, room_id, time_slot = session.time_slot } = updateMovieSessionDto

    const movie = movie_id ? await this.moviesService.findMovie(movie_id) : session.movie
    const room = room_id ? await this.roomsService.findRoom(room_id) : session.room

    if (date !== session.date || time_slot !== session.time_slot || room.id !== session.room.id) {
      const existingSession = await this.findOverlappingSession(date, room.id, time_slot)
      if (existingSession) {
        throw new ConflictException(`A session is already defined for room: ${room.room_number}, date: ${date} and time slot: ${time_slot}`)
      }
    }

    Object.assign(session, { date, time_slot, movie, room })
    return this.movieSessionsRepository.save(session)
  }

  async removeMovieSession(id: string): Promise<void> {
    const session = await this.findMovieSession(id)
    await this.movieSessionsRepository.remove(session)
  }

  async findOverlappingSession(date: string, roomId: string, timeSlot: TimeSlot): Promise<MovieSession | null> {
    return this.movieSessionsRepository.findOne({ where: { date, room: { id: roomId }, time_slot: timeSlot }, relations: ['room', 'movie'] })
  }

  async findMovieSessionsByMovieAndDate(movieId: string, filters?: FindMovieSessionsFiter): Promise<MovieSessionsDto> {
    const { date } = filters
    const query = this.movieSessionsRepository
      .createQueryBuilder(TableNames.MOVIE_SESSIONS)
      .leftJoinAndSelect(`${TableNames.MOVIE_SESSIONS}.movie`, 'movie')
      .leftJoinAndSelect(`${TableNames.MOVIE_SESSIONS}.room`, 'room')
      .where(`${TableNames.MOVIE_SESSIONS}.movie.id = :movieId`, { movieId })

    if (date) {
      query.andWhere(`${TableNames.MOVIE_SESSIONS}.date = :date`, { date })
    }

    const sessions = await query.getMany()
    return { sessions }
  }
}
