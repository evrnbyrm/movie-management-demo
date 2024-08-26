import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ResponseInterceptor } from './interceptors/response-interceptor.interceptor'
import { CustomExceptionFilter } from './filters/custom-exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new CustomExceptionFilter())
  const config = new DocumentBuilder().setTitle('Movie Management Demo API').setDescription('API documentation for the Movie Management Demo').setVersion('1.0').addBearerAuth().build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)
  await app.listen(process.env.PORT || 3000)
}
bootstrap()
