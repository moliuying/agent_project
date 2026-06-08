"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const typeorm_1 = require("typeorm");
const menu_entity_1 = require("./menu/menu.entity");
const holiday_entity_1 = require("./holiday/holiday.entity");
const holiday_data_1 = require("./holiday/holiday.data");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.init();
    const dataSource = app.get(typeorm_1.DataSource);
    const menuRepository = dataSource.getRepository(menu_entity_1.Menu);
    const menuCount = await menuRepository.count();
    if (menuCount === 0) {
        const menus = [
            { name: '首页', path: '/', icon: 'Home', parentId: null, sort: 1, component: 'views/Home.vue' },
            { name: '贷款试算', path: '/loan-calculator', icon: 'Money', parentId: null, sort: 2, component: 'views/LoanCalculator.vue' },
            { name: '节假日查询', path: '/holiday-calendar', icon: 'Calendar', parentId: null, sort: 3, component: 'views/HolidayCalendar.vue' },
            { name: '音频剪辑', path: '/audio-clipper', icon: 'Headset', parentId: null, sort: 4, component: 'views/AudioClipper.vue' },
            { name: 'IP地址查询', path: '/ip-lookup', icon: 'Location', parentId: null, sort: 5, component: 'views/IpLookup.vue' },
            { name: '字数统计', path: '/word-counter', icon: 'Edit', parentId: null, sort: 6, component: 'views/WordCounter.vue' },
            { name: '随机选择', path: '/random-picker', icon: 'Cpu', parentId: null, sort: 7, component: 'views/RandomPicker.vue' },
            { name: 'AI扩文', path: '/ai-text-expander', icon: 'MagicStick', parentId: null, sort: 8, component: 'views/AiTextExpander.vue' },
            { name: '图片转提示词', path: '/image-to-prompt', icon: 'PictureFilled', parentId: null, sort: 9, component: 'views/ImageToPrompt.vue' },
            { name: '代码反混淆', path: '/code-deobfuscator', icon: 'Monitor', parentId: null, sort: 10, component: 'views/CodeDeobfuscator.vue' },
            { name: 'WebSocket 调试', path: '/websocket-debugger', icon: 'DataLine', parentId: null, sort: 11, component: 'views/WebSocketDebugger.vue' },
            { name: 'Python代码示例', path: '/python-code-samples', icon: 'Cpu', parentId: null, sort: 12, component: 'views/PythonCodeSamples.vue' },
            { name: '系统管理', path: '/system', icon: 'Setting', parentId: null, sort: 99, component: null },
            { name: '菜单管理', path: '/system/menu', icon: 'Menu', parentId: 13, sort: 1, component: 'views/Menu.vue' },
        ];
        for (const menu of menus) {
            const entity = menuRepository.create(menu);
            await menuRepository.save(entity);
        }
        console.log('Initial menu data has been inserted.');
    }
    else {
        console.log('Menu data already exists, skipping initialization.');
    }
    const holidayRepository = dataSource.getRepository(holiday_entity_1.Holiday);
    const holidayCount = await holidayRepository.count();
    if (holidayCount === 0) {
        await holidayRepository.save(holiday_data_1.holidayData);
        console.log(`Inserted ${holiday_data_1.holidayData.length} holiday records for years 2020-2030.`);
    }
    else {
        console.log('Holiday data already exists, skipping initialization.');
    }
    await app.close();
    process.exit(0);
}
bootstrap();
//# sourceMappingURL=init-db.js.map