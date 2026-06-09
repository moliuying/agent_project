import { Controller, Get, Post, Body, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import {
  SceneEnglishService,
  SceneInfo,
  SceneEnglishResponse,
} from './scene-english.service';

@Controller('scene-english')
export class SceneEnglishController {
  constructor(private readonly service: SceneEnglishService) {}

  @Get('scenes')
  getAllScenes(): SceneInfo[] {
    return this.service.getAllScenes();
  }

  @Get('scenes/search')
  searchScenes(@Query('keyword') keyword: string): SceneInfo[] {
    return this.service.searchScenes(keyword || '');
  }

  @Get('scenes/:id')
  getSceneById(@Param('id') id: string): SceneEnglishResponse {
    const scene = this.service.getSceneById(id);
    if (!scene) {
      throw new HttpException('场景不存在', HttpStatus.NOT_FOUND);
    }
    return scene;
  }

  @Post('query')
  query(@Body() body: { description: string }): SceneEnglishResponse {
    if (!body.description || !body.description.trim()) {
      throw new HttpException('请描述你所处的场景', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.service.query(body.description);
    } catch (e: any) {
      throw new HttpException(e.message || '查询失败', HttpStatus.BAD_REQUEST);
    }
  }
}
