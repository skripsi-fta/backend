import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entitity';
import { Room } from './room.entity';
import { TimeSlot } from './timeslot.entitity';
import { Staff } from './staff.entity';

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
    enum: ['ready', 'full', 'cancelled'],
  })
  status: string;

  @Column({
    nullable: true,
  })
  moved_to: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updated_at: Date;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @ManyToOne(() => TimeSlot, (timeslot) => timeslot.id)
  timeslot: TimeSlot;

  @ManyToOne(() => Staff, (staff) => staff.id)
  staff: Staff;

  @OneToMany(() => Appointment, (appointment) => appointment.id)
  Appointments: Appointment[];
}
