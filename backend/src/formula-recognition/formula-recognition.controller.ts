import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FormulaRecognitionService, FormulaRecognitionRequest, FormulaRecognitionResponse } from './formula-recognition.service';

@Controller('formula-recognition')
export class FormulaRecognitionController {
  constructor(private readonly formulaRecognitionService: FormulaRecognitionService) {}

  @Post('recognize')
  async recognize(@Body() body: FormulaRecognitionRequest): Promise<FormulaRecognitionResponse> {
    if (!body.imageBase64 || !body.imageBase64.trim()) {
      throw new HttpException('请上传包含公式的图片', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.formulaRecognitionService.recognize(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '公式识别失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
