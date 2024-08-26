import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { MoviesModule } from './movies/movies.module'
import { MovieSessionsModule } from './sessions/movie-sessions.module'
import { RoomsModule } from './rooms/rooms.module'
import { TicketsModule } from './tickets/tickets.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtStrategy } from './auth/jwt.strategy'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmConfigService } from './typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.STAGE === 'prod' ? '.env' : `.env.${process.env.STAGE}.local`,
    }),
    ConfigModule,
    UsersModule,
    MoviesModule,
    MovieSessionsModule,
    RoomsModule,
    TicketsModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy, ConfigService],
})
export class AppModule {}
