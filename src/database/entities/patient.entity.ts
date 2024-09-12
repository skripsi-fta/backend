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

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  address: string;

  @Column({
    type: 'date',
  })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: ['MALE', 'FEMALE'],
  })
  gender: string;

  @Column({
    type: 'enum',
    enum: IdType,
  })
  id_type: IdType;

  @Column({
    type: 'varchar',
    length: 25,
  })
  id_number: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  id_photo: string;

  @Column({
    default: false,
  })
  is_deleted: boolean;

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
