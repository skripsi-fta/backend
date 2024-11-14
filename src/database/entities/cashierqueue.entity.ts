import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CashierQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  queueNumber: number;

  @Column({
    type: 'time',
  })
  startTime: Date;

  @Column({
    type: 'time',
    nullable: true,
  })
  finishTime: Date;

  @Column({
    type: 'date',
  })
  date: Date;
}
