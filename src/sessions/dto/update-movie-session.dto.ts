import { PartialType } from '@nestjs/swagger'
import { CreateMovieSessionDto } from './create-movie-session.dto'

export class UpdateMovieSession extends PartialType(CreateMovieSessionDto) {}
