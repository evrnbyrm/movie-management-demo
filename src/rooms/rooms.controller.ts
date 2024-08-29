import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoomsDto } from './dto/rooms.dto'
import { RoomDto } from './dto/room.dto'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../utils/common.enums'
import { UpdateRoomDto } from './dto/update-room.dto'

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Roles(UserRole.Manager)
  @Post('/create')
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Only accessible by users with the **Manager** role',
  })
  @ApiResponse({ status: 201, description: 'The room has been successfully created.', type: RoomDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createRoomDto: CreateRoomDto): Promise<RoomDto> {
    return this.roomsService.createRoom(createRoomDto)
  }

  @Roles(UserRole.Manager)
  @Get()
  @ApiOperation({
    summary: 'Get all rooms',
    description: 'Only accessible by users with the **Manager** role',
  })
  @ApiResponse({ status: 200, description: 'List of all rooms.', type: RoomsDto })
  findAll() {
    return this.roomsService.findAllRooms()
  }

  @Roles(UserRole.Manager)
  @Get('/:id')
  @ApiOperation({
    summary: 'Get a room by ID',
    description: 'Only accessible by users with the **Manager** role',
  })
  @ApiResponse({ status: 200, description: 'The found room.', type: RoomDto })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findRoom(id)
  }

  @Roles(UserRole.Manager)
  @Patch('/:id')
  @ApiOperation({
    summary: 'Update a room',
    description: 'Only accessible by users with the **Manager** role',
  })
  @ApiResponse({ status: 200, description: 'The room has been successfully updated.', type: RoomDto })
  @ApiResponse({ status: 404, description: 'Room not found' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, updateRoomDto)
  }

  @Roles(UserRole.Manager)
  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete a room',
    description: 'Only accessible by users with the **Manager** role',
  })
  @ApiResponse({ status: 200, description: 'The room has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.roomsService.removeRoom(id)
  }
}
