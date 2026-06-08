import { Module } from '@nestjs/common';
import { PictureWritingService } from './picture-writing.service';
import { PictureWritingController } from './picture-writing.controller';

@Module({
  imports: [],
  controllers: [PictureWritingController],
  providers: [PictureWritingService],
})
export class PictureWritingModule {}
