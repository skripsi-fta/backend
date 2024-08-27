import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class Scheduler {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room)
  room: Room;

  @Column()
  date: Date;

  @Column()
  status: string;

  @Column()
  moved_to: string;

  @Column()
  updated_by: string;
}
