import { Module } from '@nestjs/common';
import { FoodCalorieController } from './food-calorie.controller';
import { FoodCalorieService } from './food-calorie.service';

@Module({
  controllers: [FoodCalorieController],
  providers: [FoodCalorieService],
})
export class FoodCalorieModule {}
