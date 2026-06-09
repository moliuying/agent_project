import { Module } from '@nestjs/common';
import { DinosaurQaService } from './dinosaur-qa.service';
import { DinosaurQaController } from './dinosaur-qa.controller';

@Module({
  imports: [],
  controllers: [DinosaurQaController],
  providers: [DinosaurQaService],
})
export class DinosaurQaModule {}
