import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from './appointment.entitity';

@Entity()
export class Cashierqueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @Column()
  queue_number: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  start_time: Date;

  @Column()
  end_time: Date;

  @OneToOne(() => Appointment, (id_appointment) => id_appointment)
  @JoinColumn({ name: 'id_appointment' })
  id_appointment: Appointment;
}
