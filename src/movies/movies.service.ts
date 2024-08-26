import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Movie } from './movie.entity'
import { In, Repository } from 'typeorm'
import { CreateMovieDto } from './dto/create-movie.dto'
import { MovieWithSessions, MoviesWithSessionsDto } from './dto/movies-with-sessions.dto'
import { plainToInstance } from 'class-transformer'
import { addFilterDto, formatMovieToMoviesWithSessions } from './utils'
import { FilterMoviesDto } from './dto/filter-movies.dto'
import { MoviesDto } from './dto/movies.dto'
import { TableNames } from '../utils/common.enums'
import { BulkRemoveMoviesDto } from './dto/bulk-remove-movie.dto'

@Injectable()
export class MoviesService {
  constructor(@InjectRepository(Movie) private movieRepository: Repository<Movie>) {}

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto)
    return this.movieRepository.save(movie)
  }

  async findAllMovies(): Promise<MoviesDto> {
    const movies = await this.movieRepository.find()
    return { movies }
  }

  async findMovie(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } })
    if (!movie) {
      throw new NotFoundException(`Cannot find movie with ID: ${id}`)
    }
    return movie
  }

  async updateMovie(id: string, updateMovieDto: Partial<CreateMovieDto>): Promise<Movie> {
    const movie = await this.findMovie(id)
    Object.assign(movie, updateMovieDto)
    return this.movieRepository.save(movie)
  }

  async removeMovie(id: string): Promise<void> {
    const movie = await this.findMovie(id)
    await this.movieRepository.remove(movie)
  }

  async findMoviesInTheatres(filters: FilterMoviesDto): Promise<MoviesWithSessionsDto> {
    const query = this.movieRepository
      .createQueryBuilder(TableNames.MOVIES)
      .leftJoinAndSelect(`${TableNames.MOVIES}.sessions`, TableNames.MOVIE_SESSIONS)
      .leftJoinAndSelect(`${TableNames.MOVIE_SESSIONS}.room`, TableNames.ROOMS)
    addFilterDto(query, filters)

    const movies = await query.getMany()

    const result = formatMovieToMoviesWithSessions(movies)

    return { movies: plainToInstance(MovieWithSessions, result) }
  }

  async bulkCreateMovies(bulkMovies: CreateMovieDto[]): Promise<MoviesDto> {
    const createdMovies = this.movieRepository.create(bulkMovies)
    const movies = await this.movieRepository.save(createdMovies)
    return { movies }
  }

  async bulkRemoveMovies(bulkRemoveDto: BulkRemoveMoviesDto): Promise<void> {
    // to get unique ids
    const ids = Array.from(new Set(bulkRemoveDto.ids))
    const movies = await this.movieRepository.find({ where: { id: In(ids) } })

    const foundIds = movies.map((movie) => movie.id)
    const notFoundIds = ids.filter((id) => !foundIds.includes(id))

    if (notFoundIds.length > 0) {
      throw new NotFoundException(`Cannot find movies with IDs ${notFoundIds.join(', ')}`)
    }

    await this.movieRepository.remove(movies)
  }
}
