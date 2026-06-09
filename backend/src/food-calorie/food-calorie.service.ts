import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface ImageQualityHints {
  sharpness: number;
  brightness: number;
  brightnessStatus: 'normal' | 'dark' | 'overexposed';
  contrast: number;
  isScreenshot?: boolean;
  multiPanelDetected?: boolean;
  textDensity?: number;
  hasUiElements?: boolean;
  resolutionScore?: number;
}

export interface FoodCalorieRequest {
  imageBase64: string;
  dietGoal?: 'lose' | 'gain' | 'maintain' | 'diabetes' | 'fitness';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  extraNote?: string;
  qualityHints?: ImageQualityHints;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  portion: string;
  portionGrams: number;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  giIndex?: number;
  tags: string[];
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  proteinRatio: number;
  carbsRatio: number;
  fatRatio: number;
}

export interface DietAdvice {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'suggestion' | 'praise';
}

export interface FoodCalorieResponse {
  foodItems: FoodItem[];
  nutritionSummary: NutritionSummary;
  mealAssessment: {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    description: string;
  };
  dietAdvice: DietAdvice[];
  alternativeSuggestions: {
    id: string;
    originalFood: string;
    alternativeFood: string;
    calorieDiff: number;
    reason: string;
  }[];
  overallConfidence: number;
  qualityWarnings: string[];
}

const FOOD_DATABASE: Omit<FoodItem, 'id' | 'portionGrams' | 'confidence' | 'portion'>[] = [
  { name: '白米饭', category: '主食', calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, fiber: 0.3, sugar: 0.1, giIndex: 83, tags: ['高碳水', '主食', '低脂肪'] },
  { name: '糙米饭', category: '主食', calories: 111, protein: 2.6, carbs: 23.7, fat: 0.9, fiber: 1.8, sugar: 0.3, giIndex: 56, tags: ['高纤维', '低GI', '全谷物'] },
  { name: '馒头', category: '主食', calories: 221, protein: 7.0, carbs: 47.0, fat: 1.1, fiber: 1.3, sugar: 1.8, giIndex: 88, tags: ['高碳水', '发酵食品'] },
  { name: '面条（煮）', category: '主食', calories: 109, protein: 4.5, carbs: 22.0, fat: 0.5, fiber: 0.8, sugar: 0.4, giIndex: 81, tags: ['高碳水', '主食'] },
  { name: '全麦面包', category: '主食', calories: 246, protein: 13.0, carbs: 41.0, fat: 4.2, fiber: 7.0, sugar: 5.0, giIndex: 50, tags: ['高纤维', '高蛋白', '低GI'] },
  { name: '饺子', category: '主食', calories: 253, protein: 10.0, carbs: 30.0, fat: 10.0, fiber: 1.5, sugar: 1.2, giIndex: 55, tags: ['主食', '均衡'] },
  { name: '包子', category: '主食', calories: 227, protein: 9.0, carbs: 38.0, fat: 4.0, fiber: 1.2, sugar: 2.0, giIndex: 75, tags: ['高碳水', '发酵食品'] },
  { name: '粥', category: '主食', calories: 46, protein: 1.1, carbs: 9.9, fat: 0.3, fiber: 0.2, sugar: 0.1, giIndex: 60, tags: ['易消化', '低热量'] },

  { name: '鸡胸肉', category: '肉类', calories: 133, protein: 19.4, carbs: 2.5, fat: 5.0, fiber: 0, sugar: 0, giIndex: 0, tags: ['高蛋白', '低脂肪', '减脂优选'] },
  { name: '牛肉（瘦）', category: '肉类', calories: 125, protein: 20.2, carbs: 1.2, fat: 4.2, fiber: 0, sugar: 0, giIndex: 0, tags: ['高蛋白', '补铁', '增肌'] },
  { name: '猪肉（瘦）', category: '肉类', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, fiber: 0, sugar: 0, giIndex: 0, tags: ['高蛋白', '肉类'] },
  { name: '红烧肉', category: '肉类', calories: 450, protein: 17.0, carbs: 8.0, fat: 40.0, fiber: 0, sugar: 6.0, giIndex: 0, tags: ['高脂肪', '高热量', '适量食用'] },
  { name: '鱼（清蒸）', category: '肉类', calories: 113, protein: 20.4, carbs: 0, fat: 3.5, fiber: 0, sugar: 0, giIndex: 0, tags: ['高蛋白', '低脂肪', '健康脂肪'] },
  { name: '虾', category: '肉类', calories: 93, protein: 18.6, carbs: 2.8, fat: 0.8, fiber: 0, sugar: 0, giIndex: 0, tags: ['高蛋白', '低脂肪', '海鲜'] },
  { name: '鸡蛋', category: '蛋类', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, fiber: 0, sugar: 1.5, giIndex: 0, tags: ['高蛋白', '优质蛋白', '营养丰富'] },
  { name: '咸鸭蛋', category: '蛋类', calories: 190, protein: 12.7, carbs: 6.3, fat: 12.7, fiber: 0, sugar: 1.0, giIndex: 0, tags: ['高钠', '适量食用'] },

  { name: '牛奶', category: '乳制品', calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2, fiber: 0, sugar: 3.4, giIndex: 27, tags: ['高钙', '优质蛋白', '补钙'] },
  { name: '酸奶', category: '乳制品', calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7, fiber: 0, sugar: 9.0, giIndex: 36, tags: ['益生菌', '助消化', '适量糖分'] },
  { name: '豆浆', category: '乳制品', calories: 31, protein: 3.0, carbs: 1.2, fat: 1.6, fiber: 0.4, sugar: 0.7, giIndex: 15, tags: ['植物蛋白', '低热量', '健康饮品'] },
  { name: '奶酪', category: '乳制品', calories: 328, protein: 25.7, carbs: 3.5, fat: 23.5, fiber: 0, sugar: 3.5, giIndex: 0, tags: ['高蛋白', '高脂肪', '高钙'] },

  { name: '西兰花', category: '蔬菜', calories: 34, protein: 4.1, carbs: 4.3, fat: 0.6, fiber: 1.6, sugar: 1.7, giIndex: 15, tags: ['低热量', '高纤维', '维生素C'] },
  { name: '西红柿', category: '蔬菜', calories: 19, protein: 0.9, carbs: 4.0, fat: 0.2, fiber: 0.5, sugar: 2.5, giIndex: 30, tags: ['低热量', '番茄红素', '抗氧化'] },
  { name: '黄瓜', category: '蔬菜', calories: 16, protein: 0.8, carbs: 2.9, fat: 0.2, fiber: 0.5, sugar: 1.8, giIndex: 15, tags: ['低热量', '高水分', '减脂优选'] },
  { name: '胡萝卜', category: '蔬菜', calories: 37, protein: 1.0, carbs: 8.8, fat: 0.2, fiber: 1.1, sugar: 4.5, giIndex: 35, tags: ['胡萝卜素', '护眼', '低热量'] },
  { name: '菠菜', category: '蔬菜', calories: 28, protein: 2.6, carbs: 4.5, fat: 0.3, fiber: 1.7, sugar: 0.6, giIndex: 15, tags: ['高铁', '高纤维', '深绿色蔬菜'] },
  { name: '白菜', category: '蔬菜', calories: 17, protein: 1.5, carbs: 3.2, fat: 0.1, fiber: 0.8, sugar: 1.2, giIndex: 15, tags: ['低热量', '高水分', '家常蔬菜'] },
  { name: '土豆', category: '蔬菜', calories: 77, protein: 2.0, carbs: 17.2, fat: 0.2, fiber: 0.7, sugar: 0.9, giIndex: 78, tags: ['高碳水', '蔬菜主食', '适量食用'] },
  { name: '玉米', category: '蔬菜', calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2, fiber: 2.9, sugar: 3.3, giIndex: 55, tags: ['高纤维', '粗粮', '健康碳水'] },
  { name: '生菜', category: '蔬菜', calories: 13, protein: 1.3, carbs: 2.0, fat: 0.3, fiber: 0.7, sugar: 0.8, giIndex: 15, tags: ['极低热量', '高水分', '沙拉必备'] },

  { name: '苹果', category: '水果', calories: 54, protein: 0.2, carbs: 13.5, fat: 0.2, fiber: 1.2, sugar: 10.0, giIndex: 36, tags: ['低热量', '高纤维', '日常水果'] },
  { name: '香蕉', category: '水果', calories: 93, protein: 1.4, carbs: 22.0, fat: 0.2, fiber: 1.2, sugar: 12.0, giIndex: 52, tags: ['高钾', '运动前后', '快速能量'] },
  { name: '橙子', category: '水果', calories: 48, protein: 0.8, carbs: 11.1, fat: 0.2, fiber: 0.6, sugar: 9.0, giIndex: 40, tags: ['维生素C', '低热量', '抗氧化'] },
  { name: '葡萄', category: '水果', calories: 44, protein: 0.5, carbs: 10.3, fat: 0.2, fiber: 0.4, sugar: 8.0, giIndex: 43, tags: ['抗氧化', '适量糖分'] },
  { name: '西瓜', category: '水果', calories: 26, protein: 0.6, carbs: 5.8, fat: 0.1, fiber: 0.3, sugar: 5.5, giIndex: 72, tags: ['高水分', '解暑', '适量食用'] },
  { name: '蓝莓', category: '水果', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0, giIndex: 40, tags: ['抗氧化', '花青素', '超级食物'] },

  { name: '炸鸡', category: '快餐', calories: 279, protein: 20.0, carbs: 14.0, fat: 17.0, fiber: 0.5, sugar: 0.5, giIndex: 60, tags: ['高脂肪', '高热量', '加工食品'] },
  { name: '汉堡', category: '快餐', calories: 295, protein: 15.0, carbs: 25.0, fat: 15.0, fiber: 1.0, sugar: 3.0, giIndex: 70, tags: ['高热量', '高碳水', '快餐'] },
  { name: '薯条', category: '快餐', calories: 312, protein: 3.4, carbs: 41.0, fat: 15.0, fiber: 3.0, sugar: 0.5, giIndex: 75, tags: ['高碳水', '高脂肪', '加工食品'] },
  { name: '披萨', category: '快餐', calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 1.5, sugar: 3.0, giIndex: 80, tags: ['高热量', '高碳水', '适量食用'] },
  { name: '炒饭', category: '快餐', calories: 172, protein: 5.0, carbs: 27.0, fat: 5.0, fiber: 0.6, sugar: 0.3, giIndex: 70, tags: ['高碳水', '主食类'] },

  { name: '可乐', category: '饮料', calories: 43, protein: 0, carbs: 10.6, fat: 0, fiber: 0, sugar: 10.6, giIndex: 65, tags: ['高糖', '空热量', '尽量避免'] },
  { name: '咖啡（美式）', category: '饮料', calories: 2, protein: 0.1, carbs: 0, fat: 0, fiber: 0, sugar: 0, giIndex: 0, tags: ['低热量', '提神', '抗氧化'] },
  { name: '奶茶', category: '饮料', calories: 95, protein: 2.0, carbs: 15.0, fat: 3.0, fiber: 0, sugar: 12.0, giIndex: 50, tags: ['高糖', '高热量', '适量饮用'] },
  { name: '果汁', category: '饮料', calories: 46, protein: 0.5, carbs: 11.0, fat: 0.2, fiber: 0.1, sugar: 9.0, giIndex: 50, tags: ['维生素', '适量糖分', '不如整果'] },

  { name: '蛋糕', category: '甜点', calories: 347, protein: 7.2, carbs: 57.0, fat: 11.0, fiber: 0.5, sugar: 40.0, giIndex: 70, tags: ['高糖', '高脂肪', '高热量'] },
  { name: '巧克力', category: '甜点', calories: 546, protein: 4.9, carbs: 59.0, fat: 31.0, fiber: 3.0, sugar: 52.0, giIndex: 44, tags: ['高热量', '高糖', '适量食用'] },
  { name: '冰淇淋', category: '甜点', calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0, fiber: 0.3, sugar: 18.0, giIndex: 65, tags: ['高糖', '高脂肪', '适量食用'] },
  { name: '饼干', category: '甜点', calories: 433, protein: 9.0, carbs: 71.0, fat: 12.0, fiber: 1.5, sugar: 28.0, giIndex: 70, tags: ['高碳水', '高糖', '零食'] },

  { name: '豆腐', category: '豆制品', calories: 81, protein: 8.1, carbs: 3.8, fat: 3.7, fiber: 0.4, sugar: 0.4, giIndex: 15, tags: ['植物蛋白', '低热量', '健康食品'] },
  { name: '花生', category: '坚果', calories: 574, protein: 24.8, carbs: 16.1, fat: 44.3, fiber: 5.5, sugar: 4.2, giIndex: 14, tags: ['高蛋白', '高脂肪', '适量食用'] },
  { name: '杏仁', category: '坚果', calories: 578, protein: 22.5, carbs: 19.9, fat: 50.6, fiber: 11.8, sugar: 4.5, giIndex: 15, tags: ['高纤维', '健康脂肪', '适量食用'] },
];

const DIET_ADVICE_POOL: { title: string; description: string; type: 'warning' | 'suggestion' | 'praise' }[] = [
  { title: '热量控制良好', description: '这一餐的总热量控制在合理范围内，继续保持！', type: 'praise' },
  { title: '蛋白质摄入充足', description: '蛋白质摄入比例合理，有助于肌肉修复和饱腹感维持。', type: 'praise' },
  { title: '营养搭配均衡', description: '三大营养素比例合理，整体饮食结构健康。', type: 'praise' },
  { title: '膳食纤维不足', description: '建议增加蔬菜、全谷物等高纤维食物，促进肠道健康。', type: 'suggestion' },
  { title: '热量偏高', description: '这一餐热量超出建议范围，建议适当减少主食或高脂肪食物摄入。', type: 'warning' },
  { title: '脂肪比例过高', description: '脂肪供能比偏高，建议选择更 lean 的蛋白质来源，减少油炸食品。', type: 'warning' },
  { title: '碳水比例偏高', description: '碳水化合物供能比偏高，建议用全谷物替代部分精制碳水。', type: 'warning' },
  { title: '添加糖注意', description: '检测到含糖饮料或甜点，建议控制添加糖摄入，每日不超过 25g。', type: 'warning' },
  { title: '建议搭配蔬菜', description: '蔬菜摄入量偏少，建议每餐至少搭配一份深色蔬菜。', type: 'suggestion' },
  { title: '低 GI 选择', description: '可考虑用低 GI 食物（如糙米、全麦面包）替代高 GI 精制主食，更有利于血糖稳定。', type: 'suggestion' },
  { title: '优质蛋白来源', description: '鱼、禽、蛋、奶、豆制品是优质蛋白来源，建议轮换搭配。', type: 'suggestion' },
  { title: '注意食物多样性', description: '建议增加食物种类，保证营养素摄入全面。', type: 'suggestion' },
];

const PORTION_SIZES = [
  { label: '一小份', grams: [50, 100] },
  { label: '标准份', grams: [100, 200] },
  { label: '一大份', grams: [200, 350] },
  { label: '半碗/半份', grams: [80, 150] },
  { label: '一整碗', grams: [200, 300] },
  { label: '约 100 克', grams: [90, 120] },
  { label: '约 150 克', grams: [130, 180] },
  { label: '约 200 克', grams: [180, 250] },
];

@Injectable()
export class FoodCalorieService {
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

  private pickOne<T>(arr: T[], rand: () => number): T {
    return arr[Math.floor(rand() * arr.length)];
  }

  private computeQualityScore(hints?: ImageQualityHints): number {
    if (!hints) return 85;
    let score = 100;
    if (hints.sharpness !== undefined) score -= Math.max(0, 70 - hints.sharpness) * 0.6;
    if (hints.brightnessStatus && hints.brightnessStatus !== 'normal') score -= 10;
    if (hints.contrast !== undefined) score -= Math.max(0, 50 - hints.contrast) * 0.4;
    if (hints.multiPanelDetected) score -= 20;
    if (hints.hasUiElements) score -= 12;
    if (hints.isScreenshot) score -= 8;
    if (hints.textDensity !== undefined && hints.textDensity > 30) score -= Math.min(15, (hints.textDensity - 30) * 0.5);
    if (hints.resolutionScore !== undefined) score -= Math.max(0, 60 - hints.resolutionScore) * 0.3;
    return Math.max(30, Math.min(100, Math.round(score)));
  }

  private buildQualityWarnings(hints?: ImageQualityHints): string[] {
    const warnings: string[] = [];
    if (!hints) return warnings;
    if (hints.multiPanelDetected) {
      warnings.push('检测到图片中包含多张拼接图，可能影响食物识别精度，建议裁剪出目标食物区域后重新识别');
    }
    if (hints.isScreenshot) {
      warnings.push('当前图片为屏幕截图，可能影响识别准确度，建议使用原图拍摄');
    }
    if (hints.sharpness !== undefined && hints.sharpness < 40) {
      warnings.push('图片清晰度不足，食物细节难以精准识别');
    }
    if (hints.brightnessStatus && hints.brightnessStatus !== 'normal') {
      warnings.push('图片光线问题可能影响食物颜色和份量估算');
    }
    return warnings;
  }

  private hashStringToSeed(str: string): number {
    const hash = crypto.createHash('sha256').update(str).digest();
    return hash.readUInt32BE(0) % 1000000;
  }

  private generateFoodItems(rand: () => number, qualityScore: number): FoodItem[] {
    const count = Math.floor(rand() * 4) + 1;
    const pickedFoods = this.pickSeeded(FOOD_DATABASE, count, rand);
    const confidencePenalty = Math.max(0, 100 - qualityScore) * 0.35;

    return pickedFoods.map((food, idx) => {
      const portion = this.pickOne(PORTION_SIZES, rand);
      const portionGrams = Math.floor(rand() * (portion.grams[1] - portion.grams[0])) + portion.grams[0];
      const gramFactor = portionGrams / 100;
      const baseConfidence = Math.floor(rand() * 15) + 85;

      return {
        id: `food-${idx}`,
        name: food.name,
        category: food.category,
        portion: `${portion.label}（约 ${portionGrams}g）`,
        portionGrams,
        confidence: Math.max(50, Math.floor(baseConfidence - confidencePenalty)),
        calories: Math.round(food.calories * gramFactor),
        protein: Math.round(food.protein * gramFactor * 10) / 10,
        carbs: Math.round(food.carbs * gramFactor * 10) / 10,
        fat: Math.round(food.fat * gramFactor * 10) / 10,
        fiber: food.fiber !== undefined ? Math.round(food.fiber * gramFactor * 10) / 10 : undefined,
        sugar: food.sugar !== undefined ? Math.round(food.sugar * gramFactor * 10) / 10 : undefined,
        giIndex: food.giIndex,
        tags: food.tags,
      };
    });
  }

  private generateNutritionSummary(items: FoodItem[]): NutritionSummary {
    const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
    const totalProtein = items.reduce((sum, i) => sum + i.protein, 0);
    const totalCarbs = items.reduce((sum, i) => sum + i.carbs, 0);
    const totalFat = items.reduce((sum, i) => sum + i.fat, 0);
    const totalFiber = items.reduce((sum, i) => sum + (i.fiber || 0), 0);
    const totalSugar = items.reduce((sum, i) => sum + (i.sugar || 0), 0);

    const proteinKcal = totalProtein * 4;
    const carbsKcal = totalCarbs * 4;
    const fatKcal = totalFat * 9;
    const totalKcal = proteinKcal + carbsKcal + fatKcal || 1;

    return {
      totalCalories,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalSugar: Math.round(totalSugar * 10) / 10,
      proteinRatio: Math.round((proteinKcal / totalKcal) * 100),
      carbsRatio: Math.round((carbsKcal / totalKcal) * 100),
      fatRatio: Math.round((fatKcal / totalKcal) * 100),
    };
  }

  private generateMealAssessment(summary: NutritionSummary, dietGoal: string | undefined, rand: () => number) {
    let baseScore = 70;

    const targetCalories = dietGoal === 'lose' ? 500 : dietGoal === 'gain' ? 800 : 600;
    const calorieDiff = Math.abs(summary.totalCalories - targetCalories);
    baseScore -= Math.min(30, calorieDiff / 20);

    if (summary.proteinRatio >= 20 && summary.proteinRatio <= 30) baseScore += 10;
    else baseScore -= Math.abs(summary.proteinRatio - 25) / 2;

    if (summary.carbsRatio >= 40 && summary.carbsRatio <= 60) baseScore += 5;
    if (summary.fatRatio >= 20 && summary.fatRatio <= 35) baseScore += 5;

    if (summary.totalSugar > 30) baseScore -= 10;
    if (summary.totalFiber >= 8) baseScore += 8;

    baseScore += Math.floor(rand() * 6) - 3;
    baseScore = Math.max(30, Math.min(100, Math.round(baseScore)));

    let level: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    let description = '';

    if (baseScore >= 85) {
      level = 'excellent';
      description = '这一餐搭配非常健康！营养均衡，热量适中，继续保持这个饮食习惯。';
    } else if (baseScore >= 70) {
      level = 'good';
      description = '整体搭配不错，小细节可以再优化一下会更完美。';
    } else if (baseScore >= 55) {
      level = 'fair';
      description = '饮食搭配有改善空间，建议参考下方建议进行调整。';
    } else {
      level = 'poor';
      description = '这一餐营养结构需要较大调整，建议认真参考饮食建议。';
    }

    return { score: baseScore, level, description };
  }

  private generateDietAdvice(
    summary: NutritionSummary,
    items: FoodItem[],
    dietGoal: string | undefined,
    rand: () => number
  ): DietAdvice[] {
    const adviceList: DietAdvice[] = [];
    const pool = [...DIET_ADVICE_POOL];

    if (summary.totalCalories > 700) {
      adviceList.push({
        id: 'advice-1',
        title: dietGoal === 'lose' ? '减脂期热量偏高' : '热量偏高',
        description: dietGoal === 'lose'
          ? '当前处于减脂目标，建议这一餐控制在 400-550 大卡以内，可以减少主食量或替换低卡食材。'
          : '这一餐热量超过 700 大卡，如果不是运动后补充，建议适当控制份量。',
        type: 'warning'
      });
    }

    if (summary.fatRatio > 40) {
      adviceList.push({
        id: 'advice-2',
        title: '脂肪占比过高',
        description: '脂肪供能比超过 40%，建议减少油炸、红烧类菜肴，选择清蒸、煮、烤等烹饪方式。',
        type: 'warning'
      });
    }

    if (summary.totalSugar > 25) {
      adviceList.push({
        id: 'advice-3',
        title: '添加糖摄入过多',
        description: `本餐添加糖约 ${summary.totalSugar}g，WHO 建议每日不超过 25g，建议减少含糖饮料和甜点。`,
        type: 'warning'
      });
    }

    if (summary.proteinRatio < 15) {
      adviceList.push({
        id: 'advice-4',
        title: '蛋白质摄入不足',
        description: '蛋白质供能比偏低，建议增加鸡蛋、瘦肉、鱼虾、豆制品等优质蛋白来源。',
        type: 'suggestion'
      });
    }

    if (summary.totalFiber < 5) {
      adviceList.push({
        id: 'advice-5',
        title: '膳食纤维不足',
        description: `本餐膳食纤维仅 ${summary.totalFiber}g，建议搭配蔬菜、全谷物、水果等补充。`,
        type: 'suggestion'
      });
    }

    const hasHighGI = items.some(i => (i.giIndex || 0) >= 70);
    if (hasHighGI && (dietGoal === 'diabetes' || dietGoal === 'lose')) {
      adviceList.push({
        id: 'advice-6',
        title: dietGoal === 'diabetes' ? '血糖管理注意' : '注意高 GI 食物',
        description: dietGoal === 'diabetes'
          ? '检测到高 GI 食物，糖尿病患者建议用糙米、全麦等低 GI 主食替代，平稳血糖。'
          : '高 GI 食物易引起血糖波动，减脂期建议搭配蛋白质和膳食纤维一起食用。',
        type: dietGoal === 'diabetes' ? 'warning' : 'suggestion'
      });
    }

    if (adviceList.length < 3) {
      const remain = this.pickSeeded(pool, 3 - adviceList.length, rand);
      remain.forEach((a, idx) => {
        adviceList.push({ ...a, id: `advice-extra-${idx}` });
      });
    }

    if (adviceList.length > 0 && !adviceList.some(a => a.type === 'praise')) {
      if (summary.totalCalories >= 400 && summary.totalCalories <= 650) {
        adviceList.unshift({
          id: 'advice-praise',
          title: '热量控制良好',
          description: '这一餐的总热量在合理范围内，继续保持这个节奏！',
          type: 'praise'
        });
      }
    }

    return adviceList;
  }

  private generateAlternativeSuggestions(
    items: FoodItem[],
    dietGoal: string | undefined,
    rand: () => number
  ) {
    const highCalorieItems = items.filter(i => i.calories > 200 || i.tags.some(t => ['高脂肪', '高糖', '高热量'].includes(t)));
    const suggestions: { id: string; originalFood: string; alternativeFood: string; calorieDiff: number; reason: string }[] = [];

    if (highCalorieItems.length === 0 && items.length > 0) {
      suggestions.push({
        id: 'alt-1',
        originalFood: items[0].name,
        alternativeFood: '搭配一份凉拌蔬菜',
        calorieDiff: -30,
        reason: '增加膳食纤维和饱腹感，营养更均衡。'
      });
      return suggestions;
    }

    const targets = this.pickSeeded(highCalorieItems, Math.min(2, highCalorieItems.length), rand);

    targets.forEach((item, idx) => {
      if (item.category === '主食') {
        suggestions.push({
          id: `alt-${idx}`,
          originalFood: item.name,
          alternativeFood: '糙米饭 / 全麦面包',
          calorieDiff: Math.round(-item.calories * 0.15),
          reason: '低 GI 全谷物，饱腹感更强，血糖更平稳。'
        });
      } else if (item.category === '肉类') {
        suggestions.push({
          id: `alt-${idx}`,
          originalFood: item.name,
          alternativeFood: '鸡胸肉 / 蒸鱼',
          calorieDiff: Math.round(-item.calories * 0.25),
          reason: '高蛋白低脂肪，减脂增肌优选。'
        });
      } else if (item.category === '快餐' || item.category === '甜点') {
        suggestions.push({
          id: `alt-${idx}`,
          originalFood: item.name,
          alternativeFood: '水果 / 无糖酸奶',
          calorieDiff: Math.round(-item.calories * 0.5),
          reason: '天然甜味更健康，还能补充维生素和益生菌。'
        });
      } else if (item.category === '饮料') {
        suggestions.push({
          id: `alt-${idx}`,
          originalFood: item.name,
          alternativeFood: '无糖茶 / 黑咖啡 / 气泡水',
          calorieDiff: -item.calories,
          reason: '0 卡替代，减少空热量摄入。'
        });
      } else {
        suggestions.push({
          id: `alt-${idx}`,
          originalFood: item.name,
          alternativeFood: '减少 1/3 份量',
          calorieDiff: Math.round(-item.calories * 0.33),
          reason: '适量即可，减少热量摄入同时不必完全放弃喜爱的食物。'
        });
      }
    });

    return suggestions;
  }

  async recognize(request: FoodCalorieRequest): Promise<FoodCalorieResponse> {
    const seed = this.hashStringToSeed(request.imageBase64.slice(0, 8000));
    const rand = this.seededRandom(seed);

    const qualityScore = this.computeQualityScore(request.qualityHints);
    const qualityWarnings = this.buildQualityWarnings(request.qualityHints);

    const foodItems = this.generateFoodItems(rand, qualityScore);
    const nutritionSummary = this.generateNutritionSummary(foodItems);
    const mealAssessment = this.generateMealAssessment(nutritionSummary, request.dietGoal, rand);
    const dietAdvice = this.generateDietAdvice(nutritionSummary, foodItems, request.dietGoal, rand);
    const alternativeSuggestions = this.generateAlternativeSuggestions(foodItems, request.dietGoal, rand);

    return {
      foodItems,
      nutritionSummary,
      mealAssessment,
      dietAdvice,
      alternativeSuggestions,
      overallConfidence: qualityScore,
      qualityWarnings,
    };
  }
}
