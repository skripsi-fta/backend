import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Room } from './room.entity';
import { Schedule } from './schedule.entity';

export enum ScheduleDay {
  SENIN = 'SENIN',
  SELASA = 'SELASA',
  RABU = 'RABU',
  KAMIS = 'KAMIS',
  JUMAT = 'JUMAT',
  SABTU = 'SABTU',
  MINGGU = 'MINGGU',
}

export enum ScheduleDayNumber {
  MINGGU = 0,
  SENIN = 1,
  SELASA = 2,
  RABU = 3,
  KAMIS = 4,
  JUMAT = 5,
  SABTU = 6,
}

@Entity()
@Index(['day', 'startTime', 'endTime', 'room'], { unique: true })
export class FixedSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ScheduleDay,
  })
  day: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column()
  capacity: number;

  @Column({
    default: () => 'NOW()',
    type: 'timestamptz',
  })
  syncDate: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @OneToMany(() => Schedule, (schedule) => schedule.id)
  schedule: Schedule[];
}
