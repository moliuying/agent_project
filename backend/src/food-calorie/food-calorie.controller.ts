import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FoodCalorieService, FoodCalorieRequest, FoodCalorieResponse } from './food-calorie.service';

@Controller('food-calorie')
export class FoodCalorieController {
  constructor(private readonly foodCalorieService: FoodCalorieService) {}

  @Post('recognize')
  async recognize(@Body() body: FoodCalorieRequest): Promise<FoodCalorieResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传食物图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.foodCalorieService.recognize(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '识别失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
