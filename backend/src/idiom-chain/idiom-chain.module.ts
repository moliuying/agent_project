import { Module } from '@nestjs/common';
import { IdiomChainService } from './idiom-chain.service';
import { IdiomChainController } from './idiom-chain.controller';

@Module({
  imports: [],
  controllers: [IdiomChainController],
  providers: [IdiomChainService],
})
export class IdiomChainModule {}
