import { Controller, Get, Post, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { IdiomChainService, IdiomInfo, GameState } from './idiom-chain.service';

interface SubmitRequest {
  userWord: string;
  currentState: GameState;
}

@Controller('idiom-chain')
export class IdiomChainController {
  constructor(private readonly idiomChainService: IdiomChainService) {}

  @Get('new-game')
  createNewGame(): GameState {
    return this.idiomChainService.createNewGame();
  }

  @Post('submit')
  async submitWord(@Body() body: SubmitRequest): Promise<GameState> {
    if (!body.userWord || !body.userWord.trim()) {
      throw new HttpException('请输入成语', HttpStatus.BAD_REQUEST);
    }
    if (!body.currentState) {
      throw new HttpException('游戏状态丢失，请重新开始', HttpStatus.BAD_REQUEST);
    }
    return await this.idiomChainService.userSubmit(body.userWord, body.currentState);
  }

  @Get('validate')
  validateIdiom(@Query('word') word: string): { valid: boolean; info?: IdiomInfo } {
    if (!word) {
      return { valid: false };
    }
    const info = this.idiomChainService.validateIdiom(word);
    return { valid: !!info, info: info || undefined };
  }

  @Get('hint')
  getHint(
    @Query('tail') tail: string,
    @Query('used') used: string,
  ): { hint?: IdiomInfo; message?: string } {
    if (!tail) {
      return { message: '请提供尾字' };
    }
    const usedWords = used ? used.split(',') : [];
    const hint = this.idiomChainService.getHint(tail, usedWords);
    if (!hint) {
      return { message: '没有可用的提示了' };
    }
    return { hint };
  }

  @Get('idioms')
  getAllIdioms(): IdiomInfo[] {
    return this.idiomChainService.getAllIdioms();
  }
}
