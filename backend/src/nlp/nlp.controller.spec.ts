import { Test, TestingModule } from '@nestjs/testing';
import { NlpController } from './nlp.controller';
import { NlpService } from './nlp.service';

describe('NlpController', () => {
  let controller: NlpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NlpController],
      providers: [NlpService],
    }).compile();

    controller = module.get<NlpController>(NlpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
