import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiTextExpanderService, ExpandRequest, ExpandResponse } from './ai-text-expander.service';

@Controller('ai-text-expander')
export class AiTextExpanderController {
  constructor(private readonly aiTextExpanderService: AiTextExpanderService) {}

  @Post('expand')
  async expand(@Body() body: ExpandRequest): Promise<ExpandResponse> {
    if (!body.text || !body.text.trim()) {
      throw new HttpException('请输入需要扩写的内容', HttpStatus.BAD_REQUEST);
    }
    if (body.text.trim().length > 500) {
      throw new HttpException('输入内容过长，请控制在500字以内', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.aiTextExpanderService.expand(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '生成失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
