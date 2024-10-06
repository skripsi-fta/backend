import { Test, TestingModule } from '@nestjs/testing';
import { MedicalrecordController } from './medicalrecord.controller';

describe('MedicalrecordController', () => {
  let controller: MedicalrecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalrecordController],
    }).compile();

    controller = module.get<MedicalrecordController>(MedicalrecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
