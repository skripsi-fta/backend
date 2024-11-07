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
  queueNumber: number;

  @Column({
    type: 'time',
  })
  startTime: Date;

  @Column({
    type: 'time',
    nullable: true,
  })
  finishTime: Date;

  @Column({
    type: 'date',
  })
  date: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.doctorQueue)
  doctor: Doctor;

  @OneToOne(() => Appointment, (appointment) => appointment.id)
  appointment: Appointment;
}
