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

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'float',
  })
  rating: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'text',
  })
  bio: string;

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
}
