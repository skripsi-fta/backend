import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entitity';
import { Room } from './room.entity';
import { Doctor } from './doctor.entity';
import { FixedSchedule } from './fixedschedule.entity';
import { ScheduleTemp } from './scheduletemp.entity';

@Entity()
@Index(['date', 'startTime', 'endTime', 'room'], { unique: true })
export class Schedule {
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

  @OneToOne(() => Schedule, { nullable: true })
  @JoinColumn()
  movedTo: Schedule;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: ['special', 'regular'] })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt: Date;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @OneToMany(() => Appointment, (appointment) => appointment.schedule)
  appointments: Appointment[];

  @ManyToOne(() => FixedSchedule, (FixedSchedule) => FixedSchedule.id, {
    nullable: true,
  })
  fixedSchedule: FixedSchedule;

  @OneToMany(() => ScheduleTemp, (ScheduleTemp) => ScheduleTemp.id)
  scheduleTemp: ScheduleTemp[];
}
