import { Module } from '@nestjs/common';
import { ImageToPromptService } from './image-to-prompt.service';
import { ImageToPromptController } from './image-to-prompt.controller';

@Module({
  imports: [],
  controllers: [ImageToPromptController],
  providers: [ImageToPromptService],
})
export class ImageToPromptModule {}
