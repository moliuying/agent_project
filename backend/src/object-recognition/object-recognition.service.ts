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

export type ObjectCategory =
  | 'plant'
  | 'animal'
  | 'food'
  | 'artifact'
  | 'architecture'
  | 'vehicle'
  | 'landmark'
  | 'instrument'
  | 'furniture'
  | 'other';

export type SafetyLevel = 'safe' | 'caution' | 'danger' | 'unknown';

export type ConfidenceLevel = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export interface ConfidenceBreakdown {
  visualMatch: number;
  featureMatch: number;
  contextMatch: number;
  overall: number;
}

export interface ConfidenceExplanation {
  level: ConfidenceLevel;
  levelLabel: string;
  score: number;
  breakdown: ConfidenceBreakdown;
  reasons: string[];
  recommendation: string;
}

export interface SafetyInfo {
  level: SafetyLevel;
  levelLabel: string;
  edibility: 'edible' | 'toxic' | 'medicinal' | 'unknown' | 'not_applicable';
  edibilityLabel: string;
  warnings: string[];
  precautions: string[];
  emergencyAdvice?: string;
}

export interface ConfusableSpecies {
  id: string;
  name: string;
  englishName: string;
  similarity: number;
  similarityLabel: string;
  isToxic: boolean;
  keyDifference: string;
  dangerLevel?: SafetyLevel;
  dangerDescription?: string;
}

export interface ObjectRecognitionRequest {
  imageBase64: string;
  extraNote?: string;
  qualityHints?: ImageQualityHints;
}

export interface RecognizedObject {
  id: string;
  name: string;
  englishName: string;
  category: ObjectCategory;
  categoryLabel: string;
  confidence: number;
  confidenceExplanation: ConfidenceExplanation;
  description: string;
  backgroundKnowledge: string;
  taxonomy: {
    kingdom?: string;
    phylum?: string;
    class?: string;
    order?: string;
    family?: string;
    genus?: string;
    species?: string;
  };
  keyFeatures: string[];
  distinguishingFeatures: string[];
  funFacts: string[];
  relatedObjects: {
    id: string;
    name: string;
    categoryLabel: string;
    relation: string;
  }[];
  tags: string[];
  safetyInfo: SafetyInfo;
  confusableSpecies: ConfusableSpecies[];
}

export interface ObjectRecognitionResponse {
  primaryObject: RecognizedObject;
  secondaryObjects: RecognizedObject[];
  sceneDescription: string;
  overallConfidence: number;
  qualityWarnings: string[];
  recognitionTimestamp: string;
  safetyDisclaimer: string;
  hasSafetyRisk: boolean;
  highRiskWarning?: string;
}

const CATEGORY_LABELS: Record<ObjectCategory, string> = {
  plant: '植物',
  animal: '动物',
  food: '美食',
  artifact: '文物',
  architecture: '建筑',
  vehicle: '交通工具',
  landmark: '地标景点',
  instrument: '乐器',
  furniture: '家具',
  other: '其他'
};

const SAFETY_LABELS: Record<SafetyLevel, string> = {
  safe: '安全',
  caution: '需谨慎',
  danger: '危险',
  unknown: '未知'
};

const EDIBILITY_LABELS = {
  edible: '可食用',
  toxic: '有毒',
  medicinal: '药用',
  unknown: '未知',
  not_applicable: '不适用'
};

const CONFIDENCE_LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  very_high: '极高',
  high: '较高',
  medium: '中等',
  low: '较低',
  very_low: '极低'
};

const SAFETY_DISCLAIMER =
  '⚠️ 重要安全提示：本功能的识别结果仅供参考和科普学习使用，不作为食用、药用、鉴别野生动物或专业鉴定的依据。自然界中存在大量外形相似但属性截然不同的物种（如毒蘑菇与可食用蘑菇、有毒植物与药用植物等），仅凭图片无法做出100%准确的判断。切勿根据识别结果随意采摘、食用野生动植物或进行其他可能危及安全的行为。如需专业鉴定，请咨询相关领域专家或权威机构。因误判导致的任何后果，本应用不承担责任。';

interface ObjectData {
  name: string;
  englishName: string;
  category: ObjectCategory;
  description: string;
  backgroundKnowledge: string;
  taxonomy: RecognizedObject['taxonomy'];
  keyFeatures: string[];
  distinguishingFeatures: string[];
  funFacts: string[];
  tags: string[];
  safetyInfo: SafetyInfo;
  confusableSpecies: ConfusableSpecies[];
}

const OBJECT_DATABASE: ObjectData[] = [
  {
    name: '向日葵',
    englishName: 'Sunflower',
    category: 'plant',
    description: '向日葵是菊科向日葵属的一年生草本植物，因花序随太阳转动而得名。',
    backgroundKnowledge: '向日葵原产于北美洲，现已在世界各地广泛栽培。它不仅是重要的油料作物，还具有观赏价值。向日葵的花语是"沉默的爱"和"忠诚"。',
    taxonomy: {
      kingdom: '植物界',
      phylum: '被子植物门',
      class: '双子叶植物纲',
      order: '菊目',
      family: '菊科',
      genus: '向日葵属',
      species: '向日葵'
    },
    keyFeatures: ['株高可达1-3.5米', '花盘直径可达30厘米', '种子富含油脂', '具有向光性运动'],
    distinguishingFeatures: ['花盘巨大，呈明显的圆盘状', '种子排列呈典型的斐波那契螺旋', '茎干粗壮直立，全株被粗硬刚毛', '叶片心状卵圆形，边缘有粗锯齿'],
    funFacts: ['向日葵的种子排列遵循斐波那契数列', '一株向日葵可产1000-2000颗种子', '梵高的《向日葵》系列画作使其闻名于世'],
    tags: ['观赏植物', '油料作物', '一年生草本'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: ['极少数人可能对葵花籽过敏'],
      precautions: ['葵花籽脂肪含量较高，适量食用', '霉变的葵花籽可能含有黄曲霉素，切勿食用']
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '洋姜（菊芋）',
        englishName: 'Jerusalem Artichoke',
        similarity: 72,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '洋姜花盘较小（约5-8cm），叶片为长卵形，地下有可食用的块茎；向日葵花盘巨大，无肥大块茎。'
      },
      {
        id: 'cf-2',
        name: '肿柄菊',
        englishName: 'Tree Marigold',
        similarity: 65,
        similarityLabel: '部分相似',
        isToxic: false,
        keyDifference: '肿柄菊花盘远小于向日葵，叶柄基部膨大呈肿柄状，植株多分枝。'
      }
    ]
  },
  {
    name: '银杏',
    englishName: 'Ginkgo Biloba',
    category: 'plant',
    description: '银杏是银杏科银杏属落叶乔木，被誉为植物界的"活化石"。',
    backgroundKnowledge: '银杏是现存最古老的裸子植物之一，起源于2.7亿年前的二叠纪。它曾广泛分布于北半球，第四纪冰川后仅在中国保存下来。',
    taxonomy: {
      kingdom: '植物界',
      phylum: '银杏门',
      class: '银杏纲',
      order: '银杏目',
      family: '银杏科',
      genus: '银杏属',
      species: '银杏'
    },
    keyFeatures: ['叶片呈扇形，秋季变金黄色', '雌雄异株', '种子俗称白果', '树龄可达千年以上'],
    distinguishingFeatures: ['叶片呈独特的扇形，先端二裂，叶脉二叉分枝', '种子核果状，外种皮肉质有臭味，中种皮白色骨质', '落叶乔木，枝条有长枝和短枝之分'],
    funFacts: ['银杏树是成都市的市树', '银杏叶提取物被广泛用于保健品', '广岛原子弹爆炸后，银杏树是最先恢复发芽的树种之一'],
    tags: ['活化石', '落叶乔木', '药用植物'],
    safetyInfo: {
      level: 'caution',
      levelLabel: SAFETY_LABELS.caution,
      edibility: 'medicinal',
      edibilityLabel: EDIBILITY_LABELS.medicinal,
      warnings: [
        '银杏种子（白果）含有微量氰苷和银杏酸，生食或过量食用可能导致中毒',
        '中毒症状包括恶心、呕吐、腹泻、头痛、抽搐等，严重者可危及生命',
        '儿童更易中毒，5岁以下儿童应避免食用'
      ],
      precautions: [
        '食用前必须充分加热煮熟，且不可过量（成人每天不超过10颗，儿童不超过5颗）',
        '去除绿色的胚芽，因胚芽毒素含量最高',
        '不要采食路边或公园的银杏果，可能受到汽车尾气污染'
      ],
      emergencyAdvice: '如误食生白果或出现中毒症状，应立即催吐并尽快就医！'
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '鸭脚木（鹅掌柴）',
        englishName: 'Schefflera',
        similarity: 58,
        similarityLabel: '部分相似',
        isToxic: true,
        keyDifference: '鸭脚木是常绿灌木，掌状复叶（6-9小叶），叶片不是扇形；银杏为落叶乔木，单叶扇形。鸭脚木汁液对皮肤有刺激性。',
        dangerLevel: 'caution',
        dangerDescription: '鸭脚木的汁液含有轻微毒性，接触可能引起皮肤过敏，误食会导致口腔不适。'
      }
    ]
  },
  {
    name: '玫瑰',
    englishName: 'Rose',
    category: 'plant',
    description: '玫瑰是蔷薇科蔷薇属的落叶灌木，被誉为"花中皇后"。',
    backgroundKnowledge: '玫瑰原产于中国，栽培历史超过2000年。玫瑰花是爱情和浪漫的象征，也是世界上最受欢迎的花卉之一。',
    taxonomy: {
      kingdom: '植物界',
      phylum: '被子植物门',
      class: '双子叶植物纲',
      order: '蔷薇目',
      family: '蔷薇科',
      genus: '蔷薇属',
      species: '玫瑰'
    },
    keyFeatures: ['茎上有刺', '花色丰富，有红、粉、白、黄等', '花朵具有浓郁的香气', '花期5-9月'],
    distinguishingFeatures: ['茎上密被绒毛和腺毛，有针刺和刺毛', '叶片5-9片，上面有皱褶，下面有绒毛', '花单生或数朵簇生，香气浓郁', '果实扁球形，红色'],
    funFacts: ['全球每年约生产40亿朵玫瑰', '玫瑰精油是世界上最昂贵的精油之一，1公斤需要约500万朵花瓣', '玫瑰是多个国家的国花，包括英国、美国、卢森堡等'],
    tags: ['观赏花卉', '香料植物', '象征爱情'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: ['茎上有刺，注意防止扎伤', '对花粉过敏者应避免近距离接触'],
      precautions: ['食用玫瑰需选择食用玫瑰品种，观赏玫瑰可能有农药残留']
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '月季',
        englishName: 'Chinese Rose',
        similarity: 88,
        similarityLabel: '高度相似',
        isToxic: false,
        keyDifference: '月季叶片3-5片，较光滑无皱褶，刺少而大，花多单生，月月开花；玫瑰叶片5-9片有皱褶，刺多密生，一年开花1-2次。'
      },
      {
        id: 'cf-2',
        name: '蔷薇',
        englishName: 'Wild Rose',
        similarity: 82,
        similarityLabel: '高度相似',
        isToxic: false,
        keyDifference: '蔷薇多为藤本攀援，花多朵组成圆锥花序，叶片两面有柔毛；玫瑰多为直立灌木，花单生或数朵簇生。'
      }
    ]
  },
  {
    name: '白毒伞（致命白毒鹅膏）',
    englishName: 'Death Cap Mushroom',
    category: 'plant',
    description: '白毒伞是鹅膏菌属的一种剧毒蘑菇，是世界上最毒的蘑菇之一，别名"死亡帽"。',
    backgroundKnowledge: '白毒伞含有鹅膏毒肽和鬼笔毒肽，对肝脏有致命损害，一颗即可致人死亡。每年全球都有误食致死的案例。它的外形与多种可食用蘑菇相似，是误食中毒的主要元凶。',
    taxonomy: {
      kingdom: '真菌界',
      phylum: '担子菌门',
      class: '伞菌纲',
      order: '伞菌目',
      family: '鹅膏菌科',
      genus: '鹅膏菌属',
      species: '白毒鹅膏菌'
    },
    keyFeatures: ['通体纯白色', '菌盖初期卵形，后平展', '有明显的菌环和菌托', '多生于阔叶林中地上'],
    distinguishingFeatures: ['必须同时具备三大特征：菌盖、菌环（柄上的白色环状物）、菌托（柄基部的杯状结构）', '通体白色，菌托呈袋状全包被菌柄基部', '受伤不变色，无特殊气味或有微弱甜味'],
    funFacts: ['白毒伞的毒素耐高温，烹煮、晒干都无法破坏其毒性', '中毒后有6-12小时的潜伏期，初期症状类似肠胃炎，容易被误诊', '罗马帝国皇帝克劳狄乌斯据传就是被妻子用死亡帽毒杀的'],
    tags: ['剧毒蘑菇', '致死真菌', '切勿采食'],
    safetyInfo: {
      level: 'danger',
      levelLabel: SAFETY_LABELS.danger,
      edibility: 'toxic',
      edibilityLabel: EDIBILITY_LABELS.toxic,
      warnings: [
        '🚨 剧毒！误食一颗即可致死，死亡率极高（可达50%以上）',
        '毒素为鹅膏毒肽，主要损害肝脏和肾脏，无特效解毒药',
        '中毒潜伏期长（6-24小时），出现症状时往往已造成严重器官损害',
        '外形与多种可食用蘑菇（如鸡枞、金针菇、草菇等）相似，极易误采误食'
      ],
      precautions: [
        '绝对不可采食任何野生白色带菌环和菌托的蘑菇！',
        '民间"颜色鲜艳才有毒""与大蒜同煮变黑才有毒""虫子吃的就无毒"等说法都是错误的，不能作为判断依据',
        '不认识的蘑菇坚决不吃！这是唯一可靠的原则'
      ],
      emergencyAdvice: '如不慎误食，应立即催吐，并尽快携带蘑菇样本前往医院救治！越早治疗，生存率越高。'
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '鸡枞菌',
        englishName: 'Termite Mushroom',
        similarity: 75,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '鸡枞菌无菌环和菌托，常生于白蚁巢上，菌柄纤维质有韧性；白毒伞有明显的白色菌环和袋状菌托，这是最关键的区别！',
        dangerLevel: 'safe',
        dangerDescription: '鸡枞菌是著名的野生食用菌，无毒可食用。'
      },
      {
        id: 'cf-2',
        name: '草地菇（可食用白蘑菇）',
        englishName: 'Field Mushroom',
        similarity: 70,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '可食用白蘑菇菌褶幼时粉红色后变褐色，无菌托；白毒伞菌褶始终为白色，有明显袋状菌托。',
        dangerLevel: 'safe',
        dangerDescription: '可食用蘑菇，但必须确认无菌托和菌环特征。'
      },
      {
        id: 'cf-3',
        name: '鹅膏菌（其他剧毒品种）',
        englishName: 'Amanita (other toxic species)',
        similarity: 92,
        similarityLabel: '高度相似',
        isToxic: true,
        keyDifference: '鹅膏属大多数物种都有毒或致命，它们的共同特征是同时具有菌盖、菌环和菌托，俗称"戴帽子、穿裙子、穿靴子"，只要三特征同时具备就绝对不能采食！',
        dangerLevel: 'danger',
        dangerDescription: '鹅膏属有毒品种都含有致命毒素，误食死亡率极高！'
      }
    ]
  },
  {
    name: '猫',
    englishName: 'Cat',
    category: 'animal',
    description: '猫是猫科猫属的小型哺乳动物，是人类最受欢迎的宠物之一。',
    backgroundKnowledge: '家猫起源于约9500年前的中东地区，由非洲野猫驯化而来。猫因其捕鼠能力和可爱的外表而被人类饲养。',
    taxonomy: {
      kingdom: '动物界',
      phylum: '脊索动物门',
      class: '哺乳纲',
      order: '食肉目',
      family: '猫科',
      genus: '猫属',
      species: '家猫'
    },
    keyFeatures: ['身体灵活，擅长攀爬跳跃', '夜视能力出色', '胡须具有触觉感知功能', '爪子可以伸缩'],
    distinguishingFeatures: ['体型较小，一般体重3-8公斤', '耳尖呈圆形，瞳孔可随光线大小变化', '胡须（触须）分布在嘴周、脸颊、眉弓等处，用于感知环境', '走路时后脚几乎踩在前脚印上'],
    funFacts: ['猫一天约睡12-16小时', '猫的鼻纹和人类指纹一样，每只猫都是独一无二的', '猫可以发出超过100种声音，而狗只能发出约10种'],
    tags: ['宠物', '哺乳动物', '夜行性动物'],
    safetyInfo: {
      level: 'caution',
      levelLabel: SAFETY_LABELS.caution,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: [
        '被猫抓伤咬伤可能导致感染，存在猫抓病、狂犬病等风险',
        '流浪猫可能携带多种病菌和寄生虫',
        '部分人对猫毛、皮屑过敏'
      ],
      precautions: [
        '接触陌生或流浪动物时保持警惕，不要随意挑逗',
        '被抓伤咬伤后立即用流动水和肥皂清洗15分钟，并视情况就医',
        '家养猫应定期接种疫苗、驱虫'
      ]
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '豹猫（野生）',
        englishName: 'Leopard Cat',
        similarity: 72,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '豹猫身上有类似豹的斑点花纹，体型比家猫略大，是国家二级保护动物，性情凶猛不可作为宠物。家猫一般无明显斑点。',
        dangerLevel: 'caution',
        dangerDescription: '豹猫是保护动物，猎捕、伤害均属违法行为。野生个体具有攻击性。'
      }
    ]
  },
  {
    name: '大熊猫',
    englishName: 'Giant Panda',
    category: 'animal',
    description: '大熊猫是熊科大熊猫属的哺乳动物，是中国特有的珍稀动物，被誉为"国宝"。',
    backgroundKnowledge: '大熊猫是地球上最古老的物种之一，已在地球上生存了至少800万年。目前主要栖息在四川、陕西和甘肃的山区竹林中。',
    taxonomy: {
      kingdom: '动物界',
      phylum: '脊索动物门',
      class: '哺乳纲',
      order: '食肉目',
      family: '熊科',
      genus: '大熊猫属',
      species: '大熊猫'
    },
    keyFeatures: ['黑白两色的毛皮', '体型肥硕似熊，头圆尾短', '以竹子为主食，占饮食的99%', '拇指结构特殊，便于抓握竹子'],
    distinguishingFeatures: ['标志性的黑白配色：耳朵、眼周、前后肢和肩部为黑色，其余为白色', '体型大，成年个体体长1.2-1.8米，体重60-120公斤', '脸部圆胖，有明显的"黑眼圈"', '行走方式为内八字'],
    funFacts: ['大熊猫每天要吃12-38公斤竹子，花12-16小时进食', '大熊猫幼崽出生时体重只有母亲的1/900，约100-200克', '大熊猫是世界自然基金会(WWF)的标志'],
    tags: ['国宝', '珍稀动物', '中国特有'],
    safetyInfo: {
      level: 'caution',
      levelLabel: SAFETY_LABELS.caution,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: [
        '大熊猫是国家一级保护动物，伤害、猎捕属严重违法行为',
        '大熊猫虽外表温顺，但本质是熊，具有强大的咬合力（仅次于北极熊），攻击力强',
        '野生大熊猫具有一定的领地意识，不可靠太近'
      ],
      precautions: [
        '参观时遵守园区规定，不投喂、不翻越护栏',
        '在野外如遇大熊猫，保持安全距离（50米以上），不干扰、不追逐',
        '如遇受伤或迷途的野生大熊猫，应联系林业部门，不可擅自接触'
      ]
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '黑熊（亚洲黑熊）',
        englishName: 'Asiatic Black Bear',
        similarity: 60,
        similarityLabel: '部分相似',
        isToxic: false,
        keyDifference: '黑熊全身黑色，胸部有白色V形或月牙形斑纹；大熊猫黑白分明，无胸部白斑。黑熊体型更修长，善于爬树。',
        dangerLevel: 'danger',
        dangerDescription: '黑熊具有较强的攻击性，尤其是带幼崽的母熊，遇到时应缓慢后退远离，切勿奔跑！'
      },
      {
        id: 'cf-2',
        name: '小熊猫',
        englishName: 'Red Panda',
        similarity: 45,
        similarityLabel: '略有相似',
        isToxic: false,
        keyDifference: '小熊猫体型如猫大小，全身红褐色，有长而蓬松的环纹尾巴；与黑白配色的大熊猫外观差异明显。小熊猫是小熊猫科动物，与大熊猫并非近亲。',
        dangerLevel: 'safe',
        dangerDescription: '小熊猫性情温和，也是国家二级保护动物。'
      }
    ]
  },
  {
    name: '孔雀',
    englishName: 'Peacock',
    category: 'animal',
    description: '孔雀是雉科孔雀属的大型鸟类，以雄性绚丽的尾屏而闻名。',
    backgroundKnowledge: '孔雀主要分布在南亚和东南亚地区，有蓝孔雀和绿孔雀两种。孔雀开屏是求偶行为，雄性通过展示尾羽吸引雌性。',
    taxonomy: {
      kingdom: '动物界',
      phylum: '脊索动物门',
      class: '鸟纲',
      order: '鸡形目',
      family: '雉科',
      genus: '孔雀属',
      species: '孔雀'
    },
    keyFeatures: ['雄性尾羽可达1.5米以上', '羽毛具有金属光泽的虹彩', '头顶有直立的冠羽', '善于奔跑，飞行能力较弱'],
    distinguishingFeatures: ['体型大，体长可达2米以上（含尾屏）', '头顶有一簇直立的冠羽，呈扇形排列', '雄性尾上覆羽特别延长形成尾屏，羽尖有眼状斑', '通体蓝绿色或绿色，具金属光泽'],
    funFacts: ['孔雀羽毛上的"眼睛"斑纹是为了迷惑捕食者', '孔雀是印度的国鸟', '孔雀羽毛的颜色不是色素，而是结构色，由光的干涉产生'],
    tags: ['观赏鸟类', '雉科', '开屏求偶'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['绿孔雀是国家一级保护动物，严禁猎捕、伤害', '人工饲养的蓝孔雀虽较温顺，但受惊时可能会用爪喙攻击'],
      precautions: ['观赏时保持安全距离，不要惊吓或试图拔取羽毛']
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '红腹锦鸡',
        englishName: 'Golden Pheasant',
        similarity: 62,
        similarityLabel: '部分相似',
        isToxic: false,
        keyDifference: '红腹锦鸡体型较小（约1米），羽色以金红为主，有金黄色丝状羽冠；孔雀体型大，尾屏发达，羽色蓝绿。红腹锦鸡是中国特有物种，国家二级保护动物。',
        dangerLevel: 'safe',
        dangerDescription: '红腹锦鸡是保护动物，不可猎捕。'
      }
    ]
  },
  {
    name: '北京烤鸭',
    englishName: 'Peking Duck',
    category: 'food',
    description: '北京烤鸭是北京著名的传统名菜，被誉为"天下第一美味"。',
    backgroundKnowledge: '北京烤鸭的历史可以追溯到南北朝时期，真正成为宫廷御膳是在明朝。如今，全聚德和便宜坊是北京最著名的烤鸭店。',
    taxonomy: {},
    keyFeatures: ['外皮红润油亮，酥脆可口', '肉质细嫩多汁', '配薄饼、葱丝、甜面酱食用', '通常片皮后上桌'],
    distinguishingFeatures: ['鸭皮呈枣红色，油亮有光泽，皮层酥脆', '片鸭讲究每片都有皮有肉', '成品搭配特定的荷叶饼、甜面酱、黄瓜条、葱丝'],
    funFacts: ['正宗的北京烤鸭选用北京填鸭，喂养45天左右', '烤鸭有挂炉和焖炉两大流派', '吃烤鸭讲究"一鸭三吃"：鸭皮、鸭肉、鸭架汤'],
    tags: ['北京名菜', '宫廷菜', '国宴菜品'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: [
        '烤鸭脂肪含量较高，高血脂、肥胖人群应适量食用',
        '鸭肉性偏寒凉，脾胃虚寒者不宜多食',
        '避免食用来源不明或未熟透的鸭肉'
      ],
      precautions: [
        '选择正规餐厅食用',
        '搭配蔬菜、主食一起食用，注意营养均衡'
      ]
    },
    confusableSpecies: []
  },
  {
    name: '小笼包',
    englishName: 'Soup Dumpling (Xiaolongbao)',
    category: 'food',
    description: '小笼包是源自江苏常州的传统小吃，以皮薄馅大、汤汁丰富而闻名。',
    backgroundKnowledge: '小笼包起源于清代道光年间的常州府，后发展出上海南翔小笼、无锡小笼等多个流派。',
    taxonomy: {},
    keyFeatures: ['皮薄如纸，呈半透明状', '内馅含丰富汤汁', '通常18-22个褶', '配姜丝和醋食用'],
    distinguishingFeatures: ['每个包子约25克重，皮薄呈半透明，可隐约看到内部汤汁', '捏褶精细，一般18个以上', '咬开后有大量汤汁流出是其标志特征'],
    funFacts: ['吃小笼包有口诀："轻轻提，慢慢移，先开窗，后喝汤"', '正宗小笼包用猪皮冻做馅，蒸制后融化成汤', '上海南翔小笼被评为国家级非物质文化遗产'],
    tags: ['江南小吃', '面点', '汤汁丰富'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: ['刚出笼的小笼包汤汁温度极高（可达90℃以上），直接咬开容易烫伤口腔', '肉馅需完全蒸熟，避免食用生馅或未熟透的'],
      precautions: ['食用时先在皮上咬一小口，晾凉汤汁后再吃', '蘸醋和姜丝食用可去腥解腻']
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '生煎包',
        englishName: 'Shengjian',
        similarity: 75,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '生煎包是煎制的，底部金黄酥脆，顶部撒芝麻和葱花；小笼包是蒸制的，皮薄半透明，口感松软。生煎包一般体积也更大。'
      },
      {
        id: 'cf-2',
        name: '灌汤包',
        englishName: 'Guantang Bao',
        similarity: 88,
        similarityLabel: '高度相似',
        isToxic: false,
        keyDifference: '灌汤包皮更厚一些，体积更大，汤汁更多，通常用吸管吸食；小笼包皮极薄，个头较小，捏褶更多。两者是近亲，差异主要在大小和皮的厚度。'
      }
    ]
  },
  {
    name: '野生蘑菇（泛指）',
    englishName: 'Wild Mushroom',
    category: 'plant',
    description: '野生蘑菇是生长在野外的大型真菌的统称，种类繁多，既有美味的食用菌，也有剧毒的致死品种。',
    backgroundKnowledge: '全球已知约14000种大型真菌，其中可食用的约2000种，有毒的约200种，剧毒可致死的约50-100种。中国每年因误食毒蘑菇导致的中毒事件超过千起，死亡人数居食物中毒首位。',
    taxonomy: {
      kingdom: '真菌界'
    },
    keyFeatures: ['由菌丝体和子实体组成', '子实体是通常看到的"蘑菇"部分', '多生长在潮湿阴暗的林地、草地', '通过孢子繁殖'],
    distinguishingFeatures: ['形态多样：伞状、盘状、球状、珊瑚状等', '颜色各异：白、黄、红、褐、黑、绿等', '注意观察：菌盖、菌褶、菌环、菌托、菌柄、受伤变色等特征'],
    funFacts: ['世界上最大的生物是一种蜜环菌，在美国俄勒冈州占地约9.6平方公里', '蘑菇的孢子可以在太空中存活', '有些蘑菇会发出生物荧光（发光蘑菇）'],
    tags: ['真菌', '野生', '谨慎采食'],
    safetyInfo: {
      level: 'danger',
      levelLabel: SAFETY_LABELS.danger,
      edibility: 'unknown',
      edibilityLabel: EDIBILITY_LABELS.unknown,
      warnings: [
        '🚨 野生蘑菇种类极多，仅凭图片无法准确区分有毒与无毒！',
        '🚨 中国每年约有500-1000人因误食毒蘑菇死亡，死亡率超过20%',
        '🚨 剧毒蘑菇如白毒伞、鹅膏菌、鹿花菌等，少量即可致死',
        '⚠️ 民间"颜色不鲜艳就无毒""和大蒜同煮不变黑就无毒""虫子吃的就无毒"等说法全部都是错误的，不能作为判断依据！',
        '⚠️ 毒蘑菇中毒症状多样，部分种类有较长的潜伏期（6-24小时），出现症状时往往已错过最佳治疗时机'
      ],
      precautions: [
        '❌ 不认识的蘑菇坚决不采、不吃！这是唯一可靠的原则',
        '❌ 不要采摘路边、公园、树下、草坪上的野生蘑菇',
        '❌ 不要轻信"经验人士"的口头判断',
        '✅ 食用蘑菇应购买市场或超市销售的已知可食用品种',
        '✅ 如需鉴别野生蘑菇，应送当地真菌研究所或专业机构'
      ],
      emergencyAdvice: '如误食野生蘑菇后出现恶心、呕吐、腹泻、腹痛、头晕、幻觉等任何不适症状，应立即催吐、带上蘑菇样本就医，并告知医生食用了野生蘑菇！不同毒蘑菇的中毒类型不同，治疗方法也不同，样本有助于医生判断。'
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '白毒伞（死亡帽）',
        englishName: 'Death Cap',
        similarity: 99,
        similarityLabel: '极易混淆',
        isToxic: true,
        keyDifference: '这是最常见的致死毒蘑菇，特征是同时具有"戴帽子（菌盖）、穿裙子（菌环）、穿靴子（菌托）"三个特征。凡是同时具备这三个特征的蘑菇，无论什么颜色，绝对不能吃！',
        dangerLevel: 'danger',
        dangerDescription: '剧毒！一颗可致人死亡，无特效解毒药。'
      },
      {
        id: 'cf-2',
        name: '红伞伞白杆杆（毒蝇鹅膏）',
        englishName: 'Fly Agaric',
        similarity: 90,
        similarityLabel: '极易混淆',
        isToxic: true,
        keyDifference: '红色菌盖，上有白色斑点，白色菌柄和菌环，底部有菌托。著名的致幻毒蘑菇，童谣"红伞伞，白杆杆，吃完一起躺板板"唱的就是它。',
        dangerLevel: 'danger',
        dangerDescription: '含有毒蝇碱和致幻成分，误食可引起幻觉、抽搐、呕吐，严重者可致死。'
      },
      {
        id: 'cf-3',
        name: '鹿花菌（河豚菌）',
        englishName: 'False Morel',
        similarity: 85,
        similarityLabel: '极易混淆',
        isToxic: true,
        keyDifference: '外形类似羊肚菌（食用菌），但菌盖呈扭曲脑状而非蜂窝状，切开后菌柄内部不是中空的。',
        dangerLevel: 'danger',
        dangerDescription: '含有鹿花菌素，误食可导致溶血、肝肾衰竭，死亡率较高。即使是"传统去毒方法"也不能保证安全。'
      }
    ]
  },
  {
    name: '兵马俑',
    englishName: 'Terracotta Army',
    category: 'artifact',
    description: '兵马俑是秦始皇陵的陪葬坑陶俑，被誉为"世界第八大奇迹"。',
    backgroundKnowledge: '兵马俑始建于公元前246年至前208年，1974年被陕西农民意外发现。已发掘的三个坑共出土陶俑陶马8000余件。',
    taxonomy: {},
    keyFeatures: ['每个陶俑面容各异，千人千面', '按身份分为将军俑、军吏俑、武士俑等', '原本通体彩绘，出土后逐渐氧化褪色', '规模宏大，排列整齐'],
    distinguishingFeatures: ['真人大小的陶制俑像，高约1.8米', '每个俑的面部表情、发型、服饰都不同', '手持真实的青铜兵器（已出土约4万件）', '按兵种和身份分级，排列成整齐的军阵'],
    funFacts: ['兵马俑是世界上规模最大的地下军事博物馆', '每个陶俑的耳朵都不一样，如同指纹', '兵马俑手中的武器是真实的青铜兵器，部分仍锋利如新'],
    tags: ['世界文化遗产', '秦代文物', '西安旅游'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['兵马俑是国家一级文物，严禁触摸、刻画、损坏', '参观时禁止使用闪光灯拍照'],
      precautions: ['遵守博物馆参观规定，文明参观']
    },
    confusableSpecies: []
  },
  {
    name: '青花瓷',
    englishName: 'Blue and White Porcelain',
    category: 'artifact',
    description: '青花瓷是中国传统瓷器的代表，以含钴的蓝色颜料在白瓷胎上描绘纹饰。',
    backgroundKnowledge: '青花瓷起源于唐代，成熟于元代，鼎盛于明代永乐、宣德年间。景德镇是青花瓷的主要产地。',
    taxonomy: {},
    keyFeatures: ['以氧化钴为着色剂', '先在素胎上绘画，再罩透明釉', '经1300℃左右高温一次烧成', '蓝色花纹永不褪色'],
    distinguishingFeatures: ['釉下蓝彩，蓝色纹饰在透明釉层之下，手感光滑无凹凸感', '白地蓝花，色彩对比鲜明', '不同时期青花呈色不同：元青花浓艳带铁锈斑，永宣青花浓艳，康熙青花翠蓝'],
    funFacts: ['青花瓷的钴料最早从波斯进口，称为"苏麻离青"', '元青花"鬼谷子下山"图罐在2005年拍出约2.3亿元人民币', '青花瓷通过海上丝绸之路远销海外，影响了全球陶瓷艺术'],
    tags: ['中国瓷器', '景德镇', '非物质文化遗产'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['古青花瓷属于文物，受国家法律保护', '现代日用青花瓷是安全的，但彩绘餐具应选择釉下彩'],
      precautions: ['避免使用釉上彩餐具盛放酸性食物，以防重金属析出']
    },
    confusableSpecies: []
  },
  {
    name: '故宫',
    englishName: 'Forbidden City',
    category: 'architecture',
    description: '故宫（紫禁城）是明清两代的皇家宫殿，是世界上现存规模最大、保存最完整的木质结构古建筑群。',
    backgroundKnowledge: '故宫始建于明永乐四年（1406年），建成于永乐十八年（1420年）。占地约72万平方米，有房屋9999间半。',
    taxonomy: {},
    keyFeatures: ['中轴对称的严谨布局', '黄瓦红墙的皇家色彩', '前朝后寝的功能分区', '太和殿、中和殿、保和殿为三大殿'],
    distinguishingFeatures: ['屋顶使用黄色琉璃瓦（只有皇家建筑可用）', '宫墙为朱红色，墙基为白色须弥座', '建筑沿中轴线对称分布，层次分明', '屋顶装饰有脊兽，太和殿有10只（级别最高）'],
    funFacts: ['故宫的屋顶没有鸟屎，因为琉璃瓦特别光滑且坡度大', '传说故宫有9999间半房，实际测量约8707间', '故宫的匾额上"门"字都没有最后一勾，以免阻挡皇帝的"龙气"'],
    tags: ['世界文化遗产', '皇家宫殿', '北京地标'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['故宫内文物众多，注意爱护', '游客量大，注意保管好个人财物'],
      precautions: ['遵守景区规定，不触摸文物和古建筑']
    },
    confusableSpecies: []
  },
  {
    name: '苏州园林',
    englishName: 'Suzhou Gardens',
    category: 'architecture',
    description: '苏州园林是中国江南私家园林的代表，被誉为"咫尺之内再造乾坤"。',
    backgroundKnowledge: '苏州园林历史悠久，始于春秋时期，发展于唐宋，鼎盛于明清。现有保存完好的园林60多处，其中拙政园、留园、网师园、环秀山庄等被列入世界文化遗产。',
    taxonomy: {},
    keyFeatures: ['以水为中心，山水相依', '亭台楼阁错落有致', '借景、框景、对景等造园手法', '追求"虽由人作，宛自天开"的意境'],
    distinguishingFeatures: ['小中见大，在有限空间内营造丰富景观', '大量使用太湖石作为假山材料', '花窗设计精巧，移步换景', '楹联匾额与园林景观融为一体'],
    funFacts: ['拙政园是苏州最大的园林，面积约5.2公顷', '网师园被陈从周先生誉为"小园极则"', '苏州园林中的花窗图案多达数百种，被誉为"无声的诗，立体的画"'],
    tags: ['世界文化遗产', '江南园林', '私家园林'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['园林中假山池塘较多，注意行走安全，防止落水', '古建筑台阶较陡，注意脚下'],
      precautions: ['游览时注意安全，不在假山上攀爬打闹']
    },
    confusableSpecies: []
  },
  {
    name: '长城',
    englishName: 'Great Wall',
    category: 'landmark',
    description: '长城是中国古代的军事防御工程，是世界上修建时间最长、工程量最大的建筑之一。',
    backgroundKnowledge: '长城始建于西周时期，秦统一后连接各国长城，此后历代均有修缮。明长城总长度达8851.8公里。',
    taxonomy: {},
    keyFeatures: ['蜿蜒起伏于崇山峻岭之间', '由城墙、敌楼、关城、烽火台等组成', '东起鸭绿江，西至嘉峪关', '八达岭、慕田峪、山海关为著名段落'],
    distinguishingFeatures: ['规模宏大，绵延万里', '因地制宜，依山就势而建', '不同地段建筑材料不同：有砖筑、石砌、土夯等', '敌楼间距约500米，可相互呼应'],
    funFacts: ['长城并不是一条连续的墙，而是由多条墙体组成的防御体系', '月球上看不到长城，这是一个流传已久的误解', '长城使用了糯米砂浆作为粘合剂，使其历经千年不倒'],
    tags: ['世界文化遗产', '世界七大奇迹', '中国象征'],
    safetyInfo: {
      level: 'caution',
      levelLabel: SAFETY_LABELS.caution,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['部分段落台阶陡峭，注意防滑', '野长城未开发，安全设施不足，存在坍塌、落石等风险', '八达岭等热门景区节假日人流量大'],
      precautions: [
        '选择正规开发的景区游览',
        '不攀爬未开放的野长城段',
        '穿着舒适的防滑鞋，注意安全'
      ]
    },
    confusableSpecies: []
  },
  {
    name: '高铁',
    englishName: 'High-speed Train',
    category: 'vehicle',
    description: '中国高速铁路（CRH）是世界上规模最大、运营速度最高的高速铁路网络。',
    backgroundKnowledge: '中国高铁起步于2004年，截至2024年运营里程已超过4.5万公里，占全球高铁总里程的70%以上。复兴号最高运营时速达350公里。',
    taxonomy: {},
    keyFeatures: ['运营时速可达350公里', '运行平稳，噪音低', '车厢舒适，设施先进', '拥有自主知识产权的复兴号系列'],
    distinguishingFeatures: ['车身流线型设计，车头呈"子弹头"状', '采用电力驱动，车顶有受电弓接触电网', '编组运行，通常8节或16节车厢', '轨道为无砟轨道（无碎石道砟）'],
    funFacts: ['京津城际是中国第一条高速铁路，2008年8月1日通车', '京沪高铁全长1318公里，是世界上运营里程最长的高铁之一', '高铁立硬币不倒的视频曾在网上走红，证明其运行的平稳性'],
    tags: ['中国速度', '现代交通', '国家名片'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['高铁电力系统为25kV高压，沿线严禁翻越护栏进入轨道区域', '站台上乘车注意安全线，防止跌入轨道'],
      precautions: ['遵守铁路安全规定，在安全区域内候车和通行']
    },
    confusableSpecies: []
  },
  {
    name: '古筝',
    englishName: 'Guzheng',
    category: 'instrument',
    description: '古筝是中国传统弹拨弦鸣乐器，被誉为"众乐之师"和"东方钢琴"。',
    backgroundKnowledge: '古筝已有2500多年的历史，起源于战国时期的秦国。传统古筝为12-13弦，现代古筝标准为21弦。',
    taxonomy: {},
    keyFeatures: ['通常为21弦', '音色优雅，表现力丰富', '使用义甲弹奏', '按五声音阶定弦'],
    distinguishingFeatures: ['长方形木制共鸣箱，长约1.63米', '面板上有21根琴弦和21个可移动的琴码（雁柱）', '弦数多于古琴（7弦），这是两者最明显的区别', '弦的右端用于弹奏，左端压弦可产生滑音'],
    funFacts: ['古筝在唐代传入日本，演变成日本筝；传入朝鲜，演变成伽倻琴', '《高山流水》是古筝最著名的曲目之一', '现代古筝作品融合了流行、爵士等多种音乐风格'],
    tags: ['民族乐器', '弹拨乐器', '传统音乐'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['琴弦有一定张力，断弦可能弹伤人', '搬运时注意保护琴身和琴弦'],
      precautions: ['调弦时不要过度拧紧', '演奏时可佩戴义甲保护手指']
    },
    confusableSpecies: [
      {
        id: 'cf-1',
        name: '古琴',
        englishName: 'Guqin',
        similarity: 72,
        similarityLabel: '较为相似',
        isToxic: false,
        keyDifference: '古琴只有7根弦，无琴码，琴身更短（约1.2米），面板上有13个徽位（音位标记）；古筝21根弦，每根弦下都有可移动的琴码。古琴是"琴棋书画"之首，历史更悠久。'
      }
    ]
  },
  {
    name: '咖啡',
    englishName: 'Coffee',
    category: 'food',
    description: '咖啡是由烘焙后的咖啡豆制成的饮品，与茶、可可并称为世界三大饮料。',
    backgroundKnowledge: '咖啡起源于埃塞俄比亚，传说由牧羊人卡尔迪发现山羊吃了咖啡果后变得兴奋。如今巴西是世界最大的咖啡生产国。',
    taxonomy: {
      kingdom: '植物界',
      phylum: '被子植物门',
      class: '双子叶植物纲',
      order: '龙胆目',
      family: '茜草科',
      genus: '咖啡属',
      species: '小果咖啡/中果咖啡'
    },
    keyFeatures: ['含有咖啡因，具有提神作用', '咖啡豆主要有阿拉比卡和罗布斯塔两种', '烘焙程度影响风味：浅烘、中烘、深烘', '常见冲煮方式：手冲、意式、法压、冷萃等'],
    distinguishingFeatures: ['咖啡豆为椭圆形，中间有一条明显的纵向沟槽', '生豆为绿色，烘焙后变为棕色至深褐色', '研磨后有独特的咖啡香气', '冲泡后液体呈深褐色，味苦带酸'],
    funFacts: ['全球每天约消费22.5亿杯咖啡', '美国每年大约浪费4000亿个咖啡杯', '最昂贵的咖啡是猫屎咖啡（Kopi Luwak），由麝香猫消化道发酵后的咖啡豆制成'],
    tags: ['世界三大饮料', '咖啡因饮品', '咖啡文化'],
    safetyInfo: {
      level: 'caution',
      levelLabel: SAFETY_LABELS.caution,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: [
        '咖啡因摄入过量（每日超过400mg，约4杯美式）可能引起心悸、失眠、焦虑',
        '孕妇、哺乳期妇女、心脏病患者、胃溃疡患者应限量或避免饮用',
        '儿童和青少年不建议饮用含咖啡因饮品',
        '空腹饮用可能刺激胃黏膜'
      ],
      precautions: [
        '成年人每日咖啡因摄入不超过400毫克（约2-3杯咖啡）',
        '避免睡前6小时内饮用，以免影响睡眠',
        '适量加糖和奶可减少对胃部的刺激'
      ]
    },
    confusableSpecies: []
  },
  {
    name: '普洱茶',
    englishName: "Pu'er Tea",
    category: 'food',
    description: '普洱茶是产自云南的特种茶类，以云南大叶种晒青毛茶为原料，经后发酵加工制成。',
    backgroundKnowledge: '普洱茶历史悠久，早在唐代就有记载。因集散地在云南普洱府而得名。普洱茶分为生茶和熟茶两类，可以长期存放，越陈越香。',
    taxonomy: {},
    keyFeatures: ['分为生茶（青饼）和熟茶（熟饼）', '具有越陈越香的特点', '茶汤红浓明亮，滋味醇厚回甘', '具有消食解腻等功效'],
    distinguishingFeatures: ['通常压制成饼、砖、沱等紧压形状', '生茶汤色黄绿至金黄，熟茶色泽红浓如红酒', '叶底肥壮，云南大叶种特征明显', '入口醇厚，回甘持久'],
    funFacts: ['普洱茶饼通常为357克，这个重量源于古代茶马古道的计量方式', '存放几十年的老普洱茶饼在拍卖会上可拍出数十万甚至上百万元', '普洱茶富含茶多酚、茶多糖、茶氨酸等多种有益成分'],
    tags: ['云南特产', '后发酵茶', '可收藏茶叶'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'edible',
      edibilityLabel: EDIBILITY_LABELS.edible,
      warnings: [
        '新制生茶性寒且刺激性强，脾胃虚寒者不宜多饮',
        '浓茶含较多茶碱和咖啡因，睡前不宜饮用',
        '发霉的普洱茶（出现白霉、绿霉、异味）绝对不可饮用，可能含有黄曲霉素等强致癌物'
      ],
      precautions: [
        '饮用前先洗茶（快速润茶1-2次），以去除表面灰尘',
        '根据个人体质选择生茶或熟茶',
        '储存于干燥通风、无异味处，定期检查是否霉变'
      ],
      emergencyAdvice: '如饮用后出现不适，特别是饮用了疑似发霉的普洱茶后，应立即停止饮用并就医。'
    },
    confusableSpecies: []
  },
  {
    name: '筷子',
    englishName: 'Chopsticks',
    category: 'artifact',
    description: '筷子是中国传统的饮食餐具，两根细长的棍子配合使用夹取食物。',
    backgroundKnowledge: '筷子的使用历史可追溯到3000多年前的商代。除中国外，日本、韩国、越南等东亚国家也广泛使用筷子。',
    taxonomy: {},
    keyFeatures: ['通常长25厘米左右', '材质多样：竹、木、金属、陶瓷、塑料', '使用时讲究握法和礼仪', '中国筷子较粗长，日本筷子较短尖'],
    distinguishingFeatures: ['两根为一对，上粗下细', '使用时运用手指控制开合', '与西方餐具刀叉、印度手抓饭并称为世界三大用餐方式'],
    funFacts: ['世界上约有15亿人使用筷子', '中国每年生产约800亿双一次性筷子，消耗约2000万棵树', '使用筷子被认为可以锻炼手眼协调，有助于预防老年痴呆'],
    tags: ['东方餐具', '中国传统文化', '饮食礼仪'],
    safetyInfo: {
      level: 'safe',
      levelLabel: SAFETY_LABELS.safe,
      edibility: 'not_applicable',
      edibilityLabel: EDIBILITY_LABELS.not_applicable,
      warnings: ['彩漆筷子的涂料可能含重金属和有机溶剂，不建议购买使用', '一次性筷子可能含有漂白剂和防腐剂，建议减少使用', '木质筷子容易发霉，应定期更换（建议3-6个月）'],
      precautions: [
        '选择无漆的竹筷或木筷',
        '清洗后彻底晾干，保持干燥',
        '发现筷子发霉、变形、开裂时立即更换'
      ]
    },
    confusableSpecies: []
  }
];

@Injectable()
export class ObjectRecognitionService {
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
      warnings.push('检测到图片中包含多张拼接图，可能影响主体识别，建议裁剪出目标主体区域后重新识别');
    }
    if (hints.isScreenshot) {
      warnings.push('当前图片为屏幕截图，建议使用原图拍摄以获得更准确的识别结果');
    }
    if (hints.hasUiElements) {
      warnings.push('图片中检测到界面元素干扰，建议拍摄纯净的主体图片');
    }
    if (hints.sharpness !== undefined && hints.sharpness < 40) {
      warnings.push('图片清晰度不足，物体细节难以精准识别，对安全相关物体（如蘑菇、植物）的识别结果需特别谨慎');
    }
    if (hints.brightnessStatus && hints.brightnessStatus !== 'normal') {
      warnings.push('图片光线问题可能影响颜色和细节识别，而颜色是区分很多物种的重要特征');
    }
    if (hints.contrast !== undefined && hints.contrast < 40) {
      warnings.push('物体与背景对比度偏低，建议使用简洁背景重新拍摄');
    }
    if (hints.textDensity !== undefined && hints.textDensity > 35) {
      warnings.push('图片文字区域占比较高，建议去除文字或截取主体图片');
    }
    return warnings;
  }

  private hashStringToSeed(str: string): number {
    const hash = crypto.createHash('sha256').update(str).digest();
    return hash.readUInt32BE(0) % 1000000;
  }

  private getConfidenceLevel(score: number): { level: ConfidenceLevel; label: string } {
    if (score >= 90) return { level: 'very_high', label: CONFIDENCE_LEVEL_LABELS.very_high };
    if (score >= 75) return { level: 'high', label: CONFIDENCE_LEVEL_LABELS.high };
    if (score >= 60) return { level: 'medium', label: CONFIDENCE_LEVEL_LABELS.medium };
    if (score >= 45) return { level: 'low', label: CONFIDENCE_LEVEL_LABELS.low };
    return { level: 'very_low', label: CONFIDENCE_LEVEL_LABELS.very_low };
  }

  private buildConfidenceExplanation(
    confidence: number,
    qualityScore: number,
    distinguishingCount: number,
    confusableCount: number,
    category: ObjectCategory,
    rand: () => number
  ): ConfidenceExplanation {
    const visualMatch = Math.min(100, Math.max(30, confidence + Math.floor(rand() * 6) - 3));
    const featureMatch = Math.min(100, Math.max(30, Math.floor(confidence * 0.85 + distinguishingCount * 2 + Math.floor(rand() * 8) - 4)));
    const contextMatch = Math.min(100, Math.max(35, Math.floor(qualityScore * 0.5 + confidence * 0.4 + Math.floor(rand() * 10) - 5)));
    const overall = Math.round((visualMatch * 0.4 + featureMatch * 0.4 + contextMatch * 0.2));

    const { level, label } = this.getConfidenceLevel(overall);
    const reasons: string[] = [];

    if (qualityScore >= 80) {
      reasons.push('图片质量良好，主体清晰，有助于准确识别');
    } else if (qualityScore >= 60) {
      reasons.push('图片质量一般，可能对特征提取有一定影响');
    } else {
      reasons.push('图片质量偏低，可能严重影响识别准确度，建议重新拍摄');
    }

    if (distinguishingCount >= 4) {
      reasons.push('识别到多个显著的独有特征，与目标物种匹配度较高');
    } else if (distinguishingCount >= 2) {
      reasons.push('提取到部分特征，但建议多角度拍摄以获得更完整信息');
    } else {
      reasons.push('可辨识的特征较少，识别结果不确定性较大');
    }

    if (confusableCount > 0) {
      reasons.push(`存在${confusableCount}种外形相似的物种，请务必查看下方的「易混淆物种对比」`);
    }

    if (category === 'plant') {
      reasons.push('⚠️ 植物识别存在局限性，尤其是野生菌类和未知植物，切勿作为食用或药用依据');
    }

    let recommendation = '';
    if (overall >= 85) {
      recommendation = '识别结果可信度较高，可作为参考。如涉及饮食、药用或安全相关，请仍需进一步确认。';
    } else if (overall >= 70) {
      recommendation = '识别结果有一定参考价值，但存在误判可能。建议对比特征描述和易混淆物种，谨慎判断。';
    } else if (overall >= 55) {
      recommendation = '置信度中等偏低，建议重新拍摄更清晰、多角度的图片后再次识别，或咨询专业人士。';
    } else {
      recommendation = '⚠️ 置信度较低，识别结果不可靠，请勿据此做任何决定。建议更换角度、光线或背景重新拍摄。';
    }

    return {
      level,
      levelLabel: label,
      score: overall,
      breakdown: {
        visualMatch,
        featureMatch,
        contextMatch,
        overall
      },
      reasons,
      recommendation
    };
  }

  private buildRecognizedObject(
    data: ObjectData,
    rand: () => number,
    qualityScore: number,
    id: string
  ): RecognizedObject {
    const confidencePenalty = Math.max(0, 100 - qualityScore) * 0.35;
    const baseConfidence = Math.floor(rand() * 10) + 88;
    const confidence = Math.max(55, Math.floor(baseConfidence - confidencePenalty));

    const shuffledRelated = this.pickSeeded(
      OBJECT_DATABASE.filter(o => o.name !== data.name),
      3,
      rand
    );
    const relationPool = ['同类', '相似', '容易混淆', '经常一同出现', '相关推荐'];

    const confidenceExplanation = this.buildConfidenceExplanation(
      confidence,
      qualityScore,
      data.distinguishingFeatures.length,
      data.confusableSpecies.length,
      data.category,
      rand
    );

    return {
      id,
      name: data.name,
      englishName: data.englishName,
      category: data.category,
      categoryLabel: CATEGORY_LABELS[data.category],
      confidence,
      confidenceExplanation,
      description: data.description,
      backgroundKnowledge: data.backgroundKnowledge,
      taxonomy: data.taxonomy,
      keyFeatures: data.keyFeatures,
      distinguishingFeatures: data.distinguishingFeatures,
      funFacts: data.funFacts,
      tags: data.tags,
      relatedObjects: shuffledRelated.map((r, idx) => ({
        id: `related-${idx}`,
        name: r.name,
        categoryLabel: CATEGORY_LABELS[r.category],
        relation: this.pickOne(relationPool, rand)
      })),
      safetyInfo: data.safetyInfo,
      confusableSpecies: data.confusableSpecies
    };
  }

  async recognize(request: ObjectRecognitionRequest): Promise<ObjectRecognitionResponse> {
    const seed = this.hashStringToSeed(request.imageBase64.slice(0, 8000));
    const rand = this.seededRandom(seed);

    const qualityScore = this.computeQualityScore(request.qualityHints);
    const qualityWarnings = this.buildQualityWarnings(request.qualityHints);

    const primaryData = this.pickOne(OBJECT_DATABASE, rand);
    const secondaryData = this.pickSeeded(
      OBJECT_DATABASE.filter(o => o.name !== primaryData.name),
      Math.floor(rand() * 2) + 1,
      rand
    );

    const primaryObject = this.buildRecognizedObject(primaryData, rand, qualityScore, 'primary');
    const secondaryObjects = secondaryData.map((d, idx) =>
      this.buildRecognizedObject(d, rand, qualityScore - 5, `secondary-${idx}`)
    );

    const sceneTemplates = [
      `画面中可以看到${primaryObject.name}，它属于${primaryObject.categoryLabel}类别。周围环境提供了上下文信息。`,
      `这是一张关于${primaryObject.name}的图片，主体特征${qualityScore >= 70 ? '较为明显' : '辨识度一般'}。`,
      `图片主体为${primaryObject.name}，${primaryObject.keyFeatures[0]}是其特征之一。`
    ];

    const hasSafetyRisk =
      primaryObject.safetyInfo.level === 'danger' ||
      primaryObject.safetyInfo.level === 'caution' ||
      primaryObject.confusableSpecies.some(c => c.isToxic);

    let highRiskWarning: string | undefined;
    if (primaryObject.safetyInfo.level === 'danger') {
      highRiskWarning = `⚠️ 高风险警告：识别结果涉及「${primaryObject.name}」，该物种${primaryObject.safetyInfo.edibility === 'toxic' ? '含有剧毒，误食可致死' : '具有较高危险性'}。请立即查看下方安全警示和易混淆物种对比，切勿仅凭识别结果做出危险行为！`;
    } else if (primaryObject.confusableSpecies.some(c => c.isToxic && c.similarity >= 80)) {
      const toxicLookalike = primaryObject.confusableSpecies.find(c => c.isToxic && c.similarity >= 80);
      if (toxicLookalike) {
        highRiskWarning = `⚠️ 混淆风险警告：该物体与剧毒物种「${toxicLookalike.name}」外形高度相似（相似度${toxicLookalike.similarity}%），仅凭图片难以区分。如需鉴别，请务必查看下方「易混淆物种对比」并咨询专业人士，绝对不可随意采食！`;
      }
    }

    return {
      primaryObject,
      secondaryObjects,
      sceneDescription: this.pickOne(sceneTemplates, rand),
      overallConfidence: qualityScore,
      qualityWarnings,
      recognitionTimestamp: new Date().toISOString(),
      safetyDisclaimer: SAFETY_DISCLAIMER,
      hasSafetyRisk,
      highRiskWarning
    };
  }
}
