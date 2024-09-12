import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Speciality } from './speciality.entity';
import { Staff } from './staff.entity';
import { DoctorQueue } from './doctorqueue.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'text',
  })
  bio: string;

  @Column({
    type: 'float',
  })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Staff, (staff) => staff.id, { nullable: true })
  staff: Staff;

  @ManyToOne(() => Speciality, (speciality) => speciality.id, {
    nullable: true,
  })
  speciality: Speciality;

  @ManyToOne(() => DoctorQueue, (doctorqueue) => doctorqueue.id, {
    nullable: true,
  })
  doctorqueue: DoctorQueue;
}
