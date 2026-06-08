import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PictureWritingService, PictureWritingRequest, PictureWritingResponse } from './picture-writing.service';

@Controller('picture-writing')
export class PictureWritingController {
  constructor(private readonly pictureWritingService: PictureWritingService) {}

  @Post('generate')
  async generate(@Body() body: PictureWritingRequest): Promise<PictureWritingResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传参考图片', HttpStatus.BAD_REQUEST);
    }
    if (body.userDescription && body.userDescription.trim().length > 300) {
      throw new HttpException('图片描述过长，请控制在300字以内', HttpStatus.BAD_REQUEST);
    }
    if (body.customRequirements && body.customRequirements.trim().length > 300) {
      throw new HttpException('特殊要求过长，请控制在300字以内', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.pictureWritingService.generate(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '生成失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
