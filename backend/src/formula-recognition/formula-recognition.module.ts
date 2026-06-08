import { Module } from '@nestjs/common';
import { FormulaRecognitionController } from './formula-recognition.controller';
import { FormulaRecognitionService } from './formula-recognition.service';

@Module({
  controllers: [FormulaRecognitionController],
  providers: [FormulaRecognitionService],
  exports: [FormulaRecognitionService],
})
export class FormulaRecognitionModule {}
