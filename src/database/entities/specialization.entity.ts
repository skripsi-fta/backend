import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Staff, (staff) => staff.specialization, { nullable: true })
  staffs: Staff[];
}
