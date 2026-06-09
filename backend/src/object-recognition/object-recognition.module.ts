import { Module } from '@nestjs/common';
import { ObjectRecognitionController } from './object-recognition.controller';
import { ObjectRecognitionService } from './object-recognition.service';

@Module({
  controllers: [ObjectRecognitionController],
  providers: [ObjectRecognitionService],
})
export class ObjectRecognitionModule {}
