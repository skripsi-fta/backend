import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { Test } from './entities/test.entity';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medicalrecord.entity';
import { Appointment } from './entities/appointment.entitity';
import { DoctorQueue } from './entities/doctorqueue.entity';
import { PharmacyQueue } from './entities/pharmacyqueue.entity';
import { CashierQueue } from './entities/cashierqueue.entity';
import { Staff } from './entities/staff.entity';
import { Room } from './entities/room.entity';
import { Schedule } from './entities/schedule.entity';
import { Auth } from './entities/auth.entitity';
import { TimeSlot } from './entities/timeslot.entitity';

const dataSource = (configService: ConfigService) => ({
  ...configService.get<TypeOrmModuleOptions>('db'),
  entities: [
    Health,
    Test,
    Patient,
    MedicalRecord,
    Appointment,
    DoctorQueue,
    PharmacyQueue,
    CashierQueue,
    Staff,
    Room,
    Schedule,
    TimeSlot,
    Auth,
  ],
  subscribers: [],
  migrations: [],
  synchronize: true,
  logging: true,
});

export default dataSource;
