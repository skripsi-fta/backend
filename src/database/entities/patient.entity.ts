import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MedicalRecord } from './medicalrecord.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name: string;

  @Column()
  NIK: string;

  @Column()
  DOB: Date;

  @Column()
  address: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord, {
    onDelete: 'CASCADE',
  })
  medicalRecord: MedicalRecord[];
}
