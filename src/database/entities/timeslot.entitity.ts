import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity()
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'time',
  })
  start_time: Date;

  @Column({
    type: 'time',
  })
  end_time: Date;

  @Column()
  duration: number;

  @OneToMany(() => Schedule, (schedule) => schedule.id)
  schedules: Schedule[];
}
