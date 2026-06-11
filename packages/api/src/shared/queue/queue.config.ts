import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env';
import { BullModule } from '@nestjs/bullmq';
import { PIKSLOT_EVENTS } from './jobs/pikslot.events';

export const QUEUE_CONFIG = BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService<Env, true>) => ({
    connection: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
    settings: {},
  }),
});

export const REGISTERED_QUEUES = BullModule.registerQueue(
  {
    name: PIKSLOT_EVENTS.BUSINESS.BUSINESS_REGISTRATION_INVITE,
  },
  {
    name: PIKSLOT_EVENTS.USER.USER_ASSIGN_TO_BUSINESS,
  },
  {
    name: PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT
      .ASSIGN_SERVICE_TO_SERVICE_GROUPS, //  (single) service --> assing to --> service groups (multiple)
  },
  {
    name: PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT
      .ASSIGN_SERVICE_GROUP_TO_SERVICES, //  (single) service group --> assing to --> services (multiple)
  },
);
