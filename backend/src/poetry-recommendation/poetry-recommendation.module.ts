import { Module } from '@nestjs/common';
import { PoetryRecommendationService } from './poetry-recommendation.service';
import { PoetryRecommendationController } from './poetry-recommendation.controller';

@Module({
  imports: [],
  controllers: [PoetryRecommendationController],
  providers: [PoetryRecommendationService],
})
export class PoetryRecommendationModule {}
