import { Test, TestingModule } from '@nestjs/testing';
import { VectordbService } from './vectordb.service';

describe('VectordbService', () => {
  let service: VectordbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectordbService],
    }).compile();

    service = module.get<VectordbService>(VectordbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
