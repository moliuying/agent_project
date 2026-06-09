import { Module } from '@nestjs/common';
import { SceneEnglishService } from './scene-english.service';
import { SceneEnglishController } from './scene-english.controller';

@Module({
  controllers: [SceneEnglishController],
  providers: [SceneEnglishService],
})
export class SceneEnglishModule {}
