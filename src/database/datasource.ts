import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { Test } from './entities/test.entity';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medicalrecord.entity';
import { Appointment } from './entities/appointment.entitity';
import { Doctorqueue } from './entities/doctorqueue.entity';
import { Pharmacyqueue } from './entities/pharmacyqueue.entity';
import { Cashierqueue } from './entities/cashierqueue.entity';
import { Staff } from './entities/staff.entity';
import { Room } from './entities/room.entity';
import { Scheduler } from './entities/schedule.entity';

const dataSource = (configService: ConfigService) => ({
  ...configService.get<TypeOrmModuleOptions>('db'),
  entities: [
    Health,
    Test,
    Patient,
    MedicalRecord,
    Appointment,
    Doctorqueue,
    Pharmacyqueue,
    Cashierqueue,
    Staff,
    Room,
    Scheduler,
  ],
  // entities: ['src/database/entities/*.entity.ts'],
  subscribers: [],
  migrations: [],
  synchronize: true,
  logging: true,
});

export default dataSource;
