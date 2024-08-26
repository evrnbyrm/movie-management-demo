import { Module } from '@nestjs/common'
import { MovieSessionsService } from './movie-sessions.service'
import { MovieSessionsController } from './movie-sessions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MovieSession } from './movie-session.entity'
import { MoviesModule } from '../movies/movies.module'
import { RoomsModule } from '../rooms/rooms.module'

@Module({
  imports: [TypeOrmModule.forFeature([MovieSession]), MoviesModule, RoomsModule],
  providers: [MovieSessionsService],
  controllers: [MovieSessionsController],
  exports: [MovieSessionsService],
})
export class MovieSessionsModule {}
