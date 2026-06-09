import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { OutfitRecognitionService, OutfitRecognitionRequest, OutfitRecognitionResponse } from './outfit-recognition.service';

@Controller('outfit-recognition')
export class OutfitRecognitionController {
  constructor(private readonly outfitRecognitionService: OutfitRecognitionService) {}

  @Post('recognize')
  async recognize(@Body() body: OutfitRecognitionRequest): Promise<OutfitRecognitionResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传服装图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.outfitRecognitionService.recognize(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '识别失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
