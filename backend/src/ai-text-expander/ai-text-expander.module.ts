import { Module } from '@nestjs/common';
import { AiTextExpanderService } from './ai-text-expander.service';
import { AiTextExpanderController } from './ai-text-expander.controller';

@Module({
  imports: [],
  controllers: [AiTextExpanderController],
  providers: [AiTextExpanderService],
})
export class AiTextExpanderModule {}
