import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { MovieSession } from '../sessions/movie-session.entity'
import { TableNames } from '../utils/common.enums'

@Entity({ name: TableNames.ROOMS })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  room_number: string

  @Column({ nullable: true })
  capacity: number

  @OneToMany(() => MovieSession, (session) => session.room, { cascade: true })
  sessions: MovieSession[]
}
