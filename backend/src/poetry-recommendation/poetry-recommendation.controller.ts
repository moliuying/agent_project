import { Controller, Get, Param, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PoetryRecommendationService, ScoredPoem, CATEGORY_MAP } from './poetry-recommendation.service';
import { Poem } from './poetry-recommendation.data';

@Controller('poetry-recommendation')
export class PoetryRecommendationController {
  constructor(private readonly poetryService: PoetryRecommendationService) {}

  @Get('quick-tags')
  getQuickTags() {
    return this.poetryService.getQuickTags();
  }

  @Get('tags')
  getAllTags(): string[] {
    return this.poetryService.getAllTags();
  }

  @Get('dynasties')
  getDynasties(): string[] {
    return this.poetryService.getDynasties();
  }

  @Get('categories')
  getCategories() {
    return CATEGORY_MAP;
  }

  @Get('recommend')
  recommend(
    @Query('query') query: string,
    @Query('limit') limit?: string,
    @Query('minFame') minFame?: string,
    @Query('maxFame') maxFame?: string
  ): ScoredPoem[] {
    if (!query || !query.trim()) {
      throw new HttpException('请输入查询内容', HttpStatus.BAD_REQUEST);
    }
    const limitNum = limit ? parseInt(limit, 10) : 5;
    let fameRange: [number, number] | undefined;
    if (minFame || maxFame) {
      fameRange = [
        minFame ? parseInt(minFame, 10) : 1,
        maxFame ? parseInt(maxFame, 10) : 5
      ];
    }
    return this.poetryService.recommend(query.trim(), Math.min(limitNum, 20), fameRange);
  }

  @Post('recommend')
  recommendPost(
    @Body() body: { query: string; limit?: number; minFame?: number; maxFame?: number }
  ): ScoredPoem[] {
    if (!body.query || !body.query.trim()) {
      throw new HttpException('请输入查询内容', HttpStatus.BAD_REQUEST);
    }
    let fameRange: [number, number] | undefined;
    if (body.minFame !== undefined || body.maxFame !== undefined) {
      fameRange = [body.minFame ?? 1, body.maxFame ?? 5];
    }
    return this.poetryService.recommend(body.query.trim(), Math.min(body.limit || 5, 20), fameRange);
  }

  @Get('poem/:id')
  getById(@Param('id') id: string): Poem {
    const poem = this.poetryService.getById(parseInt(id, 10));
    if (!poem) {
      throw new HttpException('未找到该诗词', HttpStatus.NOT_FOUND);
    }
    return poem;
  }

  @Get('search')
  search(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
    @Query('minFame') minFame?: string,
    @Query('maxFame') maxFame?: string
  ): Poem[] {
    if (!keyword || !keyword.trim()) {
      throw new HttpException('请输入搜索关键词', HttpStatus.BAD_REQUEST);
    }
    const limitNum = limit ? parseInt(limit, 10) : 20;
    let fameRange: [number, number] | undefined;
    if (minFame || maxFame) {
      fameRange = [
        minFame ? parseInt(minFame, 10) : 1,
        maxFame ? parseInt(maxFame, 10) : 5
      ];
    }
    return this.poetryService.search(keyword.trim(), limitNum, fameRange);
  }

  @Get()
  getAll(
    @Query('tag') tag?: string,
    @Query('dynasty') dynasty?: string,
    @Query('author') author?: string,
    @Query('category') category?: string,
    @Query('minFame') minFame?: string,
    @Query('maxFame') maxFame?: string
  ): Poem[] {
    return this.poetryService.getAll({
      tag,
      dynasty,
      author,
      category,
      minFame: minFame ? parseInt(minFame, 10) : undefined,
      maxFame: maxFame ? parseInt(maxFame, 10) : undefined
    });
  }

  @Get('inspiration')
  getInspiration(@Query('count') count?: string): Poem[] {
    const num = count ? parseInt(count, 10) : 5;
    return this.poetryService.getInspiration(Math.min(num, 20));
  }

  @Get('related-theme/:id')
  getRelatedByTheme(
    @Param('id') id: string,
    @Query('limit') limit?: string
  ): Poem[] {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.poetryService.getRelatedByTheme(parseInt(id, 10), Math.min(limitNum, 10));
  }

  @Get('related-imagery')
  getRelatedByImagery(
    @Query('imagery') imagery: string,
    @Query('limit') limit?: string
  ): Poem[] {
    if (!imagery || !imagery.trim()) {
      throw new HttpException('请输入意象关键词', HttpStatus.BAD_REQUEST);
    }
    const limitNum = limit ? parseInt(limit, 10) : 8;
    return this.poetryService.getRelatedByImagery(imagery.trim(), Math.min(limitNum, 20));
  }
}
