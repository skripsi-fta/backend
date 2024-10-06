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
import { Patient } from './patient.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  bookingCode: string;

  @Column({ nullable: false })
  bookingQr: string;

  @Column({
    type: 'enum',
    enum: [
      'scheduled',
      'checkin',
      'doctor queue',
      'pharmacy queue',
      'cashier queue',
      'done',
      'cancel',
    ],
    default: 'scheduled',
  })
  appointmentStatus: string;

  @Column({ default: false })
  isCheckIn: boolean;

  @Column({
    type: 'time',
    nullable: true,
  })
  checkInTime: Date;

  @Column({
    type: 'time',
    nullable: true,
  })
  finishTime: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  consultationFee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  pharmacyFee: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt: Date;

  @OneToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.id, {
    nullable: true,
  })
  @JoinColumn()
  medicalRecord: MedicalRecord;

  @OneToOne(() => DoctorQueue, (doctorQueue) => doctorQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  doctorQueue: DoctorQueue;

  @OneToOne(() => PharmacyQueue, (pharmacyQueue) => pharmacyQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  pharmacyQueue: PharmacyQueue;

  @OneToOne(() => CashierQueue, (cashierQueue) => cashierQueue.id, {
    nullable: true,
  })
  @JoinColumn()
  cashierQueue: CashierQueue;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  schedule: Schedule;

  @ManyToOne(() => Patient, (patient) => patient.id)
  patient: Patient;
}
