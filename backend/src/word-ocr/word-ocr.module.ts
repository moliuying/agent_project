import { Module } from '@nestjs/common';
import { WordOcrController } from './word-ocr.controller';
import { WordOcrService } from './word-ocr.service';

@Module({
  controllers: [WordOcrController],
  providers: [WordOcrService],
  exports: [WordOcrService],
})
export class WordOcrModule {}
