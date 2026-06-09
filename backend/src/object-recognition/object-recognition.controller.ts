import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ObjectRecognitionService, ObjectRecognitionRequest, ObjectRecognitionResponse } from './object-recognition.service';

@Controller('object-recognition')
export class ObjectRecognitionController {
  constructor(private readonly objectRecognitionService: ObjectRecognitionService) {}

  @Post('recognize')
  async recognize(@Body() body: ObjectRecognitionRequest): Promise<ObjectRecognitionResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.objectRecognitionService.recognize(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '识别失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
