import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { MovieSession } from '../sessions/movie-session.entity'
import { TableNames } from '../utils/common.enums'

@Entity({ name: TableNames.MOVIES })
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  age_restriction: number

  @OneToMany(() => MovieSession, (session) => session.movie, { cascade: true })
  sessions: MovieSession[]
}
