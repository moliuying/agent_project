import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ThesisWriterService, GenerateRequest, GenerateResponse } from './thesis-writer.service';

@Controller('thesis-writer')
export class ThesisWriterController {
  constructor(private readonly thesisWriterService: ThesisWriterService) {}

  @Post('generate')
  async generate(@Body() body: GenerateRequest): Promise<GenerateResponse> {
    if (!body.topic || !body.topic.trim()) {
      throw new HttpException('请输入论文题目', HttpStatus.BAD_REQUEST);
    }
    if (body.topic.trim().length > 100) {
      throw new HttpException('论文题目过长，请控制在100字以内', HttpStatus.BAD_REQUEST);
    }
    if (body.researchDirection && body.researchDirection.trim().length > 100) {
      throw new HttpException('研究方向描述过长，请控制在100字以内', HttpStatus.BAD_REQUEST);
    }
    if (body.customRequirements && body.customRequirements.trim().length > 500) {
      throw new HttpException('特殊要求过长，请控制在500字以内', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.thesisWriterService.generate(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '生成失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
