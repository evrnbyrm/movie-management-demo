import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { MoviesService } from './movies.service'
import { CreateMovieDto } from './dto/create-movie.dto'
import { MoviesWithSessionsDto } from './dto/movies-with-sessions.dto'
import { FilterMoviesDto } from './dto/filter-movies.dto'
import { AuthGuard } from '@nestjs/passport'
import { BulkCreateMoviesDto } from './dto/bulk-create-movie.dto'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MoviesDto } from './dto/movies.dto'
import { MovieDto } from './dto/movie.dto'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../utils/common.enums'
import { BulkRemoveMoviesDto } from './dto/bulk-remove-movie.dto'

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Post('/create')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 201, description: 'Movie has been successfully created.', type: MovieDto })
  create(@Body() createMovieDto: CreateMovieDto): Promise<MovieDto> {
    return this.moviesService.createMovie(createMovieDto)
  }

  @Post('/bulk-create')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create movies (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 201, description: 'Movies have been successfully created.', type: MoviesDto })
  bulkCreate(@Body() bulkCreateMoviesDto: BulkCreateMoviesDto): Promise<MoviesDto> {
    return this.moviesService.bulkCreateMovies(bulkCreateMoviesDto.movies)
  }

  @Get()
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of all movies (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 200, description: 'List of all movies.', type: MoviesDto })
  findAllMovies(): Promise<MoviesDto> {
    return this.moviesService.findAllMovies()
  }

  @Get('/in-theatres')
  @ApiOperation({ summary: 'Get movies currently in theatres', description: 'Accessible by all users without authentication' })
  @ApiResponse({ status: 200, description: 'List of movies with sessions.', type: MoviesWithSessionsDto })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date' })
  @ApiQuery({ name: 'ageRestriction', required: false, description: 'Filter by age restriction' })
  @ApiQuery({ name: 'movieName', required: false, description: 'Filter by movie name' })
  findMoviesInTheatres(@Query() filterDto: FilterMoviesDto): Promise<MoviesWithSessionsDto> {
    return this.moviesService.findMoviesInTheatres(filterDto)
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a movie by ID', description: 'Accessible by all users without authentication' })
  @ApiParam({ name: 'id', description: 'The ID of the movie', type: String })
  @ApiResponse({ status: 200, description: 'Movie details.', type: MovieDto })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findOne(@Param('id') id: string): Promise<MovieDto> {
    return this.moviesService.findMovie(id)
  }

  @Patch('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie by ID (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiParam({ name: 'id', description: 'The ID of the movie to be updated', type: String })
  @ApiResponse({ status: 200, description: 'Movie has been successfully updated.', type: MovieDto })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  update(@Param('id') id: string, @Body() updateMovieDto: Partial<CreateMovieDto>): Promise<MovieDto> {
    return this.moviesService.updateMovie(id, updateMovieDto)
  }

  @Delete('/bulk-remove')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple movies by IDs (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiResponse({ status: 200, description: 'Movies have been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'One or more movies not found' })
  bulkRemove(@Body() bulkRemoveDto: BulkRemoveMoviesDto): Promise<void> {
    return this.moviesService.bulkRemoveMovies(bulkRemoveDto)
  }

  @Delete('/:id')
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie by ID (Manager role required)', description: 'Accessible by: **Manager** role with valid JWT token' })
  @ApiParam({ name: 'id', description: 'The ID of the movie to be deleted', type: String })
  @ApiResponse({ status: 200, description: 'Movie has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.moviesService.removeMovie(id)
  }
}
