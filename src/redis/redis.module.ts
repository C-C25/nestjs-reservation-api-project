import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  ENV_REDIS_HOST_KEY,
  ENV_REDIS_PORT_KEY,
} from '../common/const/env-keys-values.const';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>(ENV_REDIS_HOST_KEY),
          port: configService.get<number>(ENV_REDIS_PORT_KEY),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
