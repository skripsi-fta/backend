import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Specialization } from './specialization.entity';
import { Staff } from './staff.entity';
import { DoctorQueue } from './doctorqueue.entity';
import { Schedule } from './schedule.entity';
import { FixedSchedule } from './fixedschedule.entity';
import { ScheduleTemp } from './scheduletemp.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'text',
  })
  profile: string;

  @Column({
    type: 'float',
    default: 0,
  })
  rating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  totalRating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  consulePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Staff, (staff) => staff.id, { nullable: true })
  @JoinColumn()
  staff: Staff;

  @ManyToOne(() => Specialization, (specialization) => specialization.id, {
    nullable: true,
  })
  specialization: Specialization;

  @OneToMany(() => DoctorQueue, (doctorqueue) => doctorqueue.doctor, {
    nullable: true,
  })
  doctorQueue: DoctorQueue;

  @OneToMany(() => Schedule, (schedule) => schedule.id)
  schedules: Schedule[];

  @OneToMany(() => ScheduleTemp, (scheduleTemp) => scheduleTemp.id)
  scheduleTemp: ScheduleTemp[];

  @OneToMany(() => FixedSchedule, (fixedSchedule) => fixedSchedule.id)
  fixedSchedules: FixedSchedule[];
}
