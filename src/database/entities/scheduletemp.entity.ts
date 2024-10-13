import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { Doctor } from './doctor.entity';

@Entity()
export class ScheduleTemp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'date',
  })
  date: Date;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: ['ready', 'in review', 'cancelled', 'changed'],
  })
  status: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt: Date;

  @Column()
  notes: string;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;
}
