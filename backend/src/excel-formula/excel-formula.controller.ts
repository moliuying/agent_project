import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExcelFormulaService, type ExcelFormula, type FormulaCategory, VERSION_INFO, type ExcelVersion, WPS_SUPPORT_INFO, type WpsSupportLevel } from './excel-formula.service';

@Controller('excel-formula')
export class ExcelFormulaController {
  constructor(private readonly excelFormulaService: ExcelFormulaService) {}

  @Get('categories')
  getCategories() {
    return this.excelFormulaService.getAllCategories();
  }

  @Get('versions')
  getVersions() {
    return Object.entries(VERSION_INFO).map(([key, info]) => ({
      id: key as ExcelVersion,
      ...info,
    }));
  }

  @Get('wps-support')
  getWpsSupport() {
    return this.excelFormulaService.getWpsSupportInfo();
  }

  @Get()
  getAllFormulas(): ExcelFormula[] {
    return this.excelFormulaService.getAllFormulas();
  }

  @Get('category/:category')
  getByCategory(@Param('category') category: FormulaCategory): ExcelFormula[] {
    return this.excelFormulaService.getFormulasByCategory(category);
  }

  @Get('search')
  search(@Query('q') query: string): ExcelFormula[] {
    return this.excelFormulaService.searchFormulas(query || '');
  }

  @Get('recommend')
  recommend(@Query('scenario') scenario: string) {
    return this.excelFormulaService.getSmartRecommendations(scenario || '');
  }

  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.excelFormulaService.getFormulaById(id);
  }
}
