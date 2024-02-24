import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';

const dataSource = (configService: ConfigService) => ({
  ...configService.get<TypeOrmModuleOptions>('db'),
  entities: [Health],
  subscribers: [],
  migrations: [],
  synchronize: true,
});

export default dataSource;
