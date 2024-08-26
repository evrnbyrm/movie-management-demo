import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Ticket } from './ticket.entity'
import { Repository } from 'typeorm'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { WatchHistory } from './watch-history.entity'
import { isTicketTimeValid } from './utils'
import { TicketsDto } from './dto/tickets.dto'
import { WatchHistoryDto } from './dto/watch-history.dto'
import { MovieSessionsService } from '../sessions/movie-sessions.service'
import { UsersService } from '../users/users.service'
import { JwtUserPayload } from '../utils/types'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
    private movieSessionsService: MovieSessionsService,
    private usersService: UsersService,
  ) {}

  async createTicket(createTicketDto: CreateTicketDto, user: JwtUserPayload): Promise<Ticket> {
    const { session_id } = createTicketDto

    const session = await this.movieSessionsService.findMovieSession(session_id)
    const foundUser = await this.usersService.findUser(user.id)

    const ticket = this.ticketRepository.create({
      session,
      user: foundUser,
      purchase_date: new Date().toISOString(),
    })

    return this.ticketRepository.save(ticket)
  }

  async findAllTickets(): Promise<TicketsDto> {
    const tickets = await this.ticketRepository.find()
    return { tickets }
  }

  async findTicket(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id }, relations: ['user', 'session', 'session.movie'] })
    if (!ticket) {
      throw new NotFoundException(`Cannot find ticket with ID: ${id}`)
    }
    return ticket
  }

  async markTicketAsUsed(id: string, user: JwtUserPayload): Promise<Ticket> {
    const ticket = await this.findTicket(id)
    if (ticket.user.id != user.id) {
      throw new ForbiddenException('You can only use your own ticket')
    }
    if (!isTicketTimeValid(ticket)) {
      throw new BadRequestException(`You can/could use your ticket only on ${ticket.session.date} between ${ticket.session.time_slot}`)
    }
    if (ticket.used) {
      return ticket
    }
    ticket.used = true
    const watchHistory = this.watchHistoryRepository.create({
      user: ticket.user,
      movie: ticket.session.movie.name,
      time_slot: ticket.session.time_slot,
      watched_at: ticket.session.date,
    })

    await this.watchHistoryRepository.save(watchHistory)

    return this.ticketRepository.save(ticket)
  }

  async removeTicket(id: string): Promise<void> {
    const ticket = await this.findTicket(id)
    await this.ticketRepository.remove(ticket)
  }

  async getUserWatchHistoty(user: JwtUserPayload): Promise<WatchHistoryDto> {
    const foundUser = await this.usersService.findUser(user.id)
    const watchHistory: Omit<WatchHistory, 'user'>[] = await this.watchHistoryRepository.find({
      where: { user: foundUser },
      relations: ['movie'],
      order: {
        watched_at: 'DESC',
      },
    })

    return { watchHistory }
  }

  async findUserTickets(user: JwtUserPayload): Promise<TicketsDto> {
    const foundUser = await this.usersService.findUser(user.id)
    const tickets = await this.ticketRepository.find({ where: { user: foundUser }, relations: ['session', 'session.movie', 'session.room'] })
    return { tickets }
  }
}
