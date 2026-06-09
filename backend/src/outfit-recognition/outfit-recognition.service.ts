import { Injectable } from '@nestjs/common';

export interface OutfitRecognitionRequest {
  imageBase64: string;
  sceneType?: 'daily' | 'work' | 'date' | 'party' | 'travel' | 'sport';
  userGender?: 'male' | 'female' | 'unisex';
  extraNote?: string;
}

export interface ClothingItem {
  id: string;
  category: string;
  subCategory: string;
  color: string;
  colorHex: string;
  style: string[];
  material: string;
  season: string[];
  confidence: number;
  position: 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';
}

export interface OutfitSuggestion {
  id: string;
  title: string;
  description: string;
  items: string[];
  occasion: string;
  style: string[];
  colorScheme: string;
  vibe: string;
}

export interface SimilarStyle {
  id: string;
  name: string;
  brand: string;
  priceRange: string;
  description: string;
  matchScore: number;
  tags: string[];
}

export interface OutfitRecognitionResponse {
  clothingItems: ClothingItem[];
  overallStyle: {
    mainStyle: string;
    subStyles: string[];
    colorPalette: { color: string; hex: string; ratio: number }[];
    seasonTag: string;
    formalityLevel: string;
  };
  suggestions: OutfitSuggestion[];
  similarStyles: SimilarStyle[];
  stylingTips: string[];
  shoppingTips: string[];
}

const CATEGORY_POOL = {
  top: [
    { category: '上装', subCategory: 'T恤', material: '纯棉' },
    { category: '上装', subCategory: '衬衫', material: '棉质混纺' },
    { category: '上装', subCategory: '卫衣', material: '毛圈布' },
    { category: '上装', subCategory: '针织衫', material: '羊毛混纺' },
    { category: '上装', subCategory: '吊带衫', material: '真丝' },
    { category: '上装', subCategory: 'POLO衫', material: '珠地棉' },
    { category: '上装', subCategory: '雪纺衫', material: '雪纺' },
  ],
  bottom: [
    { category: '下装', subCategory: '牛仔裤', material: '牛仔布' },
    { category: '下装', subCategory: '休闲裤', material: '卡其布' },
    { category: '下装', subCategory: '西裤', material: '精纺羊毛' },
    { category: '下装', subCategory: '运动裤', material: '速干面料' },
    { category: '下装', subCategory: '半身裙', material: '聚酯纤维' },
    { category: '下装', subCategory: '短裤', material: '亚麻' },
  ],
  outerwear: [
    { category: '外套', subCategory: '西装外套', material: '羊毛混纺' },
    { category: '外套', subCategory: '风衣', material: '嘎巴甸' },
    { category: '外套', subCategory: '牛仔外套', material: '牛仔布' },
    { category: '外套', subCategory: '皮夹克', material: 'PU皮革' },
    { category: '外套', subCategory: '羽绒服', material: '白鸭绒' },
    { category: '外套', subCategory: '棒球服', material: '棉混纺' },
    { category: '外套', subCategory: '大衣', material: '双面呢' },
  ],
  dress: [
    { category: '连衣裙', subCategory: '碎花裙', material: '雪纺' },
    { category: '连衣裙', subCategory: '针织裙', material: '针织面料' },
    { category: '连衣裙', subCategory: '衬衫裙', material: '棉质' },
    { category: '连衣裙', subCategory: '吊带裙', material: '真丝' },
    { category: '连衣裙', subCategory: '半身裙套装', material: '聚酯纤维' },
  ],
  shoes: [
    { category: '鞋履', subCategory: '小白鞋', material: '皮革+橡胶底' },
    { category: '鞋履', subCategory: '运动鞋', material: '网面+EVA' },
    { category: '鞋履', subCategory: '高跟鞋', material: '漆皮' },
    { category: '鞋履', subCategory: '马丁靴', material: '牛皮' },
    { category: '鞋履', subCategory: '乐福鞋', material: '绒面革' },
    { category: '鞋履', subCategory: '凉鞋', material: 'PU' },
  ],
  accessory: [
    { category: '配饰', subCategory: '棒球帽', material: '棉质' },
    { category: '配饰', subCategory: '贝雷帽', material: '羊毛' },
    { category: '配饰', subCategory: '手提包', material: 'PU皮革' },
    { category: '配饰', subCategory: '双肩包', material: '尼龙' },
    { category: '配饰', subCategory: '丝巾', material: '真丝' },
    { category: '配饰', subCategory: '腰带', material: '皮革' },
    { category: '配饰', subCategory: '太阳镜', material: '板材' },
  ],
};

const COLOR_POOL: { color: string; hex: string }[] = [
  { color: '经典黑', hex: '#1A1A1A' },
  { color: '纯净白', hex: '#F5F5F5' },
  { color: '高级灰', hex: '#808080' },
  { color: '海军蓝', hex: '#1E3A5F' },
  { color: '卡其色', hex: '#C3B091' },
  { color: '牛仔蓝', hex: '#5B7FA8' },
  { color: '军绿色', hex: '#4B5320' },
  { color: '酒红色', hex: '#722F37' },
  { color: '焦糖色', hex: '#C68E17' },
  { color: '雾霾蓝', hex: '#A1B5D8' },
  { color: '藕粉色', hex: '#E6C7C7' },
  { color: '薄荷绿', hex: '#98FF98' },
  { color: '明黄色', hex: '#FFD700' },
  { color: '薰衣草紫', hex: '#E6E6FA' },
  { color: '珊瑚橘', hex: '#FF7F50' },
];

const STYLE_TAGS = [
  '休闲', '商务', '街头', '复古', '文艺', '简约',
  '运动', '甜酷', '优雅', '学院风', '日系', '韩系',
  '美式', '法式', '通勤', '度假', '机能风', '中性风'
];

const SEASON_TAGS = ['春夏', '秋冬', '四季皆宜', '春秋'];

const OCCASION_MAP: Record<string, string[]> = {
  daily: ['日常出街', '朋友聚会', '校园穿搭'],
  work: ['职场通勤', '商务会议', '正式场合'],
  date: ['约会穿搭', '浪漫晚餐', '甜蜜出游'],
  party: ['派对聚会', '晚宴', '夜店蹦迪'],
  travel: ['度假旅行', '户外出游', '拍照打卡'],
  sport: ['运动健身', '跑步瑜伽', '户外徒步'],
};

@Injectable()
export class OutfitRecognitionService {
  private seededRandom(seed: number): () => number {
    let s = seed || 1;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  private pickSeeded<T>(arr: T[], count: number, rand: () => number): T[] {
    const shuffled = [...arr].sort(() => rand() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  }

  private pickWeightedSeeded<T>(arr: T[], min: number, max: number, rand: () => number): T[] {
    const count = Math.floor(rand() * (max - min + 1)) + min;
    return this.pickSeeded(arr, count, rand);
  }

  private pickOne<T>(arr: T[], rand: () => number): T {
    return arr[Math.floor(rand() * arr.length)];
  }

  private generateColorPalette(rand: () => number): { color: string; hex: string; ratio: number }[] {
    const count = Math.floor(rand() * 2) + 3;
    const picked = this.pickSeeded(COLOR_POOL, count, rand);
    let remaining = 100;
    return picked.map((c, idx) => {
      if (idx === picked.length - 1) {
        return { ...c, ratio: remaining };
      }
      const ratio = Math.floor(rand() * (remaining - (picked.length - idx - 1) * 5)) + 10;
      remaining -= ratio;
      return { ...c, ratio };
    });
  }

  private generateClothingItems(rand: () => number): ClothingItem[] {
    const positions: ('top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory')[] =
      ['top', 'bottom', 'shoes', 'outerwear', 'dress', 'accessory'];
    const itemCount = Math.floor(rand() * 3) + 3;
    const pickedPositions = this.pickSeeded(positions, itemCount, rand);

    return pickedPositions.map((pos, idx) => {
      const categoryData = this.pickOne(CATEGORY_POOL[pos], rand);
      const colorData = this.pickOne(COLOR_POOL, rand);
      const styles = this.pickWeightedSeeded(STYLE_TAGS, 2, 3, rand);
      const seasons = this.pickWeightedSeeded(SEASON_TAGS, 1, 2, rand);
      return {
        id: `item-${idx}`,
        category: categoryData.category,
        subCategory: categoryData.subCategory,
        color: colorData.color,
        colorHex: colorData.hex,
        style: styles,
        material: categoryData.material,
        season: seasons,
        confidence: Math.floor(rand() * 20) + 80,
        position: pos,
      };
    });
  }

  private generateSuggestions(
    items: ClothingItem[],
    sceneType: string | undefined,
    rand: () => number
  ): OutfitSuggestion[] {
    const occasions = sceneType && OCCASION_MAP[sceneType]
      ? OCCASION_MAP[sceneType]
      : OCCASION_MAP.daily;

    const baseItem = items[0];
    const suggestions: OutfitSuggestion[] = [];

    const suggestionTemplates = [
      {
        title: '同色系高级感搭配',
        colorScheme: '同色系渐变',
        vibe: '低调高级',
      },
      {
        title: '经典黑白灰万能搭',
        colorScheme: '中性色基础',
        vibe: '简约百搭',
      },
      {
        title: '撞色吸睛出街',
        colorScheme: '互补色撞色',
        vibe: '个性鲜明',
      },
      {
        title: '层次叠穿氛围感',
        colorScheme: '邻近色过渡',
        vibe: '慵懒随性',
      },
    ];

    const pickedTemplates = this.pickSeeded(suggestionTemplates, 3, rand);

    pickedTemplates.forEach((tpl, idx) => {
      const styleTags = this.pickWeightedSeeded(STYLE_TAGS, 2, 3, rand);
      const matchedItems = items
        .slice(0, Math.floor(rand() * 2) + 2)
        .map(i => `${i.color}${i.subCategory}`);
      if (matchedItems.length < 3) {
        const fillers = ['白色T恤内搭', '金属配饰点缀', '小白鞋提亮'];
        matchedItems.push(...this.pickSeeded(fillers, 3 - matchedItems.length, rand));
      }
      suggestions.push({
        id: `suggestion-${idx}`,
        title: tpl.title,
        description: `以${baseItem?.color || '精选'}${baseItem?.subCategory || '单品'}为核心，${tpl.vibe}的搭配方案，适合${this.pickOne(occasions, rand)}等场合。`,
        items: matchedItems,
        occasion: this.pickOne(occasions, rand),
        style: styleTags,
        colorScheme: tpl.colorScheme,
        vibe: tpl.vibe,
      });
    });

    return suggestions;
  }

  private generateSimilarStyles(
    items: ClothingItem[],
    rand: () => number
  ): SimilarStyle[] {
    const baseItem = items[0];
    const brands = ['ZARA', 'UNIQLO', 'H&M', 'UR', 'COS', 'Massimo Dutti', 'MUJI'];
    const priceRanges = ['¥100-300', '¥300-500', '¥500-800', '¥800-1500', '¥1500+'];

    const styleNames: Record<string, string[]> = {
      'T恤': ['基础款纯色T恤', '廓形Oversize T恤', '复古印花T恤', '修身打底T恤'],
      '衬衫': ['法式泡泡袖衬衫', '复古条纹衬衫', '免烫商务衬衫', '宽松廓形衬衫'],
      '牛仔裤': ['高腰直筒牛仔裤', '复古阔腿牛仔裤', '修身小脚牛仔裤', '破洞牛仔裤'],
      '卫衣': ['连帽套头卫衣', '圆领刺绣卫衣', '开衫拉链卫衣', 'oversize卫衣'],
      '西装外套': ['廓形oversize西装', '修身通勤西装', '复古格纹西装', '休闲亚麻西装'],
      '连衣裙': ['法式茶歇裙', '复古碎花裙', '针织修身裙', '吊带度假裙'],
      '小白鞋': ['经典百搭小白鞋', '厚底增高小白鞋', '做旧脏脏鞋', '真皮板鞋'],
      'default': ['基础款百搭单品', '设计师联名款', '复古vintage款', '明星同款'],
    };

    const names = styleNames[baseItem?.subCategory] || styleNames.default;

    return names.map((name, idx) => ({
      id: `similar-${idx}`,
      name,
      brand: this.pickOne(brands, rand),
      priceRange: this.pickOne(priceRanges, rand),
      description: `${baseItem?.color || '精选'}${baseItem?.subCategory || '单品'}的${idx === 0 ? '平价替代' : idx === 1 ? '升级品质' : '风格延伸'}款式，${this.pickOne(STYLE_TAGS, rand)}风格。`,
      matchScore: Math.floor(rand() * 15) + 85,
      tags: this.pickWeightedSeeded(STYLE_TAGS, 2, 3, rand),
    }));
  }

  private generateStylingTips(
    items: ClothingItem[],
    rand: () => number
  ): string[] {
    const baseItem = items[0];
    const allTips = [
      `${baseItem?.color || '此'}${baseItem?.subCategory || '单品'}建议搭配${this.pickOne(['同色系', '白色', '黑色', '牛仔蓝'], rand)}下装，整体更加协调统一。`,
      '配饰方面，可选择金属项链或简约手表作为点缀，提升整体精致度。',
      '想要拉长腿型比例，可以选择高腰下装搭配短款上衣，或者在腰部系一条细腰带。',
      '叠穿技巧：内搭选择修身款，外搭选择宽松廓形，制造层次感的同时更显瘦。',
      `根据场合选择鞋履：日常用${this.pickOne(['小白鞋', '乐福鞋', '帆布鞋'], rand)}，正式场合选${this.pickOne(['高跟鞋', '皮鞋', '切尔西靴'], rand)}。`,
      '色彩搭配遵循三色原则：全身主色调不超过三种，避免视觉杂乱。',
      '小个子友好：选择V领或U领上衣，露出颈部线条，视觉上更显高。',
      '材质混搭：丝绸配牛仔、针织配皮质，不同材质碰撞出高级感。',
      `${baseItem?.season?.[0] || '春秋'}季节穿着时，可根据温度增减内搭或外套，灵活应对温差。`,
      '包包的选择应与整体风格统一：休闲风配帆布包，通勤风配托特包，约会配链条包。',
    ];
    return this.pickSeeded(allTips, 5, rand);
  }

  private generateShoppingTips(
    items: ClothingItem[],
    rand: () => number
  ): string[] {
    const baseItem = items[0];
    const allTips = [
      `选购${baseItem?.subCategory || '同类单品'}时，建议优先选择${this.pickOne(['纯棉', '羊毛混纺', '真丝', '亚麻'], rand)}材质，亲肤透气更耐穿。`,
      '版型比尺码更重要：试穿时注意肩线、袖长、衣长是否合适，必要时可考虑修改。',
      '经典款永不过时：投资一件高品质的基础款，比买十件廉价潮流单品更划算。',
      '网购建议对比三家，查看买家秀和面料成分表，避免「图片仅供参考」的坑。',
      '建立胶囊衣橱：选择基础色+一个流行色，单品之间可互相搭配至少3套以上再入手。',
      `购买${baseItem?.category || '服装'}前先审视衣柜：是否已有类似款？能否与现有3件以上单品搭配？`,
      '打折季购物理性清单：列出真正需要的单品，避免为了优惠而冲动消费。',
      '关注面料护理：标注「只能干洗」的单品穿着成本更高，日常穿搭建议选可机洗面料。',
    ];
    return this.pickSeeded(allTips, 4, rand);
  }

  async recognize(request: OutfitRecognitionRequest): Promise<OutfitRecognitionResponse> {
    const seed = Date.now() % 100000;
    const rand = this.seededRandom(seed);

    const clothingItems = this.generateClothingItems(rand);
    const colorPalette = this.generateColorPalette(rand);
    const mainStyle = this.pickOne(STYLE_TAGS, rand);
    const subStyles = this.pickWeightedSeeded(
      STYLE_TAGS.filter(s => s !== mainStyle),
      2,
      3,
      rand
    );

    const suggestions = this.generateSuggestions(clothingItems, request.sceneType, rand);
    const similarStyles = this.generateSimilarStyles(clothingItems, rand);
    const stylingTips = this.generateStylingTips(clothingItems, rand);
    const shoppingTips = this.generateShoppingTips(clothingItems, rand);

    const formalityLevels = ['休闲日常', '商务休闲', '半正式', '正式'];

    return {
      clothingItems,
      overallStyle: {
        mainStyle,
        subStyles,
        colorPalette,
        seasonTag: this.pickOne(SEASON_TAGS, rand),
        formalityLevel: this.pickOne(formalityLevels, rand),
      },
      suggestions,
      similarStyles,
      stylingTips,
      shoppingTips,
    };
  }
}
