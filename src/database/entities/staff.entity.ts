import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { Doctor } from './doctor.entity';
import { Specialization } from './specialization.entity';

export enum StaffRole {
  DOCTOR = 'DOCTOR',
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER',
  MANAGEMENT = 'MANAGEMENT',
}

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  username: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    type: 'enum',
    enum: StaffRole,
  })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updated_at: Date;

  @OneToOne(() => Doctor, (doctor) => doctor.id, { nullable: true })
  @JoinColumn()
  doctor: Doctor;

  @OneToMany(() => Schedule, (schedule) => schedule.id, { nullable: true })
  schedules: Schedule[];

  @ManyToOne(() => Specialization, (specialization) => specialization.staffs, {
    nullable: true,
  })
  specialization: Specialization;
}
