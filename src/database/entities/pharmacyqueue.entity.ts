import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from './appointment.entitity';

@Entity()
export class PharmacyQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'time',
  })
  startTime: Date;

  @Column({
    type: 'time',
  })
  finishTime: Date;

  @Column({
    type: 'date',
  })
  date: Date;

  @OneToOne(() => Appointment, (appointment) => appointment.id)
  appointment: Appointment;
}
