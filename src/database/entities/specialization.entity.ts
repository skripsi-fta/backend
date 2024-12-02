import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

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

  @Column({
    type: 'varchar',
    nullable: true,
  })
  photoPath: string;

  @OneToMany(() => Doctor, (Doctor) => Doctor.specialization, {
    nullable: true,
  })
  doctors: Doctor[];
}
