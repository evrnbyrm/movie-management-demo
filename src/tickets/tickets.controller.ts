import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { AuthGuard } from '@nestjs/passport'
import { TicketDto } from './dto/ticket.dto'
import { TicketsDto } from './dto/tickets.dto'
import { WatchHistoryDto } from './dto/watch-history.dto'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetUser } from '../auth/get-user.decorator'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../utils/common.enums'
import { JwtUserPayload } from '../utils/types'

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketService: TicketsService) {}

  @Post('/buy')
  @Roles(UserRole.Customer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy a ticket for a movie session (Customer role required)', description: 'Allows a customer to buy a ticket for a specific movie session.' })
  @ApiResponse({ status: 201, description: 'Ticket has been successfully purchased.', type: TicketDto })
  create(@Body() createTicketDto: CreateTicketDto, @GetUser() user): Promise<TicketDto> {
    return this.ticketService.createTicket(createTicketDto, user)
  }

  @Get()
  @Roles(UserRole.Manager)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tickets (Manager role required)', description: 'Retrieves a list of all tickets. Only accessible by users with the Manager role.' })
  @ApiResponse({ status: 200, description: 'List of all tickets.', type: TicketsDto })
  findAll(): Promise<TicketsDto> {
    return this.ticketService.findAllTickets()
  }

  @Patch('/use/:id')
  @Roles(UserRole.Customer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Use a ticket (Customer role required)', description: 'Marks a ticket as used. Only the owner of the ticket can use it.' })
  @ApiParam({ name: 'id', description: 'The ID of the ticket to be used', type: String })
  @ApiResponse({ status: 200, description: 'Ticket has been successfully used.', type: TicketDto })
  @ApiResponse({ status: 400, description: 'Ticket is not valid for use at this time.' })
  @ApiResponse({ status: 403, description: 'You can only use your own ticket.' })
  useTicket(@GetUser() user: JwtUserPayload, @Param('id') id: string): Promise<TicketDto> {
    return this.ticketService.markTicketAsUsed(id, user)
  }

  @Delete('/refund/:id')
  @Roles(UserRole.Customer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a ticket (Customer role required)', description: 'Allows a customer to refund a ticket they have purchased.' })
  @ApiParam({ name: 'id', description: 'The ID of the ticket to be refunded', type: String })
  @ApiResponse({ status: 200, description: 'Ticket has been successfully refunded.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  refundTicket(@Param('id') id: string): Promise<void> {
    return this.ticketService.removeTicket(id)
  }

  @Get('/watch-history')
  @Roles(UserRole.Customer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch history (Customer role required)', description: 'Retrieves the watch history for the logged-in customer.' })
  @ApiResponse({ status: 200, description: 'Watch history retrieved successfully.', type: WatchHistoryDto })
  getWatchHistory(@GetUser() user: JwtUserPayload): Promise<WatchHistoryDto> {
    return this.ticketService.getUserWatchHistoty(user)
  }

  @Get('/my-tickets')
  @Roles(UserRole.Customer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tickets (Customer role required)', description: 'Retrieves tickets for the logged-in user.' })
  @ApiResponse({ status: 200, description: 'User tickets retrieved successfully.', type: TicketDto })
  findUsersTickets(@GetUser() user: JwtUserPayload): Promise<TicketsDto> {
    return this.ticketService.findUserTickets(user)
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a ticket by ID', description: 'Retrieves the details of a specific ticket by its ID.' })
  @ApiParam({ name: 'id', description: 'The ID of the ticket', type: String })
  @ApiResponse({ status: 200, description: 'Ticket details retrieved successfully.', type: TicketDto })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  findOne(@Param('id') id: string): Promise<TicketDto> {
    return this.ticketService.findTicket(id)
  }
}
