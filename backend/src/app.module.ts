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
  ],
})
export class AppModule {}
