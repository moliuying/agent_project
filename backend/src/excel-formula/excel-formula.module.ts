import { Module } from '@nestjs/common';
import { ExcelFormulaService } from './excel-formula.service';
import { ExcelFormulaController } from './excel-formula.controller';

@Module({
  imports: [],
  controllers: [ExcelFormulaController],
  providers: [ExcelFormulaService],
})
export class ExcelFormulaModule {}
