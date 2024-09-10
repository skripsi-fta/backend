import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from './appointment.entitity';
import { Doctor } from './doctor.entity';

@Entity()
export class DoctorQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  queue_number: number;

  @Column({
    type: 'time',
  })
  start_time: Date;

  @Column({
    type: 'time',
  })
  finish_time: Date;

  @Column({
    type: 'date',
  })
  date: Date;

  @OneToMany(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @OneToOne(() => Appointment, (appointment) => appointment.id)
  appointment: Appointment;
}
