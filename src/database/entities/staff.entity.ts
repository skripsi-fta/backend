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
import { DoctorQueue } from './doctorqueue.entity';
import { Doctor } from './doctor.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: ['DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST', 'ADMIN'],
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

  @ManyToOne(() => DoctorQueue, (doctorqueue) => doctorqueue.id, {
    nullable: true,
  })
  doctorqueue: DoctorQueue;
}
