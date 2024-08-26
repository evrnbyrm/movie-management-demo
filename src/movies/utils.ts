import { MovieWithSessions, SessionDto } from './dto/movies-with-sessions.dto'
import { Movie } from './movie.entity'
import { SelectQueryBuilder } from 'typeorm'
import { FilterMoviesDto } from './dto/filter-movies.dto'
import { MovieSession } from '../sessions/movie-session.entity'
import { TableNames } from '../utils/common.enums'

export const formatMovieToMoviesWithSessions = (queriedMovies: Movie[]): MovieWithSessions[] =>
  queriedMovies.map((movie) => ({
    movieId: movie.id,
    movieTitle: movie.name,
    sessions: movie.sessions.reduce((accumulator: Record<string, SessionDto[]>, currentSession: MovieSession) => {
      const sessionData: SessionDto = {
        date: currentSession.date,
        sessionId: currentSession.id,
        timeSlot: currentSession.time_slot,
        room_id: currentSession.room.id,
        room_number: currentSession.room.room_number,
      }

      if (!accumulator[currentSession.date]) {
        accumulator[currentSession.date] = [sessionData]
      } else {
        accumulator[currentSession.date].push(sessionData)
      }

      return accumulator
    }, {}),
  }))

export function addFilterDto(query: SelectQueryBuilder<Movie>, filters: FilterMoviesDto) {
  const { ageRestriction, date, movieName, orderBy = 'ASC' } = filters

  if (date) {
    query.where(`${TableNames.MOVIE_SESSIONS}.date = :date`, { date })
  } else {
    query.where(`${TableNames.MOVIE_SESSIONS}.date >= :today`, { today: new Date().toISOString().split('T')[0] })
  }

  if (ageRestriction !== undefined) {
    query.andWhere(`${TableNames.MOVIES}.age_restriction <= :ageRestriction`, { ageRestriction })
  }

  if (movieName) {
    query.andWhere(`LOWER(${TableNames.MOVIES}.name) LIKE LOWER(:movieName)`, { movieName: `%${movieName}%` })
  }

  query.orderBy(`${TableNames.MOVIE_SESSIONS}.date`, orderBy).addOrderBy(`${TableNames.MOVIE_SESSIONS}.time_slot`, orderBy)
}
