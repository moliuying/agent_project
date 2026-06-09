import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  CookingQaService,
  CookingTip,
  AskResponse,
} from './cooking-qa.service';

interface AskRequest {
  question: string;
}

@Controller('cooking-qa')
export class CookingQaController {
  constructor(private readonly service: CookingQaService) {}

  @Post('ask')
  ask(@Body() body: AskRequest): AskResponse {
    if (!body.question || !body.question.trim()) {
      throw new HttpException('请输入问题', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.service.ask(body.question);
    } catch (e: any) {
      throw new HttpException(e.message || '回答失败', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('suggested-questions')
  getSuggestedQuestions(): string[] {
    return this.service.getSuggestedQuestions();
  }

  @Get('cooking-tips')
  getAllCookingTips(): CookingTip[] {
    return this.service.getAllCookingTips();
  }
}
