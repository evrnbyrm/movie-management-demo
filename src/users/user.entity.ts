import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Ticket } from '../tickets/ticket.entity'
import { WatchHistory } from '../tickets/watch-history.entity'
import { TableNames, UserRole } from '../utils/common.enums'

@Entity({ name: TableNames.USERS })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column()
  age: number

  @Column({
    type: 'varchar',
    enum: UserRole,
  })
  role: UserRole

  @OneToMany(() => Ticket, (ticket) => ticket.user, { cascade: true })
  tickets: Ticket[]

  @OneToMany(() => WatchHistory, (watchHistory) => watchHistory.user, { cascade: true })
  watchHistory: WatchHistory[]
}
