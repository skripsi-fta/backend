import {
  Column,
  Entity,
  ManyToOne,
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

  @ManyToOne(() => Doctor, (doctor) => doctor.doctorqueue)
  doctor: Doctor;

  @OneToOne(() => Appointment, (appointment) => appointment.id)
  appointment: Appointment;
}
