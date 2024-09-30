import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Room } from './room.entity';

@Entity()
@Index(['day', 'startTime', 'endTime', 'room'], { unique: true })
export class FixedSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ],
  })
  day: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;
}
