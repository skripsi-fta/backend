import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from '../entities/staff.entity';
import { Repository } from 'typeorm';
import { encodePassword } from 'src/utils/bcrypt.utils';
import { LoggerService } from 'src/module/logger/logger.service';

@Injectable()
export class InitDatabaseService implements OnApplicationBootstrap {
  constructor(
    private log: LoggerService,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async onApplicationBootstrap() {
    const data = await this.staffRepository.findOne({
      where: {
        email: 'super_admin@gmail.com',
      },
    });

    if (data) {
      this.log.info('Super Admin Exist, Skip Creating');
    } else {
      const newData = this.staffRepository.create({
        email: 'super_admin@gmail.com',
        name: 'Super Admin',
        role: 'MANAGEMENT',
        username: 'superadmin',
      });

      newData.password = await encodePassword('password123');

      await this.staffRepository.save(newData);

      this.log.info('Super Admin Created');
    }
  }
}
