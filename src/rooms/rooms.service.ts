import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Room } from './room.entity'
import { CreateRoomDto } from './dto/create-room.dto'
import { RoomsDto } from './dto/rooms.dto'

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private roomRepository: Repository<Room>) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto)
    return this.roomRepository.save(room)
  }

  async findAllRooms(): Promise<RoomsDto> {
    const rooms = await this.roomRepository.find()
    return { rooms }
  }

  async findRoom(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } })
    if (!room) {
      throw new NotFoundException(`Cannot find room with ID: ${id}`)
    }
    return room
  }

  async updateRoom(id: string, updateRoomDto: Partial<CreateRoomDto>): Promise<Room> {
    const room = await this.findRoom(id)
    Object.assign(room, updateRoomDto)
    return this.roomRepository.save(room)
  }

  async removeRoom(id: string): Promise<void> {
    const room = await this.findRoom(id)
    await this.roomRepository.remove(room)
  }
}
