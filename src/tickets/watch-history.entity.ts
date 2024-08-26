import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from '../users/user.entity'
import { TableNames, TimeSlot } from '../utils/common.enums'

@Entity({ name: TableNames.WATCH_HISTORY })
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.watchHistory, { onDelete: 'CASCADE' })
  user: User

  @Column()
  movie: string

  @Column({
    type: 'varchar',
    enum: TimeSlot,
  })
  time_slot: TimeSlot

  @Column({ type: 'date' })
  watched_at: string
}
