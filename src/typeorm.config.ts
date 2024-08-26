import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    console.log(`${process.env.STAGE} db connection starting...`)
    switch (process.env.STAGE) {
      case 'dev':
        return {
          type: 'sqlite',
          synchronize: false,
          database: this.configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
        }
      case 'test':
        return {
          type: 'sqlite',
          synchronize: false,
          database: this.configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          migrationsRun: true,
        }
      case 'prod':
        return {
          type: 'postgres',
          host: this.configService.get('DB_HOST'),
          port: this.configService.get('DB_PORT'),
          username: this.configService.get('DB_USERNAME'),
          password: this.configService.get('DB_PASSWORD'),
          database: this.configService.get('DB_MANAGEMENT'),
          autoLoadEntities: true,
          synchronize: false,
          ssl: {
            rejectUnauthorized: false,
          },
        }
      default:
        throw new Error('unknown environment')
    }
  }
}
