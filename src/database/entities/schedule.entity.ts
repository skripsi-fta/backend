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
import { Appointment } from './appointment.entitity';
import { Room } from './room.entity';
import { Doctor } from './doctor.entity';

@Entity()
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
  movedTo: number;

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

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor: Doctor;

  @OneToMany(() => Appointment, (appointment) => appointment.id)
  Appointments: Appointment[];
}
