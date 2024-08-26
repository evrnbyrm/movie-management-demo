import { Module } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ticket } from './ticket.entity'
import { WatchHistory } from './watch-history.entity'
import { MovieSessionsModule } from '../sessions/movie-sessions.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, WatchHistory]), UsersModule, MovieSessionsModule, UsersModule],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
