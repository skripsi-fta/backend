import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @CreateDateColumn()
  createdDate: Date;
}
