import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicalRecord } from './medicalrecord.entity';
import { Cashierqueue } from './cashierqueue.entity';
import { Doctorqueue } from './doctorqueue.entity';
import { Pharmacyqueue } from './pharmacyqueue.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => MedicalRecord, (medical_record) => medical_record)
  @JoinColumn()
  medical_record: MedicalRecord;

  @Column()
  booking_code: string;

  @Column()
  status_appointment: string;

  @Column({ default: false })
  is_checkdin: boolean;

  @Column()
  payment: string;

  @Column({ nullable: true })
  check_in_time: Date;

  @Column({ nullable: true })
  finish_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Cashierqueue, (cashier_queue) => cashier_queue)
  cashie_queue: Cashierqueue;

  @OneToOne(() => Doctorqueue, (doctor_queue) => doctor_queue)
  doctor_queue: Doctorqueue;

  @OneToOne(() => Pharmacyqueue, (pharmacy_queue) => pharmacy_queue)
  pharmacy_queue: Pharmacyqueue;
}
