import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm'
import { Movie } from '../movies/movie.entity'
import { Room } from '../rooms/room.entity'
import { Ticket } from '../tickets/ticket.entity'
import { TableNames, TimeSlot } from '../utils/common.enums'

@Entity({ name: TableNames.MOVIE_SESSIONS })
@Unique(['date', 'room', 'time_slot'])
export class MovieSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Movie, (movie) => movie.sessions, { onDelete: 'CASCADE' })
  movie: Movie

  @ManyToOne(() => Room, (room) => room.sessions, { onDelete: 'CASCADE' })
  room: Room

  @Column({ type: 'date' })
  date: string

  @Column({
    type: 'varchar',
    enum: TimeSlot,
  })
  time_slot: TimeSlot

  @OneToMany(() => Ticket, (ticket) => ticket.session, { cascade: true })
  tickets: Ticket[]
}
