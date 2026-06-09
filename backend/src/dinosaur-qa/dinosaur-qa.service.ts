import { Injectable } from '@nestjs/common';

export type KnowledgeConfidence = 'consensus' | 'mainstream' | 'controversial' | 'hypothesis';

export const CONFIDENCE_LABEL: Record<KnowledgeConfidence, string> = {
  consensus: '学术共识',
  mainstream: '主流观点',
  controversial: '存在争议',
  hypothesis: '研究假说',
};

export const CONFIDENCE_COLOR: Record<KnowledgeConfidence, string> = {
  consensus: '#67c23a',
  mainstream: '#165DFF',
  controversial: '#e6a23c',
  hypothesis: '#f56c6c',
};

export const CONFIDENCE_DESCRIPTION: Record<KnowledgeConfidence, string> = {
  consensus: '已被绝大多数古生物学家认可的确定性结论',
  mainstream: '多数研究者支持，但仍存在少量不同意见',
  controversial: '学界存在明显分歧，尚无定论',
  hypothesis: '基于有限证据提出的研究假说，有待进一步验证',
};

export interface ResearchCitation {
  year: string;
  researcher?: string;
  institution?: string;
  study?: string;
  note?: string;
}

export interface CredibilityInfo {
  confidence: KnowledgeConfidence;
  lastUpdated: string;
  citations: ResearchCitation[];
  caveats?: string[];
}

export interface DinosaurQaMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  relatedFacts?: DinosaurFact[];
  credibility?: CredibilityInfo;
}

export interface DinosaurFact {
  title: string;
  content: string;
  category: string;
  confidence?: KnowledgeConfidence;
}

export interface DinosaurQaState {
  messages: DinosaurQaMessage[];
  round: number;
}

export interface DinosaurInfo {
  name: string;
  nameEn: string;
  pronunciation?: string;
  period: string;
  diet: '肉食' | '植食' | '杂食';
  length: string;
  weight: string;
  height?: string;
  location: string;
  taxonomy: string;
  description: string;
  features: string[];
  funFacts: string[];
  imageHint?: string;
  confidence: KnowledgeConfidence;
  lastUpdated: string;
  citations: ResearchCitation[];
}

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  category: string;
  relatedDinosaurs?: string[];
  confidence: KnowledgeConfidence;
  lastUpdated: string;
  citations: ResearchCitation[];
  caveats?: string[];
}

const DINOSAUR_DATABASE: DinosaurInfo[] = [
  {
    name: '霸王龙',
    nameEn: 'Tyrannosaurus Rex',
    pronunciation: 'bà wáng lóng',
    period: '白垩纪晚期（约 6800-6600 万年前）',
    diet: '肉食',
    length: '约 12-13 米',
    weight: '约 6-9 吨',
    height: '约 4-6 米（臀部高约 3.5-4 米）',
    location: '北美洲西部',
    taxonomy: '蜥臀目 · 兽脚亚目 · 暴龙科',
    description: '霸王龙是有史以来最著名的肉食恐龙之一，也是白垩纪晚期北美洲最顶级的掠食者。它拥有陆地动物史上最强的咬合力，可达约 3.5-6.4 万牛顿。',
    features: [
      '巨大的头颅骨，长达约 1.5 米',
      '强壮的下颌和香蕉大小的锋利牙齿，最长可达 30 厘米',
      '两条极其强壮的后肢',
      '相对很小的前肢，只有两根手指',
      '长而重的尾巴用于平衡身体',
    ],
    funFacts: [
      '霸王龙的咬合力是现代狮子的约 10-15 倍，可以轻松咬碎骨头',
      '最新研究表明，霸王龙的视力其实非常好，甚至比现代鹰类还要敏锐，并非电影中描述的"视力差"',
      '霸王龙的嗅觉极其发达，可以闻到数公里外的腐肉',
      '幼年霸王龙身上可能长有羽毛，成年后才逐渐脱落',
    ],
    confidence: 'consensus',
    lastUpdated: '2024-03',
    citations: [
      { year: '2017', researcher: 'G.M. Erickson 等', institution: '佛罗里达州立大学', study: '霸王龙咬合力生物力学分析' },
      { year: '2006', researcher: 'K.A. Stevens', institution: '俄勒冈大学', study: '霸王龙视觉敏锐度模型研究' },
      { year: '2008', researcher: 'D.T. Ksepka 等', study: '暴龙类嗅觉系统化石分析' },
    ],
  },
  {
    name: '三角龙',
    nameEn: 'Triceratops',
    pronunciation: 'sān jiǎo lóng',
    period: '白垩纪晚期（约 6800-6600 万年前）',
    diet: '植食',
    length: '约 7-9 米',
    weight: '约 6-12 吨',
    height: '约 2.5-3 米',
    location: '北美洲西部',
    taxonomy: '鸟臀目 · 角龙科',
    description: '三角龙是最著名的角龙类恐龙，以其头部三根巨大的角和骨质颈盾著称。它是白垩纪末期最常见的大型植食恐龙之一，与霸王龙生活在同一时代和地区。',
    features: [
      '三根角：两根眉骨上的长角（可达 1 米以上）和一根鼻子上的短角',
      '巨大的骨质颈盾，边缘可能有骨质突起',
      '鹦鹉状的喙嘴，用来切割植物',
      '强壮的四肢，像大象一样支撑庞大身躯',
    ],
    funFacts: [
      '三角龙的头骨是所有陆地动物中最大的之一，可长达 2.5 米',
      '三角龙的颈盾并非完全用于防御，可能还具有求偶展示和体温调节的功能',
      '三角龙可能是群居动物，以群体方式抵御掠食者',
      '它是霸王龙的主要猎物之一，但三角龙也能用角进行有力反击',
    ],
    confidence: 'consensus',
    lastUpdated: '2024-01',
    citations: [
      { year: '2009', researcher: 'A.A. Farke 等', study: '角龙类颈盾功能形态学分析' },
      { year: '2012', researcher: 'S. Sampson 等', study: '角龙类社会行为研究' },
    ],
  },
  {
    name: '腕龙',
    nameEn: 'Brachiosaurus',
    pronunciation: 'wàn lóng',
    period: '侏罗纪晚期（约 1.54-1.53 亿年前）',
    diet: '植食',
    length: '约 18-21 米',
    weight: '约 30-60 吨',
    height: '约 12-16 米',
    location: '北美洲西部（莫里森组）',
    taxonomy: '蜥臀目 · 蜥脚亚目 · 腕龙科',
    description: '腕龙是侏罗纪最具代表性的巨型蜥脚类恐龙之一，其前肢明显长于后肢，身体呈倾斜姿态，高高抬起的头部可以触及高大树木的顶端。',
    features: [
      '极长的脖子，由 13 节颈椎组成',
      '前肢比后肢长，这是它名称的由来（"手臂蜥蜴"）',
      '头部相对较小，鼻孔位于头顶隆起处',
      '长尾巴相对较短，不如其他蜥脚类那样长',
      '四肢粗壮如柱，支撑巨大体重',
    ],
    funFacts: [
      '腕龙的鼻孔位于头顶，曾被误认为生活在水中，其实它是完全陆生的',
      '一只成年腕龙每天可能需要吃掉约 180-400 公斤的植物',
      '它的心脏必须非常强大才能把血液泵到十几米高的头部',
      '腕龙是电影《侏罗纪公园》中第一个出场的恐龙，给观众留下了深刻印象',
    ],
    confidence: 'mainstream',
    lastUpdated: '2023-11',
    citations: [
      { year: '2016', researcher: 'D.M. Henderson', study: '蜥脚类恐龙浮力与水生习性再评估', note: '纠正了腕龙水生的传统观点' },
      { year: '2019', researcher: 'J.A. Whitlock 等', study: '莫里森组蜥脚类食性分析' },
    ],
  },
  {
    name: '迅猛龙',
    nameEn: 'Velociraptor',
    pronunciation: 'xùn měng lóng',
    period: '白垩纪晚期（约 7500-7100 万年前）',
    diet: '肉食',
    length: '约 1.5-2 米',
    weight: '约 15-20 公斤',
    height: '约 0.5 米（臀部高度）',
    location: '中亚（蒙古、中国）',
    taxonomy: '蜥臀目 · 兽脚亚目 · 驰龙科',
    description: '迅猛龙是一种小型但极其敏捷的肉食恐龙，以其第二脚趾上的镰刀状巨爪闻名。与电影《侏罗纪公园》中展示的不同，真实的迅猛龙体型比火鸡大不了多少。',
    features: [
      '后脚第二脚趾上长有约 6.5 厘米长的镰刀状利爪，是主要武器',
      '全身覆盖羽毛，这已被化石证据确认',
      '细长的尾巴由骨棒加固，保持平衡',
      '相对较大的大脑，具有较高的智力',
      '前肢长有三爪，类似现代鸟类的翅膀',
    ],
    funFacts: [
      '电影《侏罗纪公园》中的"迅猛龙"其实更接近它的近亲恐爪龙（Deinonychus），体型更大',
      '已发现的"搏斗中的恐龙"化石显示，迅猛龙正用巨爪攻击原角龙的腹部',
      '迅猛龙可能是昼行性动物，视力很好',
      '它的学名 Velociraptor 意为"敏捷的盗贼"',
    ],
    confidence: 'consensus',
    lastUpdated: '2024-02',
    citations: [
      { year: '2007', researcher: 'A.H. Turner 等', study: '伶盗龙羽茎瘤化石发现，直接证明羽毛存在' },
      { year: '1971', researcher: '波兰-蒙古联合考察队', study: '"搏斗中的恐龙"化石（Velociraptor vs Protoceratops）' },
      { year: '1969', researcher: 'J.H. Ostrom', study: '恐爪龙（Deinonychus）描述，重新定义驰龙科' },
    ],
  },
  {
    name: '剑龙',
    nameEn: 'Stegosaurus',
    pronunciation: 'jiàn lóng',
    period: '侏罗纪晚期（约 1.55-1.5 亿年前）',
    diet: '植食',
    length: '约 6-9 米',
    weight: '约 3-7 吨',
    height: '约 3-4 米（含骨板）',
    location: '北美洲西部（莫里森组）、欧洲、印度',
    taxonomy: '鸟臀目 · 剑龙亚目 · 剑龙科',
    description: '剑龙是最容易辨认的恐龙之一，背部有两排三角形的巨大骨板，尾部还有四根尖刺。它是侏罗纪晚期常见的植食恐龙。',
    features: [
      '背部两排共 17-22 块三角形骨质板，最大的骨板可高达 60 厘米',
      '尾巴末端有四根（有时更多）约 60-90 厘米长的尖刺，称为"尾锤刺"',
      '头部极小，大脑只有核桃大小',
      '前肢短，后肢长，身体呈前倾姿态',
      '双腭牙齿小而弱，只能吃柔软的低植被',
    ],
    funFacts: [
      '剑龙的骨板用途至今仍有争议，可能用于展示、体温调节或防御',
      '它的大脑重量仅约 70 克，是所有恐龙中相对体型最小的之一',
      '曾有人认为剑龙臀部有"第二大脑"，现已证实这只是神经节',
      '剑龙是奥塞内尔·查利斯·马什 1877 年命名的，意为"屋顶蜥蜴"',
    ],
    confidence: 'controversial',
    lastUpdated: '2024-01',
    citations: [
      { year: '1887', researcher: 'O.C. Marsh', study: '剑龙命名与初步描述' },
      { year: '2005', researcher: 'K. Carpenter 等', study: '剑龙骨板形态与功能再分析', note: '骨板功能仍存在多种假说' },
      { year: '2018', researcher: 'E. Hoffman 等', study: '剑龙尾部攻击痕迹的化石证据' },
    ],
  },
  {
    name: '梁龙',
    nameEn: 'Diplodocus',
    pronunciation: 'liáng lóng',
    period: '侏罗纪晚期（约 1.54-1.5 亿年前）',
    diet: '植食',
    length: '约 25-30 米',
    weight: '约 10-16 吨',
    height: '约 4-5 米',
    location: '北美洲西部（莫里森组）',
    taxonomy: '蜥臀目 · 蜥脚亚目 · 梁龙科',
    description: '梁龙是已知最长的恐龙之一，以其极长的尾巴和脖子著称。它的身体结构独特，尾巴由约 80 节尾椎组成，像一条巨大的鞭子。',
    features: [
      '极长的脖子，由 15 节颈椎组成',
      '超长的尾巴，约占体长的一半，可作为防御武器',
      '柱状的四肢，前肢略短于后肢',
      '头部小而细长，鼻孔位于头顶',
      '牙齿呈铅笔状，只长在嘴的前部',
    ],
    funFacts: [
      '梁龙的尾巴可能可以像鞭子一样高速挥动，发出超过 200 分贝的声音',
      '它可能用长脖子横扫大片植物进食，而不必经常移动庞大身躯',
      '梁龙的体长可以超过 30 米，但体重相对较轻（和腕龙比）',
      '它是第一个被完整装架展示的大型蜥脚类恐龙（1905 年，卡内基博物馆）',
    ],
    confidence: 'mainstream',
    lastUpdated: '2023-10',
    citations: [
      { year: '1997', researcher: 'P.J. Currie 等', study: '蜥脚类尾巴动力学分析' },
      { year: '1878', researcher: 'O.C. Marsh', study: '梁龙命名与描述' },
    ],
  },
  {
    name: '翼龙',
    nameEn: 'Pterosaur',
    pronunciation: 'yì lóng',
    period: '三叠纪晚期至白垩纪末期（约 2.28 亿-6600 万年前）',
    diet: '杂食',
    length: '从小如麻雀到翼展超过 10 米',
    weight: '因物种差异极大',
    location: '全球分布',
    taxonomy: '翼龙目（非恐龙，属于主龙类）',
    description: '翼龙是第一群会飞的脊椎动物，与恐龙生活在同一时代，但它们并不是恐龙，而是恐龙的近亲，同属于主龙类演化支。',
    features: [
      '由延长的第四指支撑的翼膜，形成翅膀',
      '翼膜由皮肤、肌肉和其他组织构成',
      '中空的骨骼，极轻以适应飞行',
      '相对较大的脑，具有复杂的飞行控制能力',
      '许多种类头部有奇特的冠饰',
    ],
    funFacts: [
      '重要：翼龙不是恐龙！恐龙的定义是"三角龙和现代鸟类的最近共同祖先及其所有后代"，翼龙不在这个范围内',
      '最大的翼龙如风神翼龙（Quetzalcoatlus）翼展可达 10-11 米，堪比小型飞机',
      '已知最小的翼龙如隐居森林翼龙（Nemicolopterus）翼展仅约 25 厘米',
      '翼龙可能有毛发（温血特征），有些可能甚至会游泳',
      '它们在白垩纪末期与恐龙一起灭绝',
    ],
    confidence: 'consensus',
    lastUpdated: '2024-03',
    citations: [
      { year: '2008', researcher: 'A.W.A. Kellner 等', study: '翼龙系统发育与分类学修订' },
      { year: '2010', researcher: 'D.M. Unwin', study: '翼龙演化与古生物学综合研究' },
      { year: '2022', researcher: 'K. Padian 等', study: '风神翼龙生态位再评估' },
    ],
  },
  {
    name: '始祖鸟',
    nameEn: 'Archaeopteryx',
    pronunciation: 'shǐ zǔ niǎo',
    period: '侏罗纪晚期（约 1.5 亿年前）',
    diet: '肉食',
    length: '约 0.5 米',
    weight: '约 0.8-1 公斤',
    location: '欧洲（德国巴伐利亚）',
    taxonomy: '蜥臀目 · 兽脚亚目 · 近鸟类（有时被归入鸟类）',
    description: '始祖鸟是最著名的"过渡型化石"之一，兼具恐龙和鸟类的特征，被认为是恐龙向鸟类演化的关键证据。',
    features: [
      '拥有现代鸟类的羽毛和翅膀',
      '保留了恐龙的特征：牙齿、爪子、长尾椎骨',
      '翅膀上有三根带爪的手指',
      '体型类似现代乌鸦',
      '胸骨不发达，可能只能滑翔而非持续飞行',
    ],
    funFacts: [
      '第一具始祖鸟化石发现于 1861 年，恰好在达尔文《物种起源》发表两年后，成为进化论的关键证据',
      '它的名字 Archaeopteryx 意为"古老的翅膀"',
      '始祖鸟可能不是现代鸟类的直接祖先，而是演化的一个旁支',
      '已发现的始祖鸟化石极其稀少，全世界仅有约 12 件标本',
    ],
    confidence: 'mainstream',
    lastUpdated: '2024-02',
    citations: [
      { year: '1861', researcher: 'H. von Meyer', study: '始祖鸟首次描述与命名' },
      { year: '2011', researcher: 'G. Mayr 等', study: '始祖鸟羽毛与体色复原研究' },
      { year: '2018', researcher: 'M. Kundrát 等', study: '始祖鸟脑颅扫描与飞行能力分析' },
    ],
  },
  {
    name: '棘龙',
    nameEn: 'Spinosaurus',
    pronunciation: 'jí lóng',
    period: '白垩纪中期至晚期（约 1.12-9350 万年前）',
    diet: '肉食',
    length: '约 15-18 米',
    weight: '约 7-20 吨',
    location: '北非（摩洛哥、埃及）',
    taxonomy: '蜥臀目 · 兽脚亚目 · 棘龙科',
    description: '棘龙是已知最大的肉食恐龙之一，甚至可能超过霸王龙。它最显著的特征是背部巨大的"帆"状结构，由神经棘支撑。最新研究表明它可能是半水生的。',
    features: [
      '背部由延长神经棘支撑的巨大"帆"，可高达 1.8 米',
      '鳄鱼般细长的吻部和锥形牙齿，适合捕鱼',
      '可能是半水生动物，后肢较短，适应水中生活',
      '前肢较大，可能在水中划行',
      '鼻孔位于头骨较后的位置，便于在水中呼吸',
    ],
    funFacts: [
      '棘龙是目前已知唯一可能半水生的大型肉食恐龙',
      '2020 年新化石研究显示，棘龙可能用尾巴在水中游泳推进，类似鳄鱼',
      '它的"背帆"用途可能包括体温调节、求偶展示或物种识别',
      '在电影《侏罗纪公园 III》中，棘龙被描绘为击败了霸王龙，但真实情况中两者生存年代和地域都不同',
    ],
    confidence: 'controversial',
    lastUpdated: '2024-03',
    citations: [
      { year: '1915', researcher: 'E. Stromer', study: '埃及棘龙首次描述', note: '原始化石在二战中被毁' },
      { year: '2014', researcher: 'N. Ibrahim 等', study: '棘龙新标本与半水生习性假说' },
      { year: '2020', researcher: 'N. Ibrahim 等', study: '棘龙尾部形态与水生推进功能', note: '该结论仍存在激烈学术争议' },
      { year: '2023', researcher: 'K. Padian 等', study: '棘龙生态位质疑，认为更可能为近岸而非全水生' },
    ],
  },
  {
    name: '甲龙',
    nameEn: 'Ankylosaurus',
    pronunciation: 'jiǎ lóng',
    period: '白垩纪晚期（约 6800-6600 万年前）',
    diet: '植食',
    length: '约 6-8 米',
    weight: '约 4-8 吨',
    height: '约 1.5 米（臀部高度）',
    location: '北美洲西部',
    taxonomy: '鸟臀目 · 甲龙科',
    description: '甲龙被称为"恐龙中的坦克"，全身覆盖厚重的骨质甲板，尾部末端还有一个巨大的尾锤，是最强防御的植食恐龙。',
    features: [
      '全身覆盖由骨头构成的甲板（皮内成骨），包括眼睑上也有骨甲',
      '尾部末端有一个由多块骨头融合而成的巨大尾锤，重达数十公斤',
      '低矮宽阔的身体，贴近地面以保护腹部',
      '头部宽而短，包裹在骨质头盔中',
      '嘴部有角质喙，牙齿弱小，只能吃软植物',
    ],
    funFacts: [
      '甲龙的尾锤可以产生巨大力量，可能足以击碎霸王龙的骨头',
      '它的身体装甲包括尖刺和凸起，甚至连眼皮上都有骨片保护',
      '甲龙腹部没有装甲，是它唯一的弱点',
      '它是最后灭绝的恐龙之一，存活到了白垩纪最末期',
    ],
    confidence: 'consensus',
    lastUpdated: '2023-12',
    citations: [
      { year: '2008', researcher: 'V. Arbour 等', study: '甲龙科尾锤生物力学分析' },
      { year: '1908', researcher: 'B. Brown', study: '甲龙属命名与描述' },
    ],
  },
  {
    name: '副栉龙',
    nameEn: 'Parasaurolophus',
    pronunciation: 'fù zhì lóng',
    period: '白垩纪晚期（约 7600-7300 万年前）',
    diet: '植食',
    length: '约 9-10 米',
    weight: '约 2.5-3.5 吨',
    height: '约 3 米（臀部高度）',
    location: '北美洲西部',
    taxonomy: '鸟臀目 · 鸟脚亚目 · 鸭嘴龙科',
    description: '副栉龙是鸭嘴龙类的代表，以其头上那根长长的管状冠饰闻名。这根冠饰内有复杂的鼻道，可能用于发声交流。',
    features: [
      '头顶向后延伸的长管状冠饰，最长可达 1.8 米，内部有弯曲的鼻道',
      '鸭嘴状的喙嘴，嘴内有数百颗牙齿，形成齿板',
      '通常两足行走，也可四足行走',
      '可能具有复杂的社会行为',
      '善于奔跑，后肢强壮',
    ],
    funFacts: [
      '副栉龙的冠饰内有 U 形鼻道，可发出低频声音用于群体间交流，类似法国号',
      '冠饰的形状因性别和年龄不同而有差异',
      '它可以用两足或四足行走，两种姿势都行',
      '作为鸭嘴龙类，它嘴中有数百颗牙齿，可以高效研磨坚硬植物',
    ],
    confidence: 'mainstream',
    lastUpdated: '2024-01',
    citations: [
      { year: '1997', researcher: 'D.B. Weishampel 等', study: '鸭嘴龙类冠饰声学功能研究' },
      { year: '2001', researcher: 'J.C. Horner 等', study: '鸭嘴龙类生长发育与冠饰二态性' },
    ],
  },
  {
    name: '恐爪龙',
    nameEn: 'Deinonychus',
    pronunciation: 'kǒng zhǎo lóng',
    period: '白垩纪早期（约 1.15-1.08 亿年前）',
    diet: '肉食',
    length: '约 3-3.5 米',
    weight: '约 70-100 公斤',
    height: '约 0.8 米（臀部高度）',
    location: '北美洲西部',
    taxonomy: '蜥臀目 · 兽脚亚目 · 驰龙科',
    description: '恐爪龙是发现于北美洲的驰龙类恐龙，与迅猛龙是近亲。它的发现彻底改变了人们对恐龙的认知，推动了"恐龙文艺复兴"。',
    features: [
      '后脚第二脚趾上长有约 12 厘米长的镰刀状巨爪',
      '全身覆盖羽毛',
      '长而僵硬的尾巴，用于在攻击时保持平衡',
      '前肢较长，有三根带爪的手指',
      '相对较大的大脑，善于团队协作捕猎',
    ],
    funFacts: [
      '电影《侏罗纪公园》中的"迅猛龙"实际上是以恐爪龙为原型的（体型更大）',
      '20 世纪 60 年代末，古生物学家约翰·奥斯特罗姆研究恐爪龙后提出恐龙是温血、敏捷的动物，引发了"恐龙文艺复兴"',
      '恐爪龙可能是群居捕猎者，化石显示它们会攻击体型大得多的猎物如腱龙',
      '它的学名 Deinonychus 意为"恐怖的爪子"',
    ],
    confidence: 'consensus',
    lastUpdated: '2024-02',
    citations: [
      { year: '1969', researcher: 'J.H. Ostrom', study: '恐爪龙描述与恐龙温血性假说', note: '引发"恐龙文艺复兴"的里程碑研究' },
      { year: '2006', researcher: 'J.O. Maxwell 等', study: '恐爪龙群体捕猎化石证据分析' },
    ],
  },
];

const DINOSAUR_EXTINCTION_ANSWERS: KnowledgeEntry[] = [
  {
    keywords: ['灭绝', '灭亡', '消失', '为什么没了', '怎么灭绝', '怎么灭亡'],
    category: '灭绝原因',
    answer: '恐龙的灭绝是地球历史上最著名的大灭绝事件之一，发生在约 6600 万年前的白垩纪末期，被称为"白垩纪-古近纪灭绝事件"（K-Pg 灭绝事件）。目前科学界普遍认为，这次灭绝是由多个因素共同作用导致的：\n\n🏔️ **小行星撞击（主流观点）**：\n1980 年，诺贝尔物理学奖得主路易斯·阿尔瓦雷茨及其团队在全球多处 K-Pg 界线地层中发现了高浓度的铱元素（地球上稀少，陨石中常见），据此提出了小行星撞击假说。后来在墨西哥尤卡坦半岛发现了直径约 180 公里的希克苏鲁伯陨石坑（Chicxulub Crater），被认为就是这次撞击的遗址。一颗直径约 10-15 公里的小行星以约每秒 20 公里的速度撞击地球，释放的能量相当于 100 万亿吨 TNT，是全球核武器总量的万倍以上。撞击引发了全球火灾、海啸、火山冬天等连锁灾难。\n\n🌋 **大规模火山活动**：\n在同一时期，印度德干高原发生了持续数十万年的大规模火山喷发（德干暗色岩），释放了大量的二氧化碳、二氧化硫和尘埃，造成长期的全球气候变暖和酸化，可能已使恐龙处于生存压力之下，小行星撞击则是最后一击。\n\n⏳ **综合因素**：\n目前大多数科学家认为，恐龙灭绝是火山活动长期影响加上小行星撞击的急性灾难共同造成的。值得注意的是：\n• 并非所有恐龙都灭绝了——鸟类就是兽脚类恐龙的直系后代，它们存活至今\n• 同期灭绝的还有翼龙、蛇颈龙、菊石等约 75% 的地球物种\n• 哺乳动物和两栖动物等在这次灾难中幸存下来并逐渐繁盛',
    relatedDinosaurs: ['霸王龙', '三角龙', '翼龙'],
    confidence: 'mainstream',
    lastUpdated: '2024-03',
    citations: [
      { year: '1980', researcher: 'L.W. Alvarez 等', institution: '加州大学伯克利分校', study: 'K-T 界线铱异常与小行星撞击假说', note: '诺贝尔物理学奖得主的开创性研究' },
      { year: '1991', researcher: 'A.R. Hildebrand 等', study: '墨西哥希克苏鲁伯陨石坑发现与确认' },
      { year: '2010', researcher: 'L. Schulte 等', study: '41 位科学家联合声明：支持小行星撞击为 K-Pg 灭绝主因' },
      { year: '2019', researcher: 'P.B. Renne 等', study: '德干火山活动与小行星撞击时间精确测定' },
    ],
    caveats: [
      '关于火山活动在灭绝事件中的权重仍存在学术争议',
      '部分研究认为恐龙在撞击前已处于多样性下降趋势',
    ],
  },
];

const COMMON_QUESTIONS: KnowledgeEntry[] = [
  {
    keywords: ['视力', '眼睛', '看', '视觉', '看不清', '看不见'],
    category: '霸王龙视力',
    answer: '关于霸王龙的视力，有一个广泛流传的误区：很多人从《侏罗纪公园》等电影中了解到"霸王龙视力很差，不动就看不见你"。但现代科学研究表明，这个说法完全是错误的！\n\n🔬 **科学证据**：\n2006 年，古生物学家肯特·史蒂文斯（Kent Stevens）通过对霸王龙头骨的详细研究和视力模型分析，发现：\n• 霸王龙的双眼视觉重叠范围约为 55 度，比现代鹰类（约 40 度）还要宽\n• 它的视力清晰度（视敏度）可能达到人类的 13 倍，是现代猛禽的数倍\n• 它的眼眶朝向正前方，立体视觉极佳\n• 可以清晰看到 6 公里外的物体\n\n🦖 **为什么它的视力如此优秀？**\n作为顶级掠食者，霸王龙需要精准定位和追踪猎物。它那巨大的眼眶和朝向正前方的眼睛正是为了这个目的而演化出来的。\n\n🎬 **电影设定的来源**：\n《侏罗纪公园》中"不动就看不见"的设定只是为了增加紧张感的戏剧效果，并非科学事实。原著小说作者迈克尔·克莱顿参考的是早期（1910 年代）的错误研究，当时人们误以为霸王龙是行动缓慢的食腐动物。',
    relatedDinosaurs: ['霸王龙'],
    confidence: 'consensus',
    lastUpdated: '2024-02',
    citations: [
      { year: '2006', researcher: 'K.A. Stevens', institution: '俄勒冈大学', study: '霸王龙视觉敏锐度与双眼视觉模型分析' },
      { year: '2012', researcher: 'I. Schubert 等', study: '暴龙类视觉皮层相对大小分析' },
    ],
    caveats: [
      '视力估算是基于头骨形态和现代动物类比的模型推演，无法直接测量活体恐龙视力',
    ],
  },
  {
    keywords: ['羽毛', '有毛', '长毛', '绒毛', '毛发'],
    category: '恐龙羽毛',
    answer: '是的！现在科学界已经确认，许多恐龙（尤其是兽脚类肉食恐龙）身上长有羽毛，这不是少数例外，而是普遍现象。\n\n🧬 **羽毛恐龙的证据**：\n• 中华龙鸟（Sinosauropteryx）：1996 年在中国辽宁发现，是第一个被确认带有羽毛的非鸟类恐龙，保存了清晰的羽毛印痕\n• 小盗龙（Microraptor）：拥有四翼，全身覆盖羽毛，甚至可以滑翔\n• 霸王龙近亲如帝龙（Dilong）和羽暴龙（Yutyrannus）也被发现长有羽毛\n• 伶盗龙（即《侏罗纪公园》中的"迅猛龙"）化石上的羽茎瘤（羽毛附着在骨头上的痕迹）直接证明了它长有羽毛\n\n🤔 **哪些恐龙有羽毛？**\n• 几乎所有的小型兽脚类恐龙（如驰龙科、伤齿龙科）都长有羽毛\n• 一些大型兽脚类（如羽暴龙，体长 9 米）也全身覆盖羽毛\n• 幼年霸王龙可能长有羽毛，成年后因体型巨大（散热需求）可能部分或全部脱落\n• 蜥脚类（如腕龙、梁龙）和鸟臀类（如三角龙、剑龙）目前还没有明确的羽毛证据，但也不能完全排除\n\n💡 **羽毛的演化意义**：\n羽毛最初可能并非为了飞行，而是用于：\n1. **保温**：说明恐龙可能是温血动物（内温性）\n2. **展示**：求偶和物种识别\n3. **伪装**：融入环境\n4. 直到后来小型兽脚类恐龙才将羽毛用于滑翔和最终的飞行。现代鸟类就是兽脚类恐龙的后代。',
    relatedDinosaurs: ['迅猛龙', '始祖鸟', '霸王龙'],
    confidence: 'consensus',
    lastUpdated: '2024-03',
    citations: [
      { year: '1998', researcher: 'Q. Ji 等', institution: '中国地质科学院', study: '中华龙鸟带羽毛化石首次描述' },
      { year: '2007', researcher: 'A.H. Turner 等', study: '伶盗龙羽茎瘤化石发现，直接证明羽毛存在' },
      { year: '2012', researcher: 'X. Xu 等', study: '羽暴龙（Yutyrannus）——最大的带羽毛恐龙描述' },
      { year: '2019', researcher: 'M. Pittman 等', study: '非鸟类恐龙羽毛分布演化综述' },
    ],
    caveats: [
      '大型蜥脚类和鸟臀类恐龙是否有羽毛仍缺乏直接证据',
    ],
  },
  {
    keywords: ['温血', '冷血', '体温', '恒温', '变温', '内温'],
    category: '恐龙温血性',
    answer: '恐龙到底是温血（恒温）还是冷血（变温）动物？这个问题在古生物学界争论了数十年，现在证据越来越倾向于：大多数恐龙可能是温血动物（恒温动物），或者至少介于温血和冷血之间的中间状态。\n\n🌡️ **支持温血（恒温）的证据**：\n1. **羽毛证据**：大量带羽毛恐龙的发现表明恐龙有保温需求，这是恒温动物的特征\n2. **骨骼结构**：恐龙骨骼中有大量哈弗斯管（血管通道），生长速率快，类似现代哺乳动物和鸟类，而非冷血爬行动物\n3. **捕食者/猎物比例**：恐龙群落中捕食者比例较低，符合恒温动物需要更多能量的特点\n4. **高纬度恐龙**：在阿拉斯加和澳大利亚等极地地区发现了恐龙化石，说明它们能在寒冷环境中生存\n5. **直立姿态**：恐龙四肢直立在身体下方，不同于现代爬行动物的匍匐姿态，这种姿态通常与更高的代谢率相关\n\n⚖️ **"中间状态"假说**：\n也有科学家认为恐龙可能是"中温动物"，即：\n• 基础代谢率高于现代爬行动物，但低于哺乳动物和鸟类\n• 可以通过巨大体型（巨温性）保持相对稳定的体温\n• 大型蜥脚类恐龙可能主要靠体型保温，小型兽脚类则靠羽毛\n\n📚 **恐龙文艺复兴**：\n从 20 世纪 60 年代末开始，以约翰·奥斯特罗姆（发现恐爪龙）和罗伯特·巴克为代表的古生物学家提出了"恐龙文艺复兴"，挑战了传统将恐龙视为缓慢、迟钝、冷血爬行动物的观点。现在恐龙被认为是活跃、敏捷、高代谢率的动物，而鸟类就是存活至今的恐龙。',
    relatedDinosaurs: ['迅猛龙', '恐爪龙', '霸王龙'],
    confidence: 'mainstream',
    lastUpdated: '2024-03',
    citations: [
      { year: '1968', researcher: 'R.T. Bakker', study: '恐龙温血性假说首次系统提出', note: '"恐龙文艺复兴"的发起者' },
      { year: '1969', researcher: 'J.H. Ostrom', study: '恐爪龙描述与恐龙行为学革命' },
      { year: '2014', researcher: 'J.M. Grady 等', study: '恐龙代谢率系统发育分析——支持"中温"假说' },
      { year: '2020', researcher: 'M. Lussier 等', study: '恐龙骨骼组织学与生长速率研究进展' },
    ],
    caveats: [
      '不同类群恐龙的代谢策略可能差异很大，不能一概而论',
      '大型蜥脚类的巨温效应使问题更加复杂',
    ],
  },
  {
    keywords: ['最大', '最重', '最长', '最大的', '最大的恐龙'],
    category: '最大的恐龙',
    answer: '说到"最大的恐龙"，需要分别看体长、体重和高度三个维度，不同的物种各有"最强项"。不过由于大型恐龙的化石通常都不完整，因此数据存在一些不确定性。\n\n📏 **最长的恐龙**：\n目前已知最长的恐龙候选者包括：\n• **阿根廷龙（Argentinosaurus）**：体长估计可达 35-40 米，体重约 70-100 吨，来自阿根廷\n• **巴塔哥巨龙（Patagotitan）**：体长约 31-37 米，体重约 55-69 吨，化石相对完整\n• **超级龙（Supersaurus）**：体长可能超过 33-34 米，体重约 35-40 吨\n• **易碎双腔龙（Amphicoelias fragillimus）**：历史记载体长可能超过 58 米，但原始化石已遗失，数据存疑\n\n⚖️ **最重的恐龙**：\n• 同样是 **阿根廷龙** 和 **巴塔哥巨龙**，估计体重可达 70-100 吨，相当于 15-20 头非洲象\n• **南极龙（Antarctosaurus）** 等也是有力竞争者\n\n🏔️ **最高的恐龙**：\n• **波塞东龙（Sauroposeidon）**：体长约 27-34 米，头部抬起高度可达 17-18 米，相当于 6 层楼\n• **腕龙（Brachiosaurus）**：高度约 12-16 米，是较早被发现的巨型蜥脚类\n\n🦖 **最大的肉食恐龙**：\n• **棘龙（Spinosaurus）**：体长 15-18 米，可能超过霸王龙\n• **霸王龙（T. Rex）**：体长 12-13 米，体重 6-9 吨，是陆地史上最强的掠食者之一\n• **南方巨兽龙（Giganotosaurus）**：体长约 12-13 米，来自南美洲\n\n💡 **有趣的事实**：\n最大的恐龙都是蜥脚类植食恐龙，它们在侏罗纪和白垩纪进化出巨大体型可能是为了：\n1. 减少被掠食的风险\n2. 更高效地消化低营养的植物（大消化系统）\n3. 通过巨温性保持体温稳定',
    relatedDinosaurs: ['腕龙', '梁龙', '棘龙', '霸王龙'],
    confidence: 'controversial',
    lastUpdated: '2024-03',
    citations: [
      { year: '1993', researcher: 'J.E. Powell', study: '阿根廷龙描述' },
      { year: '2017', researcher: 'J.A. Carballido 等', study: '巴塔哥巨龙完整化石描述与体型估算' },
      { year: '2000', researcher: 'R. Cifelli 等', study: '波塞东龙命名与描述' },
      { year: '2023', researcher: 'P.M. Otero 等', study: '蜥脚类恐龙体型估算方法比较研究', note: '指出不同估算方法结果差异可达 20%+，需谨慎解读' },
    ],
    caveats: [
      '大型蜥脚类恐龙多为碎片化石，体型估算存在较大误差范围',
      '"最大恐龙"的称号常随新化石发现而变化',
    ],
  },
  {
    keywords: ['最小', '最小的', '体型小', '小型'],
    category: '最小的恐龙',
    answer: '最小的恐龙往往体型只有现代小鸟那么大，它们大多数是与鸟类关系密切的小型兽脚类恐龙。\n\n🐦 **最小的恐龙候选者**：\n• **秀颌龙（Compsognathus）**：生活在侏罗纪晚期的欧洲，体长约 70-90 厘米，体重约 2-3 公斤，大小类似现代的火鸡\n• **近鸟龙（Anchiornis）**：生活在侏罗纪晚期的中国，体长仅约 34 厘米，体重约 110 克，全身覆盖羽毛，翅膀上还有爪子\n• **小盗龙（Microraptor）**：生活在白垩纪早期的中国，体长约 77 厘米，体重约 1 公斤，拥有四翼，可能可以滑翔\n• **寐龙（Mei）**：体长仅约 53 厘米，化石保存了它蜷曲睡眠的姿态\n• **赵氏小恐龙（Xiaotingia）**：体长约 50 厘米\n\n🦜 **补充说明**：\n如果把现代鸟类也算作恐龙（它们确实是兽脚类恐龙的直系后代），那么最小的恐龙就是：\n• **吸蜜蜂鸟（Mellisuga helenae）**：仅生活在古巴，体长约 5-6 厘米，体重仅约 1.6-2.6 克\n• **蜂鸟科的其他种类**也都是体型极小的"恐龙"\n\n💡 **为什么小型恐龙这么难发现？**\n小型动物的骨骼更脆弱，更难保存为化石，因此我们对小型恐龙的了解远少于大型恐龙。中国辽宁的热河生物群以保存精美带羽毛小型恐龙化石闻名于世，极大地增进了我们对这些微型恐龙的认识。',
    relatedDinosaurs: ['迅猛龙', '始祖鸟'],
    confidence: 'mainstream',
    lastUpdated: '2023-12',
    citations: [
      { year: '2008', researcher: 'X. Xu 等', study: '近鸟龙（Anchiornis）描述——已知最小的非鸟类恐龙之一' },
      { year: '2000', researcher: 'Z. Zhou 等', study: '小盗龙（Microraptor）四翼恐龙描述' },
    ],
  },
  {
    keywords: ['鸟', '鸟类', '鸡', '后代', '演化', '进化', '关系'],
    category: '恐龙与鸟类',
    answer: '是的！现代鸟类就是恐龙的直系后代，它们本身就是一类存活至今的兽脚类恐龙。这不再是假说，而是被无数证据支持的科学事实。\n\n🔬 **鸟类起源于恐龙的证据**：\n1. **骨骼相似性**：1868 年，托马斯·赫胥黎就注意到恐龙和鸟类骨骼结构的惊人相似，如叉骨、中空骨骼、三指手、S 形脖子等\n2. **羽毛化石**：中国辽西热河生物群发现了大量带羽毛的恐龙化石，如中华龙鸟、小盗龙、尾羽龙等，填补了恐龙到鸟类的过渡环节\n3. **始祖鸟**：兼具恐龙特征（牙齿、长尾、爪子）和鸟类特征（羽毛、叉骨）的过渡物种\n4. **分子证据**：2007 年，科学家从霸王龙化石中提取到胶原蛋白，蛋白质序列与鸡和鸵鸟的相似度最高，直接证实了两者的亲缘关系\n5. **行为证据**：一些恐龙化石被发现正在孵卵、筑巢，与鸟类行为一致\n6. **呼吸系统**：恐龙和鸟类都有独特的气囊式呼吸系统，效率远高于哺乳动物\n\n🦖 **鸟类是哪类恐龙的后代？**\n鸟类属于 **兽脚亚目 · 手盗龙类（Maniraptora）**，与驰龙科（如迅猛龙）、伤齿龙科是近亲。在分类学上，现代鸟类被归类为：\n蜥臀目 → 兽脚亚目 → 手盗龙类 → 鸟翼类（Avialae）→ 鸟类（Aves）\n\n🐔 **常见的"恐龙"**：\n所以下次你吃炸鸡、看麻雀、喂鸽子的时候，可以把它们当成迷你恐龙！按照严格的支序分类学，既然鸟类是恐龙的后代，那么所有鸟类都属于恐龙，恐龙并没有完全灭绝——它们只是以鸟类的形式继续生活在我们身边。',
    relatedDinosaurs: ['始祖鸟', '迅猛龙'],
    confidence: 'consensus',
    lastUpdated: '2024-02',
    citations: [
      { year: '1868', researcher: 'T.H. Huxley', study: '鸟类与恐龙的亲缘关系首次提出' },
      { year: '2007', researcher: 'J.M. Asara 等', study: '霸王龙胶原蛋白序列分析——分子证据支持鸟类-恐龙亲缘关系' },
      { year: '2015', researcher: 'S.L. Brusatte 等', study: '鸟类起源与早期演化研究综述' },
    ],
  },
  {
    keywords: ['翼龙', '飞龙', '会飞', '飞行'],
    category: '翼龙不是恐龙',
    answer: '这是一个非常常见的问题，答案是：**翼龙不是恐龙！** 但它们和恐龙是近亲，同属于主龙类（Archosauria）演化支。\n\n🧬 **分类学上的区别**：\n在现代分类学中，恐龙的严格定义是："三角龙和现代鸟类的最近共同祖先及其所有后代"。这个定义包含了：\n• ✅ 兽脚类（如霸王龙、迅猛龙）\n• ✅ 蜥脚类（如腕龙、梁龙）\n• ✅ 鸟臀类（如三角龙、剑龙）\n• ✅ 所有现代鸟类\n• ❌ 不包括翼龙（亲缘关系在恐龙之外）\n• ❌ 不包括蛇颈龙、沧龙等海洋爬行动物\n• ❌ 不包括盘龙目（异齿龙、基龙等）——它们属于合弓纲，是哺乳动物的远亲\n\n🦅 **翼龙是什么？**\n翼龙是第一群会飞的脊椎动物，出现在约 2.28 亿年前的三叠纪晚期，比鸟类早出现约 7000 万年。它们的特点：\n• 翅膀由延长的第四指支撑翼膜构成（鸟类是第二指+羽毛）\n• 全世界分布，体型从麻雀大小到翼展 10 米的风神翼龙\n• 和恐龙一起在 6600 万年前的 K-Pg 灭绝事件中消失\n\n💡 **常见误区总结**：\n| 动物 | 是恐龙吗？ | 说明 |\n|------|-----------|------|\n| 霸王龙、三角龙 | ✅ 是 | 典型恐龙 |\n| 翼龙 | ❌ 不是 | 恐龙的近亲，属于翼龙目 |\n| 蛇颈龙、沧龙、鱼龙 | ❌ 不是 | 海洋爬行动物，不同演化支 |\n| 异齿龙 | ❌ 不是 | 比恐龙更早，属于合弓纲（哺乳动物远亲） |\n| 鸟类 | ✅ 是 | 鸟类就是兽脚类恐龙 |',
    relatedDinosaurs: ['翼龙'],
    confidence: 'consensus',
    lastUpdated: '2024-01',
    citations: [
      { year: '1842', researcher: 'R. Owen', study: 'Dinosauria（恐龙总目）概念首次建立' },
      { year: '1998', researcher: 'J.A. Wilson', study: '基于支序分类学的恐龙定义修订' },
    ],
  },
  {
    keywords: ['恐龙是什么', '什么是恐龙', '定义', '概念', '含义'],
    category: '恐龙定义',
    answer: '"恐龙"（Dinosauria）是由英国古生物学家理查德·欧文（Richard Owen）在 1842 年创造的术语，原意是"恐怖的蜥蜴"（Dinosauria，源自希腊语 deinos "恐怖的"+ sauros "蜥蜴"）。但我们现在知道，恐龙并不是蜥蜴，而是一类独特的、多样化的主龙类动物。\n\n🦴 **现代科学定义**：\n在系统发育分类学中，恐龙被定义为：\n"三角龙（Triceratops horridus）和现代鸟类（Passer domesticus）的最近共同祖先，及其所有后代。"\n\n这个定义涵盖了两大类恐龙：\n\n1. **蜥臀目（Saurischia）**：\n   - 兽脚亚目：所有肉食恐龙（霸王龙、迅猛龙等）及鸟类\n   - 蜥脚亚目：大型长脖子植食恐龙（腕龙、梁龙等）\n\n2. **鸟臀目（Ornithischia）**：\n   - 角龙类（三角龙）、鸭嘴龙类（副栉龙）、剑龙类（剑龙）、甲龙类（甲龙）等，全部是植食恐龙\n\n🦕 **恐龙的共同特征**：\n• 四肢直立于身体正下方（类似哺乳动物），而非像现代爬行动物那样向两侧伸展\n• 骨盆结构独特（分为蜥臀类和鸟臀类两类）\n• 其他解剖学特征，如股骨头上的第四转子等\n\n📜 **恐龙的时代**：\n恐龙从约 2.3 亿年前的三叠纪中期出现，到 6600 万年前白垩纪末期灭绝（除鸟类外），统治地球陆地生态系统长达约 1.65 亿年。相比之下，人类从南方古猿算起才约 400 万年。',
    confidence: 'consensus',
    lastUpdated: '2023-12',
    citations: [
      { year: '1842', researcher: 'R. Owen', study: 'Dinosauria（恐龙总目）正式建立' },
      { year: '1887', researcher: 'H.G. Seeley', study: '恐龙分为蜥臀目和鸟臀目两大支系' },
      { year: '1998', researcher: 'J.A. Wilson', study: '基于支序分类学的现代恐龙定义' },
    ],
  },
  {
    keywords: ['活了多久', '寿命', '能活多少年', '活多少年'],
    category: '恐龙寿命',
    answer: '恐龙的寿命因物种不同差异巨大，我们无法直接观察活体恐龙的寿命，但可以通过骨骼中的生长线（类似树木年轮）来推断。\n\n⏳ **不同恐龙的估计寿命**：\n\n🦕 **大型蜥脚类（腕龙、梁龙、阿根廷龙等）**：\n• 寿命可能达到 **70-100 年甚至更长**\n• 类似现代大型鲸类和大象，体型越大的动物通常寿命越长\n• 需要数十年才能长到最大体型\n\n🦖 **大型兽脚类（霸王龙等）**：\n• 寿命约 **25-30 年**\n• 目前已知最老的霸王龙化石"Scotty"估计死亡时约 28 岁\n• 霸王龙约 14-18 岁达到性成熟\n\n🦌 **中型植食恐龙（三角龙、副栉龙等）**：\n• 寿命约 **20-40 年**\n\n🐦 **小型兽脚类（迅猛龙、恐爪龙等）**：\n• 寿命可能约 **10-20 年**，类似现代中小型鸟类和哺乳动物\n\n🔬 **如何推断恐龙寿命？**\n1. **骨骼生长线**：恐龙骨骼中像树木年轮一样的"停止生长线"（LAGs），每条线代表一年\n2. **生长速率**：通过不同年龄段化石的大小和骨组织学分析\n3. **现代类比**：参考同体型的现代动物的寿命\n\n💡 **有趣的事实**：\n• 恐龙从孵化到成年的生长速度非常快，尤其是大型蜥脚类，可能需要消耗大量食物\n• 许多恐龙可能并不能活到"老年"，因为疾病、捕食、灾难等因素\n• 现代鸟类（恐龙后代）中，大型鹦鹉可以活 80 年以上，信天翁可以活 60 年以上',
    relatedDinosaurs: ['霸王龙', '腕龙'],
    confidence: 'mainstream',
    lastUpdated: '2023-11',
    citations: [
      { year: '2019', researcher: 'H.N. Woodward 等', study: '"Scotty"霸王龙骨龄分析，目前已知最老的暴龙个体' },
      { year: '2004', researcher: 'K. Curry-Rogers', study: '蜥脚类恐龙生长速率与寿命估算' },
      { year: '2018', researcher: 'M. Lussier 等', study: '非鸟类恐龙生长模式多样性综述' },
    ],
    caveats: [
      '寿命估算是基于骨骼生长线的间接证据，可能受个体健康状况影响',
    ],
  },
  {
    keywords: ['蛋', '下蛋', '孵化', '产卵', '孵蛋'],
    category: '恐龙繁殖',
    answer: '是的，恐龙都是卵生动物，通过下蛋繁殖后代，这已经被大量的恐龙蛋化石、巢穴化石和胚胎化石所证实。\n\n🥚 **恐龙蛋的证据**：\n• 全球各地都发现了大量恐龙蛋化石，有些蛋中还保存着胚胎\n• 发现了完整的恐龙巢穴，蛋整齐排列其中\n• 甚至发现了正在孵蛋的恐龙化石（如窃蛋龙）\n\n🦕 **不同恐龙的蛋**：\n• **蜥脚类恐龙（腕龙等）**：蛋相对较小（约 15-20 厘米），因为如果蛋太大，蛋壳太厚会导致胚胎无法呼吸。通常一次下很多蛋\n• **兽脚类恐龙（霸王龙、迅猛龙等）**：蛋多为椭圆形或长形\n• **窃蛋龙类**：发现了亲龙坐在蛋巢上孵卵的化石，证明它们像鸟类一样孵蛋\n• **鸭嘴龙类**：蛋约 10-15 厘米，发现过巨大的繁殖地\n• 最小的恐龙蛋可能只有几厘米，最大的约 50 厘米（长颈龙，但它可能不是恐龙）\n\n🏠 **恐龙的育幼行为**：\n越来越多的证据表明许多恐龙具有复杂的育幼行为：\n1. **筑巢**：恐龙会用泥土、植被等建造精心设计的巢穴\n2. **孵蛋**：窃蛋龙、慈母龙等被发现坐在蛋上孵化\n3. **育幼**：慈母龙（Maiasaura）的名字意为"好妈妈蜥蜴"，化石证据显示它们会喂养和照顾幼崽\n4. **群居繁殖**：某些鸭嘴龙类会成千上万只聚集在繁殖地产卵\n\n💡 **有趣的事实**：\n• 恐龙蛋的蛋壳结构与现代鸟类非常相似\n• 窃蛋龙（Oviraptor）最初被误认为在偷原角龙的蛋，因此得名"偷蛋龙"，后来发现它其实是在孵自己的蛋，名字却改不了了\n• 一些恐龙蛋化石中提取到了 DNA 片段（虽然不完整）',
    confidence: 'consensus',
    lastUpdated: '2024-01',
    citations: [
      { year: '1993', researcher: 'M.A. Norell 等', study: '窃蛋龙孵卵化石发现——澄清"偷蛋龙"误解' },
      { year: '1979', researcher: 'J.R. Horner 等', study: '慈母龙巢穴与育幼行为研究' },
      { year: '2017', researcher: 'D. Varricchio 等', study: '恐龙繁殖行为演化综述' },
    ],
  },
  {
    keywords: ['聪明', '智商', '智力', '脑子', '大脑'],
    category: '恐龙智力',
    answer: '恐龙的智力水平因物种不同差异很大，不能一概而论。虽然过去恐龙被认为是"愚蠢的巨兽"，但现代研究表明至少某些恐龙相当聪明。\n\n🧠 **测量恐龙智力的方法**：\n科学家通常用"脑商"（Encephalization Quotient, EQ）来估计动物智力——即脑容量与身体质量的比值，相对于同类动物的预期值。\n\n📊 **不同恐龙的脑商估计**：\n• **伤齿龙（Troodon）**：EQ 约 5.8，是所有恐龙中最高的，被认为最聪明的非鸟类恐龙。它的大脑相对较大，可能具有复杂的社会行为和解决问题的能力\n• **其他驰龙类（迅猛龙、恐爪龙）**：EQ 约 1.5-3.0，相对较高，可能可以群体协作捕猎\n• **霸王龙**：EQ 约 2.0-2.5，对于大型肉食恐龙来说相当不错\n• **其他兽脚类**：EQ 普遍高于植食恐龙\n• **大型蜥脚类（腕龙、梁龙）**：EQ 很低，约 0.1-0.2，大脑只有网球大小。但这不代表它们"笨"，而是大型植食动物不需要特别高的智力\n• **剑龙**：EQ 约 0.1-0.2，大脑只有核桃大小（约 70 克），是相对体型最小的恐龙大脑之一\n• **鸭嘴龙类（副栉龙等）**：EQ 约 0.5-1.5，中等水平，可能具有复杂的社会结构\n\n🤔 **它们能做什么？**\n• 高智商的兽脚类可能可以制定捕猎策略、群体协作\n• 植食恐龙可能具有复杂的社会行为（如迁徙、群体防御、育幼）\n• 某些恐龙可能具有良好的记忆力\n\n💡 **和现代动物对比**：\n• 伤齿龙的智力可能接近现代某些鸟类（如乌鸦）或某些哺乳动物\n• 大多数植食恐龙的智力水平可能类似现代鳄鱼或蜥蜴\n• 记住：智力是对特定生态位的适应，没有"高等"或"低等"之分',
    relatedDinosaurs: ['迅猛龙', '恐爪龙', '剑龙', '霸王龙'],
    confidence: 'mainstream',
    lastUpdated: '2023-12',
    citations: [
      { year: '1977', researcher: 'H.J. Jerison', study: '脑商（EQ）概念在古生物学中的应用' },
      { year: '2009', researcher: 'D.C. Evans 等', study: '非鸟类恐龙脑容量演化综述' },
    ],
    caveats: [
      '脑商只能粗略估计智力，不能完全反映动物认知能力',
      'EQ 估算依赖脑内膜化石，数据有限',
    ],
  },
  {
    keywords: ['颜色', '什么颜色', '长什么样', '外观'],
    category: '恐龙颜色',
    answer: '很长时间里，恐龙的颜色只能靠艺术家想象。但近年来，科学家通过研究化石中保存的黑素体（melanosome，细胞中包含色素的微小结构），已经可以确定一些恐龙的真实颜色！\n\n🌈 **已确定颜色的恐龙**：\n• **中华龙鸟（Sinosauropteryx）**：第一个被确定颜色的非鸟类恐龙。背部为红棕色，腹部为浅色，尾巴有深浅相间的条纹\n• **近鸟龙（Anchiornis）**：身体主要为黑色，翅膀有黑白相间的条纹，头部有红褐色冠羽\n• **小盗龙（Microraptor）**：全身羽毛为彩虹般的 iridescent 蓝黑色，类似现代乌鸦或蜂鸟的金属光泽\n• **始祖鸟（Archaeopteryx）**：羽毛主要为黑色，可能带有浅色边缘\n• **北票龙（Beipiaosaurus）**：羽毛为棕色或灰褐色\n• **孔子鸟（Confuciusornis）**：不同个体可能有不同颜色，某些可能有彩虹色羽毛\n\n🔬 **如何知道恐龙的颜色？**\n羽毛化石中可以保存极其微小的黑素体（直径仅约 0.5-2 微米）：\n• 圆形的黑素体通常含有棕/红褐素（phaeomelanin）\n• 长椭圆形的黑素体通常含有黑色素（eumelanin）\n• 黑素体的排列方式还可以产生彩虹色（结构色）\n\n🎨 **其他恐龙的颜色推测**：\n对于没有羽毛化石的恐龙，我们可以推测：\n• 大型植食恐龙可能具有伪装色，如灰褐色、绿色\n• 可能有用于物种识别和求偶展示的鲜艳色彩（如副栉龙的冠饰、三角龙的颈盾）\n• 掠食者可能有伪装色便于伏击\n\n💡 **有趣的事实**：\n恐龙的颜色研究是古生物学中非常"年轻"的领域，第一个恐龙颜色确定是在 2010 年。随着技术发展，未来我们可能会知道更多恐龙的真实外观！',
    relatedDinosaurs: ['迅猛龙', '始祖鸟'],
    confidence: 'consensus',
    lastUpdated: '2024-02',
    citations: [
      { year: '2010', researcher: 'M. Zhang 等', institution: '北京自然博物馆', study: '中华龙鸟颜色复原——首个非鸟类恐龙颜色证据' },
      { year: '2010', researcher: 'Q. Li 等', study: '近鸟龙全身颜色复原' },
      { year: '2012', researcher: 'S.L. Brusatte 等', study: '小盗龙彩虹色羽毛研究' },
      { year: '2023', researcher: 'E. Saitta 等', study: '恐龙颜色研究方法与进展综述' },
    ],
  },
  {
    keywords: ['群居', '独居', '群体', '社会', '一起生活'],
    category: '恐龙社会行为',
    answer: '越来越多的证据表明，许多恐龙是群居动物，具有复杂的社会行为，而非过去认为的那样都是独居生物。\n\n👥 **群居的证据**：\n1. **足迹化石**：发现了大量同一方向、同一年代的恐龙足迹，显示恐龙群体行动\n2. **骨床（Bonebed）**：大量同种恐龙化石堆积在同一地点，可能代表群体死亡事件（如洪水、干旱），说明它们生前生活在一起\n3. **繁殖地**：发现了大面积的恐龙繁殖区，数百只恐龙聚集产卵\n4. **育幼证据**：慈母龙等恐龙被发现会喂养和保护幼崽\n\n🦕 **哪些恐龙可能群居？**\n✅ **大概率群居的恐龙**：\n• **鸭嘴龙类（副栉龙、埃德蒙顿龙、慈母龙等）**：发现了包含数百甚至数千个个体的骨床，可能有复杂的社会结构\n• **蜥脚类（腕龙、梁龙、迷惑龙等）**：足迹和骨床证据表明它们可能以家族群体迁徙\n• **小型植食恐龙（棱齿龙等）**：体型小，需要群体防御\n• **某些兽脚类**：恐爪龙化石与猎物一起发现，可能是群体捕猎\n\n❓ **可能独居的恐龙**：\n• **大型肉食恐龙如霸王龙**：作为顶级掠食者，可能领域性强、独居或小家庭活动\n• **大型植食恐龙如三角龙**：目前骨床证据较少，可能独居或小群体活动\n\n🏰 **群体防御**：\n群居植食恐龙可能像现代野牛或角马一样：\n• 数量上减少被单个攻击的概率\n• 围成一圈保护幼崽\n• 体型大的个体在外围防御\n\n💡 **关于"迅猛龙群体捕猎"**：\n电影中描绘的迅猛龙群体协作捕猎场景非常精彩，但真实情况仍有争议。虽然恐爪龙有群体捕猎的化石证据，但伶盗龙（即电影中的"迅猛龙"）是否真的群体捕猎还缺乏直接证据，可能更多是独居或成对活动。',
    relatedDinosaurs: ['副栉龙', '恐爪龙', '霸王龙'],
    confidence: 'controversial',
    lastUpdated: '2024-02',
    citations: [
      { year: '2006', researcher: 'J.O. Maxwell 等', study: '恐爪龙群体捕猎化石证据分析' },
      { year: '1979', researcher: 'J.R. Horner 等', study: '慈母龙群体育幼与社会行为研究' },
      { year: '2021', researcher: 'J.L. Farke 等', study: '三角龙社会行为再评估' },
    ],
    caveats: [
      '多数群居证据来自间接化石痕迹，不同学者解读可能不同',
      '不同物种的社会行为可能差异巨大，不能一概而论',
    ],
  },
  {
    keywords: ['声音', '叫声', '怎么叫', '吼叫', '发声'],
    category: '恐龙声音',
    answer: '恐龙的声音无法直接从化石中保存，但科学家可以通过化石解剖和现代近亲来推测它们可能的发声方式。\n\n🎵 **恐龙可能的发声方式**：\n\n🦆 **鸭嘴龙类（副栉龙等）——最会"唱歌"的恐龙**：\n副栉龙头顶的长管状冠饰内有复杂的 U 形鼻道，研究表明这些鼻道可以发出低频共振声音，类似法国号或长号，可能用于群体间的远距离交流、求偶或警告。不同种类、不同性别、不同年龄的副栉龙冠饰形状不同，发出的声音也不同，就像每个人的声音都有独特的"音色"。\n\n🦖 **兽脚类肉食恐龙——可能发出低沉的吼叫**：\n霸王龙等大型兽脚类可能通过喉部发出低沉、响亮的吼叫声，用于宣示领地、吸引配偶或威慑对手。不过它们不太可能像电影中那样发出高频咆哮，更可能类似现代鳄鱼或鸵鸟的低频声音。\n\n🦕 **蜥脚类——低频隆隆声**：\n大型蜥脚类恐龙可能发出非常低频的次声波（低于人类听觉范围），类似大象，用于远距离（可达数公里）的群体交流。\n\n🔬 **如何研究恐龙声音？**\n1. **解剖结构**：分析头骨中的鼻腔、喉部结构\n2. **声学建模**：用计算机模拟副栉龙冠饰的发声频率\n3. **现代类比**：参考鸟类和鳄鱼（恐龙的近亲）的发声方式\n\n💡 **有趣的事实**：\n恐龙的声音研究是一个非常有趣但困难的领域，因为声带等软组织不会形成化石。我们可能永远无法完全确定恐龙的真实叫声，但随着技术发展，推测会越来越准确！',
    relatedDinosaurs: ['副栉龙'],
    confidence: 'hypothesis',
    lastUpdated: '2023-11',
    citations: [
      { year: '1997', researcher: 'D.B. Weishampel 等', study: '鸭嘴龙类冠饰声学功能模拟研究' },
      { year: '2017', researcher: 'J.A. Clarke 等', study: '鸟类发声器官演化与恐龙发声推测' },
    ],
    caveats: [
      '恐龙声音无法直接观测，所有推测都基于间接证据和现代类比',
      '软组织（声带等）不形成化石，限制了研究的准确性',
    ],
  },
  {
    keywords: ['足迹', '脚印', '痕迹化石'],
    category: '恐龙足迹',
    answer: '恐龙足迹化石（也叫遗迹化石）是古生物学中非常珍贵的资料，它们可以告诉我们恐龙是如何行走、奔跑、生活的，这些信息骨骼化石往往无法提供。\n\n🦶 **足迹能告诉我们什么？**\n\n1. **行走方式**：足迹可以清楚地显示恐龙是两足行走还是四足行走，以及脚的朝向、步伐大小\n2. **奔跑速度**：通过步幅长度和腿长的关系，科学家可以估算恐龙的行走或奔跑速度。例如，某些兽脚类恐龙可能可以跑到每小时 40 公里以上\n3. **社会行为**：同一地点、同一方向、平行排列的大量足迹，强烈表明恐龙是群体行动的\n4. **生态系统**：足迹可以告诉我们某个地区生活着哪些恐龙，即使没有骨骼化石\n5. **皮肤纹理**：某些保存特别好的足迹甚至可以显示脚底的皮肤纹理和鳞片痕迹\n\n📍 **著名的足迹发现地**：\n• 美国科罗拉多州的恐龙岭（Dinosaur Ridge）\n• 中国甘肃永靖的恐龙足印化石群（保存了世界最大的恐龙足迹之一）\n• 葡萄牙的 Lourinhã 足迹点\n\n🐾 **足迹化石的形成**：\n足迹需要非常特殊的条件才能保存：\n1. 恐龙踩在合适的沉积物上（如湿润的泥地或沙地）\n2. 足迹被快速掩埋（如被洪水带来的沉积物覆盖），避免被侵蚀\n3. 沉积物经过漫长的地质年代石化\n\n💡 **有趣的事实**：\n• 目前发现的最大恐龙足迹来自一种蜥脚类恐龙，足迹直径超过 1 米\n• 有些足迹点可以观察到恐龙"追踪"猎物的轨迹\n• 恐龙足迹的专业术语叫"ichnofossil"（遗迹化石）',
    confidence: 'consensus',
    lastUpdated: '2023-10',
    citations: [
      { year: '2016', researcher: 'P.L. Falkingham 等', study: '恐龙足迹生物力学与速度估算研究综述' },
    ],
  },
];

const SUGGESTED_QUESTIONS: string[] = [
  '霸王龙真的视力很差吗？',
  '翼龙算恐龙吗？',
  '恐龙为什么灭绝？',
  '恐龙是温血动物还是冷血动物？',
  '恐龙有羽毛吗？',
  '鸟类是恐龙的后代吗？',
  '最大的恐龙有多大？',
  '恐龙能活多少年？',
  '恐龙是什么颜色的？',
  '恐龙聪明吗？',
  '恐龙是群居动物吗？',
  '恐龙怎么繁殖后代？',
];

@Injectable()
export class DinosaurQaService {
  private findDinosaurByName(name: string): DinosaurInfo | undefined {
    const normalizedName = name.replace(/\s/g, '').toLowerCase();
    return DINOSAUR_DATABASE.find(
      (d) =>
        d.name.replace(/\s/g, '').toLowerCase().includes(normalizedName) ||
        d.nameEn.toLowerCase().includes(normalizedName),
    );
  }

  private matchQuestion(question: string): KnowledgeEntry | undefined {
    const normalized = question.toLowerCase();
    return (
      DINOSAUR_EXTINCTION_ANSWERS.find((entry) =>
        entry.keywords.some((k) => normalized.includes(k.toLowerCase())),
      ) ||
      COMMON_QUESTIONS.find((entry) =>
        entry.keywords.some((k) => normalized.includes(k.toLowerCase())),
      )
    );
  }

  private generateGenericAnswer(question: string): string {
    const trimmed = question.trim();
    if (!trimmed) {
      return '请输入一个关于恐龙的问题，我会尽力为您解答！🦕';
    }

    if (trimmed.length <= 2) {
      return '您的问题太短啦，请输入更具体的问题，比如"霸王龙有多大""恐龙为什么灭绝"等。';
    }

    const greetings = ['你好', '您好', 'hi', 'hello', '嗨'];
    if (greetings.some((g) => trimmed.toLowerCase().includes(g))) {
      return '你好呀！欢迎来到恐龙世界！🦖 你可以问我任何关于恐龙的问题，比如"霸王龙有多大""翼龙是恐龙吗""恐龙为什么灭绝"等，我会尽力为你解答！';
    }

    const thanks = ['谢谢', '感谢', 'thank', 'thanks'];
    if (thanks.some((t) => trimmed.toLowerCase().includes(t))) {
      return '不客气！很高兴能帮助你了解恐龙世界！🦕 还有什么想知道的，尽管问我吧～';
    }

    return `关于"${trimmed}"这个问题，目前我的知识库中还没有详细的答案。不过我可以告诉您一些恐龙的基础知识：\n\n🦕 **恐龙的分类**：\n恐龙主要分为两大类：\n• **蜥臀目**：包括兽脚类（肉食，如霸王龙、迅猛龙，鸟类也属于这一类）和蜥脚类（大型植食，如腕龙、梁龙）\n• **鸟臀目**：全部是植食恐龙，包括角龙类（三角龙）、鸭嘴龙类（副栉龙）、剑龙类（剑龙）、甲龙类（甲龙）等\n\n🌍 **恐龙的时代**：\n恐龙生活在距今约 2.3 亿至 6600 万年前，统治地球陆地生态系统长达约 1.65 亿年！\n\n💡 您可以尝试问我更具体的问题，比如：\n• 某种具体恐龙的信息（如"霸王龙"、"三角龙"）\n• 常见问题（如"恐龙为什么灭绝"、"恐龙有羽毛吗"）\n• 恐龙的身体特征、生活习性等`;
  }

  ask(question: string): {
    answer: string;
    relatedDinosaurs: DinosaurInfo[];
    relatedFacts: DinosaurFact[];
    credibility?: CredibilityInfo;
  } {
    const trimmed = question.trim();
    const relatedDinosaurs: DinosaurInfo[] = [];
    const relatedFacts: DinosaurFact[] = [];
    let credibility: CredibilityInfo | undefined;

    for (const dino of DINOSAUR_DATABASE) {
      if (
        trimmed.includes(dino.name) ||
        trimmed.toLowerCase().includes(dino.nameEn.toLowerCase())
      ) {
        relatedDinosaurs.push(dino);
      }
    }

    const matchedEntry = this.matchQuestion(trimmed);
    if (matchedEntry) {
      if (matchedEntry.relatedDinosaurs) {
        for (const dinoName of matchedEntry.relatedDinosaurs) {
          const dino = this.findDinosaurByName(dinoName);
          if (dino && !relatedDinosaurs.some((rd) => rd.name === dino.name)) {
            relatedDinosaurs.push(dino);
          }
        }
      }

      credibility = {
        confidence: matchedEntry.confidence,
        lastUpdated: matchedEntry.lastUpdated,
        citations: matchedEntry.citations,
        caveats: matchedEntry.caveats,
      };

      if (matchedEntry.category) {
        relatedFacts.push({
          title: '知识类别',
          content: matchedEntry.category,
          category: matchedEntry.category,
          confidence: matchedEntry.confidence,
        });
      }

      return {
        answer: matchedEntry.answer,
        relatedDinosaurs,
        relatedFacts,
        credibility,
      };
    }

    if (relatedDinosaurs.length > 0) {
      const dino = relatedDinosaurs[0];
      const facts: DinosaurFact[] = [
        { title: '时期', content: dino.period, category: '基本信息' },
        { title: '食性', content: dino.diet, category: '基本信息' },
        { title: '体长', content: dino.length, category: '体型' },
        { title: '体重', content: dino.weight, category: '体型' },
        { title: '发现地点', content: dino.location, category: '分布' },
        { title: '分类', content: dino.taxonomy, category: '分类' },
      ];
      if (dino.height) {
        facts.push({ title: '身高', content: dino.height, category: '体型' });
      }
      facts.push(
        ...dino.features.map((f, i) => ({
          title: `特征${i + 1}`,
          content: f,
          category: '特征' as const,
        })),
      );
      facts.push(
        ...dino.funFacts.map((f, i) => ({
          title: `趣味知识${i + 1}`,
          content: f,
          category: '趣味知识' as const,
          confidence: dino.confidence,
        })),
      );

      credibility = {
        confidence: dino.confidence,
        lastUpdated: dino.lastUpdated,
        citations: dino.citations,
      };

      return {
        answer: `🦖 **${dino.name}**（${dino.nameEn}）\n\n${dino.description}\n\n💡 **想了解更多？**\n您可以继续问我关于 ${dino.name} 的具体问题，比如它的生活习性、天敌、化石发现故事等！`,
        relatedDinosaurs,
        relatedFacts: facts,
        credibility,
      };
    }

    return {
      answer: this.generateGenericAnswer(trimmed),
      relatedDinosaurs,
      relatedFacts,
    };
  }

  getSuggestedQuestions(): string[] {
    return SUGGESTED_QUESTIONS;
  }

  getAllDinosaurs(): DinosaurInfo[] {
    return DINOSAUR_DATABASE;
  }
}
