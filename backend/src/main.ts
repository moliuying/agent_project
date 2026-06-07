import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { DataSource } from 'typeorm';
import { Menu } from './menu/menu.entity';

async function ensureMenus(app: any) {
  const dataSource = app.get(DataSource);
  const menuRepository = dataSource.getRepository(Menu);
  const existingMenus = await menuRepository.find();
  const existingPaths = new Set(existingMenus.map(m => m.path));

  const menusToAdd = [
    { name: '首页', path: '/', icon: 'Home', parentId: null, sort: 1, component: 'views/Home.vue' },
    { name: '贷款试算', path: '/loan-calculator', icon: 'Money', parentId: null, sort: 2, component: 'views/LoanCalculator.vue' },
    { name: '节假日查询', path: '/holiday-calendar', icon: 'Calendar', parentId: null, sort: 3, component: 'views/HolidayCalendar.vue' },
    { name: '音频剪辑', path: '/audio-clipper', icon: 'Headset', parentId: null, sort: 4, component: 'views/AudioClipper.vue' },
    { name: '字数统计', path: '/word-counter', icon: 'Document', parentId: null, sort: 4.5, component: 'views/WordCounter.vue' },
    { name: '随机抽取', path: '/random-picker', icon: 'Dice', parentId: null, sort: 4.6, component: 'views/RandomPicker.vue' },
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
  const app = await NestFactory.create(AppModule);
  app.use(cors());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await ensureMenus(app);
  await app.listen(4000);
  console.log('Backend server is running on http://localhost:4000');
}

bootstrap();
