import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';
import { FixedSchedule } from './fixedschedule.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  detail: string;

  @OneToMany(() => Schedule, (schedule) => schedule.id)
  schedules: Schedule[];

  @OneToMany(() => FixedSchedule, (fixedSchedule) => fixedSchedule.id)
  fixedSchedules: FixedSchedule[];
}
