import { Controller, Get, Param, Post, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { WorldRecordService, WorldRecord, WorldRecordAnswer, CategoryInfo } from './world-record.service';

interface AskRequest {
  question: string;
}

@Controller('world-record')
export class WorldRecordController {
  constructor(private readonly worldRecordService: WorldRecordService) {}

  @Get('categories')
  getCategories(): CategoryInfo[] {
    return this.worldRecordService.getCategories();
  }

  @Get('all')
  getAllRecords(): WorldRecord[] {
    return this.worldRecordService.getAllRecords();
  }

  @Get('random')
  getRandomRecords(@Query('count') count?: string): WorldRecord[] {
    const n = count ? parseInt(count, 10) : 5;
    return this.worldRecordService.getRandomRecords(isNaN(n) ? 5 : n);
  }

  @Get('category/:category')
  getRecordsByCategory(@Param('category') category: string): WorldRecord[] {
    return this.worldRecordService.getRecordsByCategory(decodeURIComponent(category));
  }

  @Get('id/:id')
  getRecordById(@Param('id') id: string): WorldRecord | { message: string } {
    const record = this.worldRecordService.getRecordById(id);
    if (!record) {
      return { message: '未找到该记录' };
    }
    return record;
  }

  @Post('ask')
  ask(@Body() body: AskRequest): WorldRecordAnswer {
    if (!body.question || !body.question.trim()) {
      throw new HttpException('请输入您的问题', HttpStatus.BAD_REQUEST);
    }
    return this.worldRecordService.ask(body.question);
  }

  @Get('ask')
  askGet(@Query('q') q: string): WorldRecordAnswer {
    if (!q || !q.trim()) {
      throw new HttpException('请输入您的问题', HttpStatus.BAD_REQUEST);
    }
    return this.worldRecordService.ask(q);
  }
}
