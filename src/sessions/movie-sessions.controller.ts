import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { MovieSessionsService } from './movie-sessions.service'
import { CreateMovieSessionDto } from './dto/create-movie-session.dto'
import { FindMovieSessionsFiter } from './dto/find-movie-session-filter.dto'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MovieSessionsDto } from './dto/movie-sessions.dto'
import { MovieSessionDto } from './dto/movie-session.dto'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../utils/common.enums'

@ApiTags('sessions')
@Controller('sessions')
export class MovieSessionsController {
  constructor(private movieSessionsService: MovieSessionsService) {}

  @Post('/create')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie session (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 201, description: 'Movie session has been successfully created.', type: MovieSessionDto })
  create(@Body() createMovieSessionDto: CreateMovieSessionDto): Promise<MovieSessionDto> {
    return this.movieSessionsService.createMovieSession(createMovieSessionDto)
  }

  @Get()
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of all movie sessions (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 200, description: 'List of all movie sessions.', type: MovieSessionsDto })
  findAll(): Promise<MovieSessionsDto> {
    return this.movieSessionsService.findAllMovieSessions()
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a movie session by ID', description: 'Accessible by all users without authentication' })
  @ApiParam({ name: 'id', description: 'The ID of the movie session', type: String })
  @ApiResponse({ status: 200, description: 'Movie session details.', type: MovieSessionDto })
  @ApiResponse({ status: 404, description: 'Movie session not found' })
  findOne(@Param('id') id: string): Promise<MovieSessionDto> {
    return this.movieSessionsService.findMovieSession(id)
  }

  @Patch('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie session by ID (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiParam({ name: 'id', description: 'The ID of the movie session to be updated', type: String })
  @ApiResponse({ status: 200, description: 'Movie session has been successfully updated.', type: MovieSessionDto })
  @ApiResponse({ status: 404, description: 'Movie session not found' })
  update(@Param('id') id: string, @Body() updateMovieSessionDto: Partial<CreateMovieSessionDto>): Promise<MovieSessionDto> {
    return this.movieSessionsService.updateMovieSession(id, updateMovieSessionDto)
  }

  @Delete('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie session by ID (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiParam({ name: 'id', description: 'The ID of the movie session to be deleted', type: String })
  @ApiResponse({ status: 200, description: 'Movie session has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Movie session not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.movieSessionsService.removeMovieSession(id)
  }

  @Get('/movie/:movieId')
  @ApiOperation({ summary: 'Get movie sessions by movie ID and date', description: 'Accessible by all users without authentication' })
  @ApiParam({ name: 'movieId', description: 'The ID of the movie', type: String })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date' })
  @ApiResponse({ status: 200, description: 'List of movie sessions.', type: MovieSessionsDto })
  findMovieSessionsByMovie(@Param('movieId') movieId: string, @Query() findMovieSessionsFiter: FindMovieSessionsFiter): Promise<MovieSessionsDto> {
    return this.movieSessionsService.findMovieSessionsByMovieAndDate(movieId, findMovieSessionsFiter)
  }
}
