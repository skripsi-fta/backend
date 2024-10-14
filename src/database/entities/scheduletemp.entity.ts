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
import { Schedule } from './schedule.entity';

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
    enum: ['waiting', 'approved', 'cancelled'],
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

  @Column({ nullable: true })
  notesAdmin: string;

  @ManyToOne(() => Room, (room) => room.id, { nullable: true })
  room: Room;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  oldSchedule: Schedule;
}
