import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ImageToPromptService, ImageToPromptRequest, ImageToPromptResponse } from './image-to-prompt.service';

@Controller('image-to-prompt')
export class ImageToPromptController {
  constructor(private readonly imageToPromptService: ImageToPromptService) {}

  @Post('generate')
  async generate(@Body() body: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传参考图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.imageToPromptService.generate(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '生成失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
