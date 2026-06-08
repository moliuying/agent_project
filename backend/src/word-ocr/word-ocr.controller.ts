import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { WordOcrService, WordOcrRequest, WordOcrResponse } from './word-ocr.service';

@Controller('word-ocr')
export class WordOcrController {
  constructor(private readonly wordOcrService: WordOcrService) {}

  @Post('recognize')
  async recognize(@Body() body: WordOcrRequest): Promise<WordOcrResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传包含英文单词的图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.wordOcrService.recognize(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '单词识别失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
