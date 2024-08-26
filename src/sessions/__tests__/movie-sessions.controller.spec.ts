import { Test, TestingModule } from '@nestjs/testing'
import { MovieSessionsController } from '../movie-sessions.controller'

describe('SessionsController', () => {
  let controller: MovieSessionsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieSessionsController],
    }).compile()

    controller = module.get<MovieSessionsController>(MovieSessionsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
