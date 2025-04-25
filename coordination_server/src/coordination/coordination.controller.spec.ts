import { Test, TestingModule } from '@nestjs/testing';
import { CoordinationController } from './coordination.controller';

describe('CoordinationController', () => {
  let controller: CoordinationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoordinationController],
    }).compile();

    controller = module.get<CoordinationController>(CoordinationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
