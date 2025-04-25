import { Test, TestingModule } from '@nestjs/testing';
import { CoordinationService } from './coordination.service';

describe('CoordinationService', () => {
  let service: CoordinationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoordinationService],
    }).compile();

    service = module.get<CoordinationService>(CoordinationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
