import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Specialization } from './specialization.entity';
import { Staff } from './staff.entity';
import { DoctorQueue } from './doctorqueue.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'text',
  })
  profile: string;

  @Column({
    type: 'float',
    default: 0,
  })
  rating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  totalRating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  consulePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Staff, (staff) => staff.id, { nullable: true })
  staff: Staff;

  @ManyToOne(() => Specialization, (specialization) => specialization.id, {
    nullable: true,
  })
  specialization: Specialization;

  @ManyToOne(() => DoctorQueue, (doctorqueue) => doctorqueue.id, {
    nullable: true,
  })
  doctorqueue: DoctorQueue;
}
