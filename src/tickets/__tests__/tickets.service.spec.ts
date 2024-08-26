import { Test, TestingModule } from '@nestjs/testing'
import { TicketsService } from '../tickets.service'
import { Ticket } from '../ticket.entity'
import { WatchHistory } from '../watch-history.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { faker } from '@faker-js/faker'
import { CreateTicketDto } from '../dto/create-ticket.dto'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { getMockRepository, generateMockUser, generateMockSession, generateMockTicket, generateMultiple } from '../../../test/common'
import { MovieSessionsService } from '../../sessions/movie-sessions.service'
import { UsersService } from '../../users/users.service'
import { TimeSlot } from '../../utils/common.enums'

describe('TicketsService', () => {
  let service: TicketsService
  let ticketsTable: Record<string, Ticket>
  let watchHistoryTable: Record<string, WatchHistory>

  beforeEach(async () => {
    ticketsTable = {}
    watchHistoryTable = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: getMockRepository<Ticket>(ticketsTable),
        },
        {
          provide: getRepositoryToken(WatchHistory),
          useValue: getMockRepository<WatchHistory>(watchHistoryTable),
        },
        {
          provide: UsersService,
          useValue: {
            findUser: generateMockUser,
          },
        },
        {
          provide: MovieSessionsService,
          useValue: {
            findMovieSession: generateMockSession,
          },
        },
      ],
    }).compile()

    service = module.get<TicketsService>(TicketsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should buy a ticket', async () => {
    const ticket = generateMockTicket()
    const userId = faker.string.uuid()

    const { id } = await service.createTicket(ticket, { id: userId })
    expect(ticketsTable[id]).toBeDefined()
    expect(ticketsTable[id].user.id).toBe(userId)
    expect(ticketsTable[id].session.id).toBe(ticket.session_id)
  })

  it('should find all tickets', async () => {
    const tickets = generateMultiple<CreateTicketDto>(generateMockTicket)
    await Promise.all(tickets.map((t) => service.createTicket(t, { id: faker.string.uuid() })))
    const allTickets = await service.findAllTickets()

    expect(allTickets.tickets).toBeDefined()
    expect(allTickets.tickets.length).toBe(tickets.length)
    expect(allTickets.tickets.length).toBe(Object.keys(ticketsTable).length)
    expect(tickets.every((t) => !!allTickets.tickets.find((responseTicket) => responseTicket.session.id === t.session_id))).toBeTruthy()
  })

  it('should find ticket by id', async () => {
    const generatedTickets = await Promise.all(generateMultiple<CreateTicketDto>(generateMockTicket).map((t) => service.createTicket(t, { id: faker.string.uuid() })))
    const foundTicket = await service.findTicket(generatedTickets[2].id)

    expect(foundTicket).toBeDefined()
    expect(foundTicket).toEqual(generatedTickets[2])
  })

  it('should throw NotFoundException when ticket not found by id', async () => {
    await Promise.all(generateMultiple<CreateTicketDto>(generateMockTicket).map((t) => service.createTicket(t, { id: faker.string.uuid() })))
    await expect(service.findTicket('123')).rejects.toThrow(NotFoundException)
  })

  it('should remove a ticket', async () => {
    const generatedTickets = await Promise.all(generateMultiple<CreateTicketDto>(generateMockTicket).map((t) => service.createTicket(t, { id: faker.string.uuid() })))
    await service.removeTicket(generatedTickets[1].id)

    expect(ticketsTable[generatedTickets[1].id]).toBeUndefined()
    expect(Object.keys(ticketsTable).length).toBe(generatedTickets.length - 1)
  })

  it('should throw error on delete if ticket id is not found', async () => {
    await Promise.all(generateMultiple<CreateTicketDto>(generateMockTicket).map((t) => service.createTicket(t, { id: faker.string.uuid() })))
    await expect(service.removeTicket('123')).rejects.toThrow(NotFoundException)
  })

  it('should throw ForbiddenException if user is not owner of the ticket', async () => {
    const { id } = await service.createTicket(generateMockTicket(), { id: faker.string.uuid() })
    await expect(service.markTicketAsUsed(id, { id: '123' })).rejects.toThrow(ForbiddenException)
  })

  it('should throw BadRequestException if time is not within movie session time', async () => {
    const { id, user } = await service.createTicket(generateMockTicket(), { id: faker.string.uuid() })
    ticketsTable[id].session.date = '1970-01-01'
    await expect(service.markTicketAsUsed(id, user)).rejects.toThrow(BadRequestException)
  })

  it('should mark ticket as used and save it into watchHistory table if time within session time', async () => {
    const { id, user } = await service.createTicket(generateMockTicket(), { id: faker.string.uuid() })
    ticketsTable[id].session.date = new Date().toISOString().split('T')[0]
    ticketsTable[id].session.time_slot = '00:00-23:59' as TimeSlot
    const usedTicket = await service.markTicketAsUsed(id, user)

    expect(ticketsTable[id].used).toBeTruthy()
    expect(usedTicket.used).toBeTruthy()
    expect(Object.values(watchHistoryTable).find((w) => w.user.id === user.id)).toBeTruthy()
  })

  it('should get watch history of the user', async () => {
    const { id, user } = await service.createTicket(generateMockTicket(), { id: faker.string.uuid() })
    ticketsTable[id].session.date = new Date().toISOString().split('T')[0]
    ticketsTable[id].session.time_slot = '00:00-23:59' as TimeSlot
    const usedTicket = await service.markTicketAsUsed(id, user)

    jest.spyOn(UsersService.prototype, 'findUser').mockResolvedValue(usedTicket.user)

    const { watchHistory } = await service.getUserWatchHistoty(usedTicket.user)
    expect(watchHistory.length).toBe(1)
    expect(watchHistory[0].time_slot).toBe(usedTicket.session.time_slot)
  })

  it('should get tickets of the user', async () => {
    const userId = faker.string.uuid()
    const createdTickets = await Promise.all(generateMultiple<CreateTicketDto>(generateMockTicket).map((t) => service.createTicket(t, { id: userId })))

    jest.spyOn(UsersService.prototype, 'findUser').mockResolvedValue(createdTickets[0].user)

    const { tickets } = await service.findUserTickets(createdTickets[0].user)
    expect(tickets.length).toBe(createdTickets.length)
    expect(tickets.every((t) => t.user.id === userId)).toBeTruthy()
  })
})
