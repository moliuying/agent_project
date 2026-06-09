import { Module } from '@nestjs/common';
import { LiteratureQaService } from './literature-qa.service';
import { LiteratureQaController } from './literature-qa.controller';

@Module({
  imports: [],
  controllers: [LiteratureQaController],
  providers: [LiteratureQaService],
})
export class LiteratureQaModule {}
