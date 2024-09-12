import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medicalrecord.entity';
import { DoctorQueue } from './doctorqueue.entity';
import { PharmacyQueue } from './pharmacyqueue.entity';
import { CashierQueue } from './cashierqueue.entity';
import { Schedule } from './schedule.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  booking_code: string;

  @Column({})
  booking_qr: string;

  @Column({
    type: 'enum',
    enum: [
      'waiting',
      'checkin',
      'doctor queue',
      'pharmacy queue',
      'cashier queue',
      'done',
      'cancel',
    ],
  })
  appointment_status: string;

  @Column({ default: false })
  is_check_in: boolean;

  @Column({
    type: 'time',
    nullable: true,
  })
  check_in_time: Date;

  @Column({
    type: 'time',
    nullable: true,
  })
  finish_time: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  consultation_fee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  pharmacy_fee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  admin_fee: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updated_at: Date;

  @OneToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.id, {
    nullable: true,
  })
  @JoinColumn()
  medical_record: MedicalRecord;

  @OneToOne(() => DoctorQueue, (doctorQueue) => doctorQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  doctor_queue: DoctorQueue;

  @OneToOne(() => PharmacyQueue, (pharmacyQueue) => pharmacyQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  pharmacy_queue: PharmacyQueue;

  @OneToOne(() => CashierQueue, (cashierQueue) => cashierQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  cashier_queue: CashierQueue;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  schedule: Schedule;
}
