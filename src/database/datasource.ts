import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { Test } from './entities/test.entity';

const dataSource = (configService: ConfigService) => ({
  ...configService.get<TypeOrmModuleOptions>('db'),
  entities: [Health, Test],
  subscribers: [],
  migrations: [],
  synchronize: true,
});

export default dataSource;
