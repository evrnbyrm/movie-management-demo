import { Test, TestingModule } from '@nestjs/testing'
import { MoviesService } from '../movies.service'
import { Movie } from '../movie.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { CreateMovieDto } from '../dto/create-movie.dto'
import { getMockRepository, generateMockMovie, generateMultiple } from '../../../test/common'

describe('MoviesService', () => {
  let service: MoviesService
  let moviesTable: Record<string, Movie>

  beforeEach(async () => {
    moviesTable = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: getMockRepository<Movie>(moviesTable),
        },
      ],
    }).compile()

    service = module.get<MoviesService>(MoviesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a movie', async () => {
    const movie = generateMockMovie()
    const createdMovie = await service.createMovie(movie)
    const { id } = createdMovie

    expect(moviesTable[id]).toBeDefined()
    expect(moviesTable[id]).toEqual({ ...movie, id })
  })

  it('should find all movies', async () => {
    const movies = generateMultiple<CreateMovieDto>(generateMockMovie)
    await Promise.all(movies.map((m) => service.createMovie(m)))
    const allMovies = await service.findAllMovies()

    expect(allMovies.movies).toBeDefined()
    expect(allMovies.movies.length).toBe(movies.length)
    expect(allMovies.movies.length).toBe(Object.keys(moviesTable).length)
    expect(movies.every((m) => !!allMovies.movies.find((responseMovie) => responseMovie.name === m.name))).toBeTruthy()
  })

  it('should find a movie by id', async () => {
    const generatedMovies = await Promise.all(generateMultiple<CreateMovieDto>(generateMockMovie, 5).map((r) => service.createMovie(r)))
    const foundMovie = await service.findMovie(generatedMovies[2].id)

    expect(foundMovie).toBeDefined()
    expect(foundMovie).toEqual(generatedMovies[2])
  })

  it('should throw NotFoundException when movie not found by id', async () => {
    await Promise.all(generateMultiple<CreateMovieDto>(generateMockMovie).map((r) => service.createMovie(r)))
    await expect(service.findMovie('123')).rejects.toThrow(NotFoundException)
  })

  it('should update a movie', async () => {
    const generatedMovie = await service.createMovie(generateMockMovie())
    const updateDto = { name: 'Batman' }
    const updatedMovie = await service.updateMovie(generatedMovie.id, updateDto)

    expect(moviesTable[generatedMovie.id]).toEqual({ ...generatedMovie, ...updateDto })
    expect(updatedMovie).toEqual(moviesTable[generatedMovie.id])
  })

  it('should throw NotFoundException on update if movie id is not found ', async () => {
    await Promise.all(generateMultiple<CreateMovieDto>(generateMockMovie, 5).map((r) => service.createMovie(r)))
    await expect(service.updateMovie('123', { age_restriction: 10 })).rejects.toThrow(NotFoundException)
  })

  it('should remove a movie', async () => {
    const generatedMovies = await Promise.all(generateMultiple<CreateMovieDto>(generateMockMovie).map((r) => service.createMovie(r)))
    await service.removeMovie(generatedMovies[1].id)

    expect(moviesTable[generatedMovies[1].id]).toBeUndefined()
    expect(Object.keys(moviesTable).length).toBe(generatedMovies.length - 1)
  })

  it('should throw error on delete if movie id is not found', async () => {
    await Promise.all(generateMultiple<CreateMovieDto>(generateMockMovie).map((r) => service.createMovie(r)))
    await expect(service.removeMovie('123')).rejects.toThrow(NotFoundException)
  })

  it('should create movies as bulk', async () => {
    const movies = generateMultiple<CreateMovieDto>(generateMockMovie)
    const createdBulkMovies = await service.bulkCreateMovies(movies)

    expect(createdBulkMovies.movies).toBeDefined()
    expect(createdBulkMovies.movies.length).toBe(movies.length)
    expect(createdBulkMovies.movies.length).toBe(Object.keys(moviesTable).length)
    expect(movies.every((m) => !!createdBulkMovies.movies.find((responseMovie) => responseMovie.name === m.name))).toBeTruthy()
  })
})
