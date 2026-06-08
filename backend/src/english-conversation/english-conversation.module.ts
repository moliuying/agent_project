import { Module } from '@nestjs/common';
import { EnglishConversationController } from './english-conversation.controller';
import { EnglishConversationService } from './english-conversation.service';

@Module({
  controllers: [EnglishConversationController],
  providers: [EnglishConversationService],
})
export class EnglishConversationModule {}
