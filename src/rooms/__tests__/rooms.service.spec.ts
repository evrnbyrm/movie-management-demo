import { Test, TestingModule } from '@nestjs/testing'
import { RoomsService } from '../rooms.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Room } from '../room.entity'
import { CreateRoomDto } from '../dto/create-room.dto'
import { NotFoundException } from '@nestjs/common'
import { getMockRepository, generateMockRoom, generateMultiple } from '../../../test/common'

describe('RoomsService', () => {
  let service: RoomsService
  let roomsTable: Record<string, Room>

  beforeEach(async () => {
    roomsTable = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(Room),
          useValue: getMockRepository<Room>(roomsTable),
        },
      ],
    }).compile()

    service = module.get<RoomsService>(RoomsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a room', async () => {
    const newRoom: CreateRoomDto = generateMockRoom()
    const room = await service.createRoom(newRoom)

    expect(room.id).toBeDefined()
    expect(roomsTable[room.id]).toEqual(room)
  })

  it('should find all roomes', async () => {
    const rooms = generateMultiple<CreateRoomDto>(generateMockRoom)
    await Promise.all(rooms.map((r) => service.createRoom(r)))
    const allRooms = await service.findAllRooms()

    expect(allRooms.rooms).toBeDefined()
    expect(allRooms.rooms.length).toBe(rooms.length)
    expect(allRooms.rooms.length).toBe(Object.keys(roomsTable).length)
    expect(rooms.every((r) => !!allRooms.rooms.find((responseRoom) => responseRoom.room_number === r.room_number))).toBeTruthy()
  })

  it('should find a room by id', async () => {
    const generatedRooms = await Promise.all(generateMultiple<CreateRoomDto>(generateMockRoom).map((r) => service.createRoom(r)))
    const foundRoom = await service.findRoom(generatedRooms[2].id)

    expect(foundRoom).toBeDefined()
    expect(foundRoom).toEqual(generatedRooms[2])
  })

  it('should throw NotFoundException when room not found by id', async () => {
    await Promise.all(generateMultiple<CreateRoomDto>(generateMockRoom).map((r) => service.createRoom(r)))
    await expect(service.findRoom('123')).rejects.toThrow(NotFoundException)
  })

  it('should update a room', async () => {
    const generatedRoom = await service.createRoom(generateMockRoom())
    const updateDto = { capacity: 1 }
    const updatedRoom = await service.updateRoom(generatedRoom.id, updateDto)

    expect(roomsTable[generatedRoom.id]).toEqual({ ...generatedRoom, ...updateDto })
    expect(updatedRoom).toEqual(roomsTable[generatedRoom.id])
  })

  it('should throw NotFoundException on update if room id is not found ', async () => {
    await Promise.all(generateMultiple<CreateRoomDto>(generateMockRoom).map((r) => service.createRoom(r)))
    await expect(service.updateRoom('123', { room_number: 'Room 123' })).rejects.toThrow(NotFoundException)
  })

  it('should remove a room', async () => {
    const generatedRooms = await Promise.all(generateMultiple<CreateRoomDto>(generateMockRoom).map((r) => service.createRoom(r)))
    await service.removeRoom(generatedRooms[1].id)

    expect(roomsTable[generatedRooms[1].id]).toBeUndefined()
    expect(Object.keys(roomsTable).length).toBe(generatedRooms.length - 1)
  })

  it('should throw error on delete if room id is not found', async () => {
    await Promise.all(generateMultiple<CreateRoomDto>(generateMockRoom).map((r) => service.createRoom(r)))
    await expect(service.removeRoom('123')).rejects.toThrow(NotFoundException)
  })
})
