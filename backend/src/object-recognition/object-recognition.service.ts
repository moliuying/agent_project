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
  funFacts: string[];
  relatedObjects: {
    id: string;
    name: string;
    categoryLabel: string;
    relation: string;
  }[];
  tags: string[];
}

export interface ObjectRecognitionResponse {
  primaryObject: RecognizedObject;
  secondaryObjects: RecognizedObject[];
  sceneDescription: string;
  overallConfidence: number;
  qualityWarnings: string[];
  recognitionTimestamp: string;
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

const OBJECT_DATABASE: {
  name: string;
  englishName: string;
  category: ObjectCategory;
  description: string;
  backgroundKnowledge: string;
  taxonomy: RecognizedObject['taxonomy'];
  keyFeatures: string[];
  funFacts: string[];
  tags: string[];
}[] = [
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
    funFacts: ['向日葵的种子排列遵循斐波那契数列', '一株向日葵可产1000-2000颗种子', '梵高的《向日葵》系列画作使其闻名于世'],
    tags: ['观赏植物', '油料作物', '一年生草本']
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
    funFacts: ['银杏树是成都市的市树', '银杏叶提取物被广泛用于保健品', '广岛原子弹爆炸后，银杏树是最先恢复发芽的树种之一'],
    tags: ['活化石', '落叶乔木', '药用植物']
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
    funFacts: ['全球每年约生产40亿朵玫瑰', '玫瑰精油是世界上最昂贵的精油之一，1公斤需要约500万朵花瓣', '玫瑰是多个国家的国花，包括英国、美国、卢森堡等'],
    tags: ['观赏花卉', '香料植物', '象征爱情']
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
    funFacts: ['猫一天约睡12-16小时', '猫的鼻纹和人类指纹一样，每只猫都是独一无二的', '猫可以发出超过100种声音，而狗只能发出约10种'],
    tags: ['宠物', '哺乳动物', '夜行性动物']
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
    funFacts: ['大熊猫每天要吃12-38公斤竹子，花12-16小时进食', '大熊猫幼崽出生时体重只有母亲的1/900，约100-200克', '大熊猫是世界自然基金会(WWF)的标志'],
    tags: ['国宝', '珍稀动物', '中国特有']
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
    funFacts: ['孔雀羽毛上的"眼睛"斑纹是为了迷惑捕食者', '孔雀是印度的国鸟', '孔雀羽毛的颜色不是色素，而是结构色，由光的干涉产生'],
    tags: ['观赏鸟类', '雉科', '开屏求偶']
  },
  {
    name: '北京烤鸭',
    englishName: 'Peking Duck',
    category: 'food',
    description: '北京烤鸭是北京著名的传统名菜，被誉为"天下第一美味"。',
    backgroundKnowledge: '北京烤鸭的历史可以追溯到南北朝时期，真正成为宫廷御膳是在明朝。如今，全聚德和便宜坊是北京最著名的烤鸭店。',
    taxonomy: {},
    keyFeatures: ['外皮红润油亮，酥脆可口', '肉质细嫩多汁', '配薄饼、葱丝、甜面酱食用', '通常片皮后上桌'],
    funFacts: ['正宗的北京烤鸭选用北京填鸭，喂养45天左右', '烤鸭有挂炉和焖炉两大流派', '吃烤鸭讲究"一鸭三吃"：鸭皮、鸭肉、鸭架汤'],
    tags: ['北京名菜', '宫廷菜', '国宴菜品']
  },
  {
    name: '小笼包',
    englishName: 'Soup Dumpling (Xiaolongbao)',
    category: 'food',
    description: '小笼包是源自江苏常州的传统小吃，以皮薄馅大、汤汁丰富而闻名。',
    backgroundKnowledge: '小笼包起源于清代道光年间的常州府，后发展出上海南翔小笼、无锡小笼等多个流派。',
    taxonomy: {},
    keyFeatures: ['皮薄如纸，呈半透明状', '内馅含丰富汤汁', '通常18-22个褶', '配姜丝和醋食用'],
    funFacts: ['吃小笼包有口诀："轻轻提，慢慢移，先开窗，后喝汤"', '正宗小笼包用猪皮冻做馅，蒸制后融化成汤', '上海南翔小笼被评为国家级非物质文化遗产'],
    tags: ['江南小吃', '面点', '汤汁丰富']
  },
  {
    name: '兵马俑',
    englishName: 'Terracotta Army',
    category: 'artifact',
    description: '兵马俑是秦始皇陵的陪葬坑陶俑，被誉为"世界第八大奇迹"。',
    backgroundKnowledge: '兵马俑始建于公元前246年至前208年，1974年被陕西农民意外发现。已发掘的三个坑共出土陶俑陶马8000余件。',
    taxonomy: {},
    keyFeatures: ['每个陶俑面容各异，千人千面', '按身份分为将军俑、军吏俑、武士俑等', '原本通体彩绘，出土后逐渐氧化褪色', '规模宏大，排列整齐'],
    funFacts: ['兵马俑是世界上规模最大的地下军事博物馆', '每个陶俑的耳朵都不一样，如同指纹', '兵马俑手中的武器是真实的青铜兵器，部分仍锋利如新'],
    tags: ['世界文化遗产', '秦代文物', '西安旅游']
  },
  {
    name: '青花瓷',
    englishName: 'Blue and White Porcelain',
    category: 'artifact',
    description: '青花瓷是中国传统瓷器的代表，以含钴的蓝色颜料在白瓷胎上描绘纹饰。',
    backgroundKnowledge: '青花瓷起源于唐代，成熟于元代，鼎盛于明代永乐、宣德年间。景德镇是青花瓷的主要产地。',
    taxonomy: {},
    keyFeatures: ['以氧化钴为着色剂', '先在素胎上绘画，再罩透明釉', '经1300℃左右高温一次烧成', '蓝色花纹永不褪色'],
    funFacts: ['青花瓷的钴料最早从波斯进口，称为"苏麻离青"', '元青花"鬼谷子下山"图罐在2005年拍出约2.3亿元人民币', '青花瓷通过海上丝绸之路远销海外，影响了全球陶瓷艺术'],
    tags: ['中国瓷器', '景德镇', '非物质文化遗产']
  },
  {
    name: '故宫',
    englishName: 'Forbidden City',
    category: 'architecture',
    description: '故宫（紫禁城）是明清两代的皇家宫殿，是世界上现存规模最大、保存最完整的木质结构古建筑群。',
    backgroundKnowledge: '故宫始建于明永乐四年（1406年），建成于永乐十八年（1420年）。占地约72万平方米，有房屋9999间半。',
    taxonomy: {},
    keyFeatures: ['中轴对称的严谨布局', '黄瓦红墙的皇家色彩', '前朝后寝的功能分区', '太和殿、中和殿、保和殿为三大殿'],
    funFacts: ['故宫的屋顶没有鸟屎，因为琉璃瓦特别光滑且坡度大', '传说故宫有9999间半房，实际测量约8707间', '故宫的匾额上"门"字都没有最后一勾，以免阻挡皇帝的"龙气"'],
    tags: ['世界文化遗产', '皇家宫殿', '北京地标']
  },
  {
    name: '苏州园林',
    englishName: 'Suzhou Gardens',
    category: 'architecture',
    description: '苏州园林是中国江南私家园林的代表，被誉为"咫尺之内再造乾坤"。',
    backgroundKnowledge: '苏州园林历史悠久，始于春秋时期，发展于唐宋，鼎盛于明清。现有保存完好的园林60多处，其中拙政园、留园、网师园、环秀山庄等被列入世界文化遗产。',
    taxonomy: {},
    keyFeatures: ['以水为中心，山水相依', '亭台楼阁错落有致', '借景、框景、对景等造园手法', '追求"虽由人作，宛自天开"的意境'],
    funFacts: ['拙政园是苏州最大的园林，面积约5.2公顷', '网师园被陈从周先生誉为"小园极则"', '苏州园林中的花窗图案多达数百种，被誉为"无声的诗，立体的画"'],
    tags: ['世界文化遗产', '江南园林', '私家园林']
  },
  {
    name: '长城',
    englishName: 'Great Wall',
    category: 'landmark',
    description: '长城是中国古代的军事防御工程，是世界上修建时间最长、工程量最大的建筑之一。',
    backgroundKnowledge: '长城始建于西周时期，秦统一后连接各国长城，此后历代均有修缮。明长城总长度达8851.8公里。',
    taxonomy: {},
    keyFeatures: ['蜿蜒起伏于崇山峻岭之间', '由城墙、敌楼、关城、烽火台等组成', '东起鸭绿江，西至嘉峪关', '八达岭、慕田峪、山海关为著名段落'],
    funFacts: ['长城并不是一条连续的墙，而是由多条墙体组成的防御体系', '月球上看不到长城，这是一个流传已久的误解', '长城使用了糯米砂浆作为粘合剂，使其历经千年不倒'],
    tags: ['世界文化遗产', '世界七大奇迹', '中国象征']
  },
  {
    name: '高铁',
    englishName: 'High-speed Train',
    category: 'vehicle',
    description: '中国高速铁路（CRH）是世界上规模最大、运营速度最高的高速铁路网络。',
    backgroundKnowledge: '中国高铁起步于2004年，截至2024年运营里程已超过4.5万公里，占全球高铁总里程的70%以上。复兴号最高运营时速达350公里。',
    taxonomy: {},
    keyFeatures: ['运营时速可达350公里', '运行平稳，噪音低', '车厢舒适，设施先进', '拥有自主知识产权的复兴号系列'],
    funFacts: ['京津城际是中国第一条高速铁路，2008年8月1日通车', '京沪高铁全长1318公里，是世界上运营里程最长的高铁之一', '高铁立硬币不倒的视频曾在网上走红，证明其运行的平稳性'],
    tags: ['中国速度', '现代交通', '国家名片']
  },
  {
    name: '古筝',
    englishName: 'Guzheng',
    category: 'instrument',
    description: '古筝是中国传统弹拨弦鸣乐器，被誉为"众乐之师"和"东方钢琴"。',
    backgroundKnowledge: '古筝已有2500多年的历史，起源于战国时期的秦国。传统古筝为12-13弦，现代古筝标准为21弦。',
    taxonomy: {},
    keyFeatures: ['通常为21弦', '音色优雅，表现力丰富', '使用义甲弹奏', '按五声音阶定弦'],
    funFacts: ['古筝在唐代传入日本，演变成日本筝；传入朝鲜，演变成伽倻琴', '《高山流水》是古筝最著名的曲目之一', '现代古筝作品融合了流行、爵士等多种音乐风格'],
    tags: ['民族乐器', '弹拨乐器', '传统音乐']
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
    funFacts: ['全球每天约消费22.5亿杯咖啡', '美国每年大约浪费4000亿个咖啡杯', '最昂贵的咖啡是猫屎咖啡（Kopi Luwak），由麝香猫消化道发酵后的咖啡豆制成'],
    tags: ['世界三大饮料', '咖啡因饮品', '咖啡文化']
  },
  {
    name: '普洱茶',
    englishName: 'Pu\'er Tea',
    category: 'food',
    description: '普洱茶是产自云南的特种茶类，以云南大叶种晒青毛茶为原料，经后发酵加工制成。',
    backgroundKnowledge: '普洱茶历史悠久，早在唐代就有记载。因集散地在云南普洱府而得名。普洱茶分为生茶和熟茶两类，可以长期存放，越陈越香。',
    taxonomy: {},
    keyFeatures: ['分为生茶（青饼）和熟茶（熟饼）', '具有越陈越香的特点', '茶汤红浓明亮，滋味醇厚回甘', '具有消食解腻等功效'],
    funFacts: ['普洱茶饼通常为357克，这个重量源于古代茶马古道的计量方式', '存放几十年的老普洱茶饼在拍卖会上可拍出数十万甚至上百万元', '普洱茶富含茶多酚、茶多糖、茶氨酸等多种有益成分'],
    tags: ['云南特产', '后发酵茶', '可收藏茶叶']
  },
  {
    name: '筷子',
    englishName: 'Chopsticks',
    category: 'artifact',
    description: '筷子是中国传统的饮食餐具，两根细长的棍子配合使用夹取食物。',
    backgroundKnowledge: '筷子的使用历史可追溯到3000多年前的商代。除中国外，日本、韩国、越南等东亚国家也广泛使用筷子。',
    taxonomy: {},
    keyFeatures: ['通常长25厘米左右', '材质多样：竹、木、金属、陶瓷、塑料', '使用时讲究握法和礼仪', '中国筷子较粗长，日本筷子较短尖'],
    funFacts: ['世界上约有15亿人使用筷子', '中国每年生产约800亿双一次性筷子，消耗约2000万棵树', '使用筷子被认为可以锻炼手眼协调，有助于预防老年痴呆'],
    tags: ['东方餐具', '中国传统文化', '饮食礼仪']
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
      warnings.push('图片清晰度不足，物体细节难以精准识别');
    }
    if (hints.brightnessStatus && hints.brightnessStatus !== 'normal') {
      warnings.push('图片光线问题可能影响颜色和细节识别');
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

  private buildRecognizedObject(
    data: typeof OBJECT_DATABASE[0],
    rand: () => number,
    qualityScore: number,
    id: string
  ): RecognizedObject {
    const confidencePenalty = Math.max(0, 100 - qualityScore) * 0.35;
    const baseConfidence = Math.floor(rand() * 10) + 88;
    const shuffledRelated = this.pickSeeded(
      OBJECT_DATABASE.filter(o => o.name !== data.name),
      3,
      rand
    );

    const relationPool = ['同类', '相似', '容易混淆', '经常一同出现', '相关推荐'];

    return {
      id,
      name: data.name,
      englishName: data.englishName,
      category: data.category,
      categoryLabel: CATEGORY_LABELS[data.category],
      confidence: Math.max(55, Math.floor(baseConfidence - confidencePenalty)),
      description: data.description,
      backgroundKnowledge: data.backgroundKnowledge,
      taxonomy: data.taxonomy,
      keyFeatures: data.keyFeatures,
      funFacts: data.funFacts,
      tags: data.tags,
      relatedObjects: shuffledRelated.map((r, idx) => ({
        id: `related-${idx}`,
        name: r.name,
        categoryLabel: CATEGORY_LABELS[r.category],
        relation: this.pickOne(relationPool, rand)
      }))
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
      `画面中可以清晰看到${primaryObject.name}，它属于${primaryObject.categoryLabel}类别。周围环境提供了丰富的上下文信息。`,
      `这是一张关于${primaryObject.name}的图片，拍摄角度良好，主体特征明显。整体画面和谐自然。`,
      `图片主体为${primaryObject.name}，${primaryObject.keyFeatures[0]}是其最显著的特征。背景起到了很好的衬托作用。`
    ];

    return {
      primaryObject,
      secondaryObjects,
      sceneDescription: this.pickOne(sceneTemplates, rand),
      overallConfidence: qualityScore,
      qualityWarnings,
      recognitionTimestamp: new Date().toISOString()
    };
  }
}
