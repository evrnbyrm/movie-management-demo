import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { MovieSession } from '../sessions/movie-session.entity'
import { User } from '../users/user.entity'
import { TableNames } from '../utils/common.enums'

@Entity({ name: TableNames.TICKETS })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => MovieSession, (session) => session.tickets, { onDelete: 'CASCADE' })
  session: MovieSession

  @Column()
  purchase_date: Date

  @Column({ default: false })
  used: boolean
}
