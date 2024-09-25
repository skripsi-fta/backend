import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Auth } from './auth.entitity';
import { MedicalRecord } from './medicalrecord.entity';

export enum IdType {
  PASSPORT = 'PASSPORT',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address: string;

  @Column({
    type: 'date',
  })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: string;

  @Column({
    type: 'enum',
    enum: IdType,
  })
  idType: string;

  @Column({
    type: 'varchar',
  })
  idNumber: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  idPhoto: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updated_at: Date;

  @OneToOne(() => Auth, (auth) => auth.patient, { nullable: true })
  auth: Auth;

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.patient, {
    nullable: true,
  })
  medicalRecords: MedicalRecord[];
}
