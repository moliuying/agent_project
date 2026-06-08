import { Module } from '@nestjs/common';
import { ThesisWriterService } from './thesis-writer.service';
import { ThesisWriterController } from './thesis-writer.controller';

@Module({
  imports: [],
  controllers: [ThesisWriterController],
  providers: [ThesisWriterService],
})
export class ThesisWriterModule {}
