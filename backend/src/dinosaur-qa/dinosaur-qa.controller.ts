import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  DinosaurQaService,
  DinosaurInfo,
  DinosaurFact,
} from './dinosaur-qa.service';

interface AskRequest {
  question: string;
}

interface AskResponse {
  answer: string;
  relatedDinosaurs: DinosaurInfo[];
  relatedFacts: DinosaurFact[];
}

@Controller('dinosaur-qa')
export class DinosaurQaController {
  constructor(private readonly service: DinosaurQaService) {}

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

  @Get('dinosaurs')
  getAllDinosaurs(): DinosaurInfo[] {
    return this.service.getAllDinosaurs();
  }
}
