import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Appointment } from './appointment.entitity';

@Entity()
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  illness: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  diagnosisDoctor: string;

  @Column('text', { nullable: true, array: true })
  prescription: string[];

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.id)
  patient: Patient;

  @OneToOne(() => Appointment, (appointment) => appointment.id)
  appointment: Appointment;
}
