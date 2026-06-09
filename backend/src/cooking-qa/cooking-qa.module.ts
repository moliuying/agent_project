import { Module } from '@nestjs/common';
import { CookingQaService } from './cooking-qa.service';
import { CookingQaController } from './cooking-qa.controller';

@Module({
  imports: [],
  controllers: [CookingQaController],
  providers: [CookingQaService],
})
export class CookingQaModule {}
