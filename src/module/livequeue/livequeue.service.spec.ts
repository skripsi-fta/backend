import { Test, TestingModule } from '@nestjs/testing';
import { LivequeueService } from './livequeue.service';

describe('LivequeueService', () => {
  let service: LivequeueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivequeueService],
    }).compile();

    service = module.get<LivequeueService>(LivequeueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
