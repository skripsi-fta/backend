import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Appointment } from './appointment.entitity';

@Entity()
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient, { onDelete: 'CASCADE' })
  patient: Patient;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column()
  systolic: number;

  @Column()
  diastolic: number;

  @Column()
  temperature: number;

  @Column()
  diagnosis_doctor: string;

  @Column()
  prescription: string;

  @OneToOne(() => Appointment, (appointment) => appointment)
  appointment: Appointment;
}
