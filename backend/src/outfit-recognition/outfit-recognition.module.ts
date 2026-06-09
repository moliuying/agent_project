import { Module } from '@nestjs/common';
import { OutfitRecognitionController } from './outfit-recognition.controller';
import { OutfitRecognitionService } from './outfit-recognition.service';

@Module({
  controllers: [OutfitRecognitionController],
  providers: [OutfitRecognitionService],
})
export class OutfitRecognitionModule {}
