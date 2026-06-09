import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from './menu/menu.module';
import { Menu } from './menu/menu.entity';
import { HolidayModule } from './holiday/holiday.module';
import { Holiday } from './holiday/holiday.entity';
import { IpLookupModule } from './ip-lookup/ip-lookup.module';
import { AiTextExpanderModule } from './ai-text-expander/ai-text-expander.module';
import { ThesisWriterModule } from './thesis-writer/thesis-writer.module';
import { ExcelFormulaModule } from './excel-formula/excel-formula.module';
import { ImageToPromptModule } from './image-to-prompt/image-to-prompt.module';
import { IdiomChainModule } from './idiom-chain/idiom-chain.module';
import { FormulaRecognitionModule } from './formula-recognition/formula-recognition.module';
import { PictureWritingModule } from './picture-writing/picture-writing.module';
import { WordOcrModule } from './word-ocr/word-ocr.module';
import { EnglishConversationModule } from './english-conversation/english-conversation.module';
import { PoetryRecommendationModule } from './poetry-recommendation/poetry-recommendation.module';
import { SceneEnglishModule } from './scene-english/scene-english.module';
import { OutfitRecognitionModule } from './outfit-recognition/outfit-recognition.module';
import { WorldRecordModule } from './world-record/world-record.module';
import { DinosaurQaModule } from './dinosaur-qa/dinosaur-qa.module';
import { FoodCalorieModule } from './food-calorie/food-calorie.module';
import { LiteratureQaModule } from './literature-qa/literature-qa.module';
import { CookingQaModule } from './cooking-qa/cooking-qa.module';
import { ObjectRecognitionModule } from './object-recognition/object-recognition.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.join(__dirname, '../data/database.sqlite'),
      entities: [Menu, Holiday],
      synchronize: true,
      logging: false,
    }),
    MenuModule,
    HolidayModule,
    IpLookupModule,
    AiTextExpanderModule,
    ThesisWriterModule,
    ExcelFormulaModule,
    ImageToPromptModule,
    IdiomChainModule,
    FormulaRecognitionModule,
    PictureWritingModule,
    WordOcrModule,
    EnglishConversationModule,
    PoetryRecommendationModule,
    SceneEnglishModule,
    OutfitRecognitionModule,
    WorldRecordModule,
    DinosaurQaModule,
    FoodCalorieModule,
    LiteratureQaModule,
    CookingQaModule,
    ObjectRecognitionModule,
  ],
})
export class AppModule {}
