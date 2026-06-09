import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  LiteratureQaService,
  BookInfo,
  AskResponse,
} from './literature-qa.service';

interface AskRequest {
  question: string;
}

@Controller('literature-qa')
export class LiteratureQaController {
  constructor(private readonly service: LiteratureQaService) {}

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

  @Get('books')
  getAllBooks(): BookInfo[] {
    return this.service.getAllBooks();
  }
}
