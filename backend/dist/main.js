"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const cors = require("cors");
const typeorm_1 = require("typeorm");
const menu_entity_1 = require("./menu/menu.entity");
async function ensureMenus(app) {
    const dataSource = app.get(typeorm_1.DataSource);
    const menuRepository = dataSource.getRepository(menu_entity_1.Menu);
    const existingMenus = await menuRepository.find();
    const existingPaths = new Set(existingMenus.map(m => m.path));
    const menusToAdd = [
        { name: '首页', path: '/', icon: 'Home', parentId: null, sort: 1, component: 'views/Home.vue' },
        { name: '贷款试算', path: '/loan-calculator', icon: 'Money', parentId: null, sort: 2, component: 'views/LoanCalculator.vue' },
        { name: '节假日查询', path: '/holiday-calendar', icon: 'Calendar', parentId: null, sort: 3, component: 'views/HolidayCalendar.vue' },
        { name: '音频剪辑', path: '/audio-clipper', icon: 'Headset', parentId: null, sort: 4, component: 'views/AudioClipper.vue' },
        { name: '字数统计', path: '/word-counter', icon: 'Document', parentId: null, sort: 4.5, component: 'views/WordCounter.vue' },
        { name: '随机抽取', path: '/random-picker', icon: 'Dice', parentId: null, sort: 4.6, component: 'views/RandomPicker.vue' },
        { name: 'AI扩文', path: '/ai-text-expander', icon: 'MagicStick', parentId: null, sort: 4.7, component: 'views/AiTextExpander.vue' },
        { name: 'Excel公式查询', path: '/excel-formula', icon: 'DataBoard', parentId: null, sort: 4.8, component: 'views/ExcelFormula.vue' },
        { name: 'IP地址查询', path: '/ip-lookup', icon: 'Location', parentId: null, sort: 5, component: 'views/IpLookup.vue' },
    ];
    for (const menu of menusToAdd) {
        if (!existingPaths.has(menu.path)) {
            const entity = menuRepository.create(menu);
            await menuRepository.save(entity);
            console.log(`Added missing menu: ${menu.name}`);
        }
    }
    const systemMenu = existingMenus.find(m => m.path === '/system');
    if (!systemMenu) {
        const sysEntity = menuRepository.create({ name: '系统管理', path: '/system', icon: 'Setting', parentId: null, sort: 6, component: null });
        const saved = await menuRepository.save(sysEntity);
        console.log('Added missing menu: 系统管理');
        const menuEntity = menuRepository.create({ name: '菜单管理', path: '/system/menu', icon: 'Menu', parentId: saved.id, sort: 1, component: 'views/Menu.vue' });
        await menuRepository.save(menuEntity);
        console.log('Added missing menu: 菜单管理');
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cors());
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    await ensureMenus(app);
    await app.listen(4000);
    console.log('Backend server is running on http://localhost:4000');
}
bootstrap();
//# sourceMappingURL=main.js.map