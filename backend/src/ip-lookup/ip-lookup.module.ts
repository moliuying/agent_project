import { Module } from '@nestjs/common';
import { IpLookupService } from './ip-lookup.service';
import { IpLookupController } from './ip-lookup.controller';

@Module({
  imports: [],
  controllers: [IpLookupController],
  providers: [IpLookupService],
})
export class IpLookupModule {}
