import { Injectable } from '@nestjs/common';
import { AuthDTO } from './model/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async validateUser(req: AuthDTO) {
    const findUser = await this.staffRepository.findOneBy({
      username: req.username,
    });

    if (!findUser) {
      return null;
    }

    const { password, created_at, updated_at, ...user } = findUser;

    if (password !== req.password) {
      return null;
    }

    return user;
    // return this.jwtService.sign(user);
  }
}
