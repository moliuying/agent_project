"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const menu_module_1 = require("./menu/menu.module");
const menu_entity_1 = require("./menu/menu.entity");
const holiday_module_1 = require("./holiday/holiday.module");
const holiday_entity_1 = require("./holiday/holiday.entity");
const ip_lookup_module_1 = require("./ip-lookup/ip-lookup.module");
const ai_text_expander_module_1 = require("./ai-text-expander/ai-text-expander.module");
const thesis_writer_module_1 = require("./thesis-writer/thesis-writer.module");
const excel_formula_module_1 = require("./excel-formula/excel-formula.module");
const image_to_prompt_module_1 = require("./image-to-prompt/image-to-prompt.module");
const idiom_chain_module_1 = require("./idiom-chain/idiom-chain.module");
const path = require("path");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: path.join(__dirname, '../data/database.sqlite'),
                entities: [menu_entity_1.Menu, holiday_entity_1.Holiday],
                synchronize: true,
                logging: false,
            }),
            menu_module_1.MenuModule,
            holiday_module_1.HolidayModule,
            ip_lookup_module_1.IpLookupModule,
            ai_text_expander_module_1.AiTextExpanderModule,
            thesis_writer_module_1.ThesisWriterModule,
            excel_formula_module_1.ExcelFormulaModule,
            image_to_prompt_module_1.ImageToPromptModule,
            idiom_chain_module_1.IdiomChainModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map