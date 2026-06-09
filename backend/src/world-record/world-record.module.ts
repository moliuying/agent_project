import { Module } from '@nestjs/common';
import { WorldRecordService } from './world-record.service';
import { WorldRecordController } from './world-record.controller';

@Module({
  imports: [],
  controllers: [WorldRecordController],
  providers: [WorldRecordService],
})
export class WorldRecordModule {}
