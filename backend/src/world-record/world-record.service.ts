import { Injectable } from '@nestjs/common';

export type VolatilityLevel = 'stable' | 'variable' | 'volatile';

export interface WorldRecord {
  id: string;
  category: string;
  title: string;
  question: string;
  answer: string;
  background: string;
  funFacts: string[];
  relatedRecords: string[];
  keywords: string[];
  source: string;
  updatedAt: string;
  volatility: VolatilityLevel;
}

export interface WorldRecordAnswer {
  found: boolean;
  record?: WorldRecord;
  suggestions?: WorldRecord[];
  category?: string;
  message?: string;
  knowledgeVersion: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

const KNOWLEDGE_VERSION = 'v1.0.0-202406';

const WORLD_RECORDS: WorldRecord[] = [
  {
    id: 'deepest-trench',
    category: '地理自然',
    title: '世界上最深的海沟',
    question: '世界上最深的海沟是哪里？',
    answer: '马里亚纳海沟，最深处约11,034米（斐查兹海渊）',
    background: '马里亚纳海沟位于太平洋西部，靠近马里亚纳群岛，全长约2550公里，平均宽度69公里。它是由太平洋板块俯冲到菲律宾板块之下形成的。1960年，人类首次乘坐"的里雅斯特号"深海潜水器到达海沟底部。2012年，著名导演詹姆斯·卡梅隆独自驾驶深海挑战者号下潜至约10,908米深处。',
    funFacts: [
      '如果把珠穆朗玛峰放入马里亚纳海沟，峰顶距离水面还有约2,186米',
      '海沟底部压力约为海平面的1,086倍，相当于一个人背上约50架大型喷气式飞机',
      '尽管环境极端，科学家仍在海沟底部发现了数百种生物，包括端足类、海参等',
      '卡梅隆的潜水发现了约68个新物种'
    ],
    relatedRecords: ['highest-mountain', 'deepest-lake', 'longest-river'],
    keywords: ['最深', '海沟', '海洋', '马里亚纳', '太平洋', '海底'],
    source: '联合国教科文组织海洋学委员会、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'highest-mountain',
    category: '地理自然',
    title: '世界上最高的山峰',
    question: '世界上最高的山峰是哪座？',
    answer: '珠穆朗玛峰，海拔8,848.86米',
    background: '珠穆朗玛峰位于中华人民共和国与尼泊尔边界上，是喜马拉雅山脉的主峰。2020年12月8日，中国和尼泊尔共同宣布珠穆朗玛峰的最新高程为8,848.86米。1953年5月29日，新西兰人埃德蒙·希拉里和尼泊尔向导丹增·诺尔盖首次成功登顶。',
    funFacts: [
      '珠穆朗玛峰仍在以每年约4毫米的速度升高，这是由于印度板块不断向欧亚板块挤压',
      '峰顶温度最低可达-60°C，常年积雪不化',
      '截至2023年，已有超过6,000人成功登顶，但也有超过300人在攀登中遇难',
      '珠峰上的尸体因严寒干燥而不会腐烂，成为登山者的路标'
    ],
    relatedRecords: ['deepest-trench', 'tallest-animal', 'longest-mountain-range'],
    keywords: ['最高', '山峰', '珠穆朗玛', '喜马拉雅', '海拔', '攀登'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-animal',
    category: '生物世界',
    title: '世界上最大的动物',
    question: '世界上最大的动物是什么？',
    answer: '蓝鲸，体长可达33米，体重可达180吨',
    background: '蓝鲸是一种海洋哺乳动物，属于须鲸亚目。它的心脏和一辆小汽车差不多大，主动脉血管足以让一个小孩爬过去。蓝鲸的舌头重约2.7吨，展开后可以站50个人。尽管体型巨大，蓝鲸主要以小型甲壳类动物磷虾为食，每天可以吃掉4吨以上。',
    funFacts: [
      '蓝鲸的声音可以达到188分贝，比喷气式飞机起飞时（140分贝）还要响，是地球上声音最大的动物',
      '蓝鲸的低频率叫声可以传播数百公里，用于与远方的同伴交流',
      '蓝鲸的寿命约为80-90年，已知最老的蓝鲸约有110岁',
      '刚出生的蓝鲸幼崽就有约7米长，体重约2.5吨，每天要喝约400升母乳'
    ],
    relatedRecords: ['tallest-animal', 'largest-land-animal', 'smallest-animal'],
    keywords: ['最大', '动物', '蓝鲸', '鲸鱼', '海洋生物', '哺乳动物'],
    source: 'IUCN 红色名录、世界自然基金会 WWF、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'tallest-animal',
    category: '生物世界',
    title: '世界上最高的陆地动物',
    question: '世界上最高的陆地动物是什么？',
    answer: '长颈鹿，身高可达5.5-6.1米',
    background: '长颈鹿是一种生长在非洲的反刍偶蹄动物，是世界上最高的陆地动物。成年雄性长颈鹿身高一般在4.6-6.1米之间，雌性稍矮。长颈鹿的脖子虽然很长（约2-2.4米），但和人类一样只有7块颈椎骨。',
    funFacts: [
      '长颈鹿的血压是人类的2-3倍，这样才能把血液泵到2米多高的头部',
      '长颈鹿的舌头长达45-50厘米，可以轻松卷取高处的树叶，舌头呈蓝紫色以防止被太阳灼伤',
      '长颈鹿的睡眠时间非常短，每天只睡约30分钟到2小时，而且大部分时间是站着睡的',
      '长颈鹿的奔跑速度可以达到每小时56公里'
    ],
    relatedRecords: ['largest-animal', 'largest-land-animal', 'fastest-animal'],
    keywords: ['最高', '陆地', '动物', '长颈鹿', '非洲', '脖子'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'longest-river',
    category: '地理自然',
    title: '世界上最长的河流',
    question: '世界上最长的河流是哪条？',
    answer: '尼罗河，全长约6,650公里（也有认为亚马孙河更长）',
    background: '尼罗河是一条流经非洲东部与北部的河流，自南向北注入地中海。它与中非地区的刚果河以及西非地区的尼日尔河并列非洲最大的三个河流系统。尼罗河有两条主要的支流，白尼罗河和青尼罗河。尼罗河谷和三角洲是埃及文化的摇篮，也是世界文明的发源地之一。',
    funFacts: [
      '关于世界最长河流一直有争议，部分科学家认为亚马孙河全长约7,025公里，比尼罗河更长',
      '尼罗河流域面积约335万平方公里，占非洲大陆面积的九分之一',
      '埃及90%以上的人口分布在尼罗河沿岸平原和三角洲地区',
      '尼罗河每年6-10月会定期泛滥，洪水退去后留下的肥沃淤泥孕育了古埃及文明'
    ],
    relatedRecords: ['largest-ocean', 'deepest-trench', 'highest-mountain'],
    keywords: ['最长', '河流', '尼罗河', '亚马孙', '非洲', '埃及'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-ocean',
    category: '地理自然',
    title: '世界上最大的海洋',
    question: '世界上最大的海洋是哪个？',
    answer: '太平洋，面积约1.81亿平方公里',
    background: '太平洋是地球上五大洋中面积最大、最深、边缘海和岛屿最多的大洋。它位于亚洲、大洋洲、南极洲和南北美洲之间。太平洋南北最长约15,900公里，东西最宽约19,000公里，平均深度3,957米，最大深度11,034米（马里亚纳海沟）。',
    funFacts: [
      '太平洋的面积比地球所有陆地面积加起来还要大',
      '太平洋拥有世界上约25,000个岛屿，占世界岛屿总数的45%以上',
      '太平洋名字的意思是"平静的海洋"，由航海家麦哲伦命名',
      '太平洋底部有地球上最长的山脉——洋中脊，全长约8万公里'
    ],
    relatedRecords: ['deepest-trench', 'longest-river', 'largest-continent'],
    keywords: ['最大', '海洋', '太平洋', '岛屿', '最深', '海底'],
    source: '联合国教科文组织海洋学委员会、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-country',
    category: '人文地理',
    title: '世界上面积最大的国家',
    question: '世界上面积最大的国家是哪个？',
    answer: '俄罗斯，面积约1,709.82万平方公里',
    background: '俄罗斯联邦，又称俄国，是一个横跨欧亚大陆的国家。国土面积约1,709.82万平方公里，占地球陆地面积的八分之一，是世界上面积最大的国家。俄罗斯跨越11个时区，拥有丰富的自然资源。',
    funFacts: [
      '俄罗斯的国土横跨欧亚两个大洲，约四分之三的领土在亚洲，但其政治经济中心在欧洲部分',
      '俄罗斯与14个国家接壤，是世界上邻国最多的国家',
      '俄罗斯拥有世界上最大的森林储备，森林面积约815万平方公里，占国土面积近一半',
      '莫斯科地铁被公认为世界上最漂亮的地铁之一，有"地下宫殿"之称'
    ],
    relatedRecords: ['smallest-country', 'most-populous-country', 'largest-continent'],
    keywords: ['最大', '国家', '俄罗斯', '面积', '领土', '欧亚'],
    source: '世界银行、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'smallest-country',
    category: '人文地理',
    title: '世界上面积最小的国家',
    question: '世界上面积最小的国家是哪个？',
    answer: '梵蒂冈，面积约0.44平方公里',
    background: '梵蒂冈城国，简称梵蒂冈，是位于意大利首都罗马西北角高地的一个内陆城邦国家（国中国）。由于四面都与意大利接壤，故称"国中国"。它是全球领土面积最小、人口最少的国家，同时也是全世界天主教的中心。',
    funFacts: [
      '梵蒂冈面积约0.44平方公里，相当于约60个足球场，步行一圈约1小时',
      '梵蒂冈人口约800人，主要是神职人员，2023年梵蒂冈首次将女性纳入公民身份',
      '梵蒂冈是世界上唯一一个整个国家都被列为世界文化遗产的国家',
      '梵蒂冈有自己的货币、邮票、电台和军队（瑞士近卫队）'
    ],
    relatedRecords: ['largest-country', 'most-populous-country', 'tallest-building'],
    keywords: ['最小', '国家', '梵蒂冈', '国中国', '教皇', '天主教'],
    source: '吉尼斯世界纪录、梵蒂冈官方统计',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'most-populous-country',
    category: '人文地理',
    title: '世界上人口最多的国家',
    question: '世界上人口最多的国家是哪个？',
    answer: '印度（约14.28亿），2023年超过中国',
    background: '根据联合国数据，2023年4月印度人口达到14.28亿，正式超过中国成为世界上人口最多的国家。印度位于南亚次大陆，是世界四大文明古国之一。',
    funFacts: [
      '印度人口中年龄中位数约为28岁，是一个非常年轻的国家，约65%的人口年龄在35岁以下',
      '印度有超过22种官方语言，使用的语言总数超过1,600种',
      '印度铁路系统是世界上最大的雇主之一，员工超过130万人',
      '印度的电影产业（宝莱坞）每年生产约1,000部电影，是世界上最大的电影生产国'
    ],
    relatedRecords: ['largest-country', 'smallest-country', 'largest-city'],
    keywords: ['最多', '人口', '印度', '中国', '国家', '人口数'],
    source: '联合国人口司、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'volatile'
  },
  {
    id: 'fastest-animal',
    category: '生物世界',
    title: '世界上最快的动物',
    question: '世界上跑得最快的动物是什么？',
    answer: '猎豹，最高时速约112-120公里',
    background: '猎豹是一种大型猫科动物，主要分布在非洲和伊朗的部分地区。它是陆地上速度最快的动物，短跑最高时速可达112-120公里。猎豹的身体结构专为速度而设计：修长的腿、轻盈的体型、超大的鼻孔和肺部、可伸缩的爪（类似跑鞋的鞋钉）。',
    funFacts: [
      '猎豹可以在3秒内从0加速到100公里/小时，比大多数超级跑车还快',
      '虽然速度极快，但猎豹只能维持高速奔跑约300-400米，持续时间约20-30秒',
      '猎豹的脸上有两道黑色的"泪痕"，这可以帮助减少阳光的眩光，提升远距离视力',
      '与其他大型猫科动物不同，猎豹不会咆哮，而是发出类似鸟鸣的高频率叫声'
    ],
    relatedRecords: ['largest-animal', 'tallest-animal', 'slowest-animal'],
    keywords: ['最快', '速度', '动物', '猎豹', '跑步', '非洲'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-land-animal',
    category: '生物世界',
    title: '世界上最大的陆地动物',
    question: '世界上最大的陆地动物是什么？',
    answer: '非洲象，体重可达6吨以上，肩高约4米',
    background: '非洲象是现存最大的陆地哺乳动物，主要分布在撒哈拉以南的非洲地区。成年雄性非洲象肩高约3.2-4米，体重约4.7-6.048吨，有记录的最大个体重达10.4吨。大象拥有非常高的智商，具有复杂的情感和社会结构。',
    funFacts: [
      '大象是除人类外少数能在镜子中认出自己的动物，表明它们具有自我意识',
      '大象的记忆力非常好，能记住几十年前见过的其他大象和地方',
      '大象会为死去的同伴举行"葬礼"，它们会静静地围绕尸体站立，用鼻子触碰死者',
      '大象的怀孕期长达22个月，是所有哺乳动物中最长的'
    ],
    relatedRecords: ['largest-animal', 'tallest-animal', 'smartest-animal'],
    keywords: ['最大', '陆地', '动物', '大象', '非洲象', '哺乳动物'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'oldest-tree',
    category: '生物世界',
    title: '世界上最古老的树',
    question: '世界上最古老的树是哪棵？',
    answer: '玛士撒拉树，约4,855年（还有更老的克隆树）',
    background: '玛士撒拉是一棵位于美国加利福尼亚州怀特山脉的狐尾松，树龄约4,855年，是已知最老的单株非克隆树木。它的具体位置被美国林业局保密，以防止游客对其造成损害。而如果算上克隆群落（由同一根系生长的多株树），美国犹他州的潘多（Pando）山杨群落可能已有8万年历史。',
    funFacts: [
      '玛士撒拉树在公元前2832年左右发芽，比埃及金字塔还要古老',
      '狐尾松能在极其恶劣的环境中生存：海拔约3,000米、土壤贫瘠、气温极低、年降水量不足30厘米',
      '潘多山杨群落虽然每棵树的寿命只有约130年，但整个基因相同的群落已经存活了约8万年',
      '科学家通过数年轮（Dendrochronology）来确定树的年龄，狐尾松的年轮非常紧密'
    ],
    relatedRecords: ['tallest-tree', 'largest-tree', 'oldest-animal'],
    keywords: ['最老', '古老', '树', '狐尾松', '玛士撒拉', '潘多'],
    source: '吉尼斯世界纪录、《自然》杂志',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'tallest-tree',
    category: '生物世界',
    title: '世界上最高的树',
    question: '世界上最高的树是哪棵？',
    answer: '亥伯龙树（红杉），高度约115.92米',
    background: '亥伯龙是一棵位于美国加州红杉国家公园的海岸红杉，高度约115.92米（约380英尺），是目前已知世界上最高的活树。它于2006年被发现，估计树龄约600-800年。和玛士撒拉树一样，它的确切位置也被保密。',
    funFacts: [
      '亥伯龙树高115.92米，比自由女神像（93米）还要高',
      '红杉的树皮非常厚，可达30厘米以上，富含单宁酸，能抵抗火灾和病虫害',
      '红杉的木材非常轻且抗腐蚀，是极佳的建筑材料',
      '据记载，历史上还有更高的红杉和桉树，最高可达130米以上，但都已被砍伐'
    ],
    relatedRecords: ['largest-tree', 'oldest-tree', 'tallest-animal'],
    keywords: ['最高', '树', '红杉', '亥伯龙', '加州', '植物'],
    source: '吉尼斯世界纪录、《自然》杂志',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-desert',
    category: '地理自然',
    title: '世界上最大的沙漠',
    question: '世界上最大的沙漠是哪个？',
    answer: '南极荒漠，面积约1,420万平方公里（按降水定义）；按传统认知则是撒哈拉沙漠，约920万平方公里',
    background: '从地理学角度看，沙漠的定义是年降水量不足250毫米的地区。按此标准，南极大陆是世界上最大的沙漠。但在传统认知中，撒哈拉沙漠是世界最大的热沙漠，位于非洲北部，面积约920万平方公里，几乎与美国本土面积相当。',
    funFacts: [
      '撒哈拉沙漠白天最高温度可达58°C，但夜晚温度可降至0°C以下',
      '撒哈拉沙漠并不是一直都是沙漠，在约5,000-11,000年前，这里曾是一片绿洲，有河流、湖泊和丰富的动植物',
      '南极大陆是世界上最干燥、最寒冷、风最大的大陆，内陆地区年降水量不足50毫米，比撒哈拉还少',
      '撒哈拉沙漠的面积在不断扩大，自1920年以来已扩张了约10%'
    ],
    relatedRecords: ['coldest-place', 'hottest-place', 'largest-ocean'],
    keywords: ['最大', '沙漠', '撒哈拉', '南极', '干旱', '荒漠'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'coldest-place',
    category: '地理自然',
    title: '世界上最冷的地方',
    question: '世界上最冷的地方是哪里？',
    answer: '南极洲沃斯托克站，记录最低气温-89.2°C（1983年）',
    background: '沃斯托克站是俄罗斯在南极的一个科考站，1983年7月21日在这里记录到了-89.2°C的极端低温，这是地球上有记录以来的最低自然温度。而通过卫星遥感，南极穹顶A附近的地表温度曾低达-93.2°C，但由于没有地面站验证，未被正式列为纪录。',
    funFacts: [
      '在-89.2°C的温度下，二氧化碳会直接变成干冰，呼出来的气体会瞬间变成冰晶',
      '沃斯托克站下方约4,000米的冰层下，有一个与外界隔绝了至少1,500万年的冰下湖——沃斯托克湖',
      '科学家在沃斯托克湖的冰芯中发现了可能存在的微生物，这对寻找外星生命有重要启示',
      '南极冬季有长达4个月的极夜，气温在此期间持续下降'
    ],
    relatedRecords: ['hottest-place', 'largest-desert', 'highest-mountain'],
    keywords: ['最冷', '低温', '南极', '沃斯托克', '冰冻', '极寒'],
    source: '世界气象组织 WMO、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'hottest-place',
    category: '地理自然',
    title: '世界上最热的地方',
    question: '世界上最热的地方是哪里？',
    answer: '美国加州死亡谷，官方记录最高气温56.7°C（1913年）；近年伊朗卢特荒漠地表温度70.7°C',
    background: '关于世界最热的地方有多个说法。世界气象组织（WMO）官方认定的最高气温纪录是1913年7月10日在美国加州死亡谷记录的56.7°C。但通过卫星遥感数据，伊朗的卢特荒漠在2004-2009年间曾测得70.7°C的地表温度，是卫星记录到的最高地表温度。',
    funFacts: [
      '死亡谷的名字来自1849年的淘金热时期，一群人试图穿越山谷寻找金矿，结果多人遇难',
      '尽管极端炎热，死亡谷仍有许多独特的动植物，如沙漠大角羊、沙漠鱼等',
      '卢特荒漠的地表被黑色火山熔岩覆盖，吸热能力极强，这是温度极高的原因之一',
      '在如此高温下，人类如果没有适当防护，会在数小时内出现严重中暑甚至死亡'
    ],
    relatedRecords: ['coldest-place', 'largest-desert', 'deepest-trench'],
    keywords: ['最热', '高温', '死亡谷', '卢特', '沙漠', '气温'],
    source: '世界气象组织 WMO、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'tallest-building',
    category: '建筑工程',
    title: '世界上最高的建筑',
    question: '世界上最高的建筑是哪座？',
    answer: '哈利法塔，高828米，位于阿联酋迪拜',
    background: '哈利法塔（Burj Khalifa），原名迪拜塔，位于阿拉伯联合酋长国迪拜，高828米，共163层，2010年1月4日正式落成启用。它是目前世界上最高的人工建筑，拥有多项世界之最：最高的观景台、最高的餐厅、最快的电梯（时速64公里）等。',
    funFacts: [
      '哈利法塔的建造使用了约33万立方米的混凝土和约39,000吨钢筋，总重量超过50万吨',
      '电梯从1层到124层观景台仅需约60秒，速度达18米/秒（64.8公里/小时）',
      '哈利法塔在设计灵感上融合了阿拉伯建筑风格和沙漠之花"蜘蛛兰"的形态',
      '由于太高，哈利法塔底层和顶层的日落时间相差约3分钟'
    ],
    relatedRecords: ['tallest-statue', 'longest-bridge', 'largest-country'],
    keywords: ['最高', '建筑', '摩天楼', '哈利法塔', '迪拜', '大楼'],
    source: '吉尼斯世界纪录、世界高层建筑与都市人居学会 CTBUH',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'largest-continent',
    category: '地理自然',
    title: '世界上最大的洲',
    question: '世界上最大的洲是哪个？',
    answer: '亚洲，面积约4,457.9万平方公里',
    background: '亚洲是七大洲中面积最大、人口最多的一个洲，覆盖地球陆地总面积的29.4%。亚洲绝大部分地区位于北半球和东半球，与非洲的分界线为苏伊士运河，与欧洲的分界线为乌拉尔山脉、乌拉尔河、里海、大高加索山脉、黑海和土耳其海峡。',
    funFacts: [
      '亚洲人口超过47亿，占世界总人口的约60%',
      '世界上最高的十座山峰全部在亚洲，包括珠穆朗玛峰',
      '亚洲拥有世界最低点（死海，海拔-430.5米）和最高点（珠穆朗玛峰）',
      '亚洲是世界三大宗教（佛教、基督教、伊斯兰教）的发源地'
    ],
    relatedRecords: ['largest-country', 'most-populous-country', 'largest-ocean'],
    keywords: ['最大', '洲', '亚洲', '大陆', '面积', '欧亚'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'deepest-lake',
    category: '地理自然',
    title: '世界上最深的湖泊',
    question: '世界上最深的湖泊是哪个？',
    answer: '贝加尔湖，最深处约1,642米',
    background: '贝加尔湖位于俄罗斯东西伯利亚南部，是世界上最深、蓄水量最大的淡水湖。它的最深处约1,642米，平均深度744米，总蓄水量约23.6万亿立方米，占世界地表淡水总量的约20%。贝加尔湖形成于约2,500万年前，是世界上最古老的湖泊之一。',
    funFacts: [
      '贝加尔湖的淡水储量相当于北美洲五大湖的总和',
      '湖中有超过2,500种动植物，其中约80%是贝加尔湖特有物种，例如世界上唯一的淡水海豹——贝加尔海豹',
      '贝加尔湖湖水透明度极高，冬季结冰期可达5个月，冰层厚达1-2米',
      '科学家认为贝加尔湖是一个正在形成的大洋，两岸每年以约2厘米的速度分离'
    ],
    relatedRecords: ['deepest-trench', 'largest-ocean', 'highest-mountain'],
    keywords: ['最深', '湖泊', '贝加尔湖', '淡水', '俄罗斯', '湖水'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-waterfall',
    category: '地理自然',
    title: '世界上最大的瀑布',
    question: '世界上最大的瀑布是哪个？',
    answer: '按流量是尼亚加拉/伊瓜苏/维多利亚瀑布；按落差是安赫尔瀑布（979米）',
    background: '"最大瀑布"的定义取决于衡量标准。按流量：南美洲的伊瓜苏瀑布平均流量约1,756立方米/秒，非洲的维多利亚瀑布平均约1,088立方米/秒，北美的尼亚加拉瀑布平均约2,407立方米/秒。按落差：委内瑞拉的安赫尔瀑布（又称天使瀑布）落差979米，是世界上最高的不间断瀑布。按宽度：赞比亚和津巴布韦之间的维多利亚瀑布宽约1,708米。',
    funFacts: [
      '安赫尔瀑布是从飞行在云雾中的飞行员吉米·安赫尔在1935年首次发现的，电影《飞屋环游记》中的"天堂瀑布"灵感就来自这里',
      '尼亚加拉瀑布每秒流量的水可以填满约50个标准游泳池',
      '维多利亚瀑布被当地称为"雷鸣之雾"（Mosi-oa-Tunya），水雾可以上升到400米高，40公里外都能看到',
      '伊瓜苏瀑布由约275个大小瀑布组成，呈马蹄形排列'
    ],
    relatedRecords: ['deepest-trench', 'longest-river', 'highest-mountain'],
    keywords: ['最大', '瀑布', '尼亚加拉', '伊瓜苏', '维多利亚', '安赫尔'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'smartest-animal',
    category: '生物世界',
    title: '世界上最聪明的动物（除人类外）',
    question: '世界上最聪明的动物是什么（除人类外）？',
    answer: '通常认为是黑猩猩或海豚，但多种动物都表现出惊人的智慧',
    background: '衡量动物的智力非常复杂，不同动物在不同领域各有所长。黑猩猩能制造工具、使用符号语言、具有自我意识；宽吻海豚能在镜子中认出自己、理解抽象概念、拥有复杂的社会结构；乌鸦能使用甚至制造工具、具有惊人的记忆力；大象具有自我意识、能理解死亡、有复杂情感。',
    funFacts: [
      '日本的一只名叫Ayumu的黑猩猩在数字记忆测试中能在0.21秒内记住屏幕上出现的1-9的数字顺序，准确率超过人类',
      '海豚会给彼此起名字，通过独特的口哨声来识别个体',
      '新喀里多尼亚乌鸦会把树枝弯曲成钩状来掏出树洞中的虫子，还会使用多步工具链',
      '猪被认为是最聪明的家畜，能理解简单的符号语言，玩电子游戏，甚至比有些狗更聪明'
    ],
    relatedRecords: ['largest-animal', 'largest-land-animal', 'oldest-animal'],
    keywords: ['最聪明', '智慧', '动物', '黑猩猩', '海豚', '乌鸦'],
    source: 'IUCN 红色名录、《自然》杂志',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'smallest-country',
    category: '人文地理',
    title: '世界上最小的国家（已在前文列出）',
    question: '世界上面积最小的国家是？',
    answer: '梵蒂冈（见前文）',
    background: '（同smallest-country）',
    funFacts: ['（同smallest-country）'],
    relatedRecords: [],
    keywords: ['最小', '国家'],
    source: '吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'longest-mountain-range',
    category: '地理自然',
    title: '世界上最长的山脉',
    question: '世界上最长的山脉是哪个？',
    answer: '安第斯山脉，全长约7,000公里',
    background: '安第斯山脉位于南美洲的西岸，从北到南全长约7,000公里，是世界上最长的陆上山脉。它横跨委内瑞拉、哥伦比亚、厄瓜多尔、秘鲁、玻利维亚、智利和阿根廷七个国家。安第斯山脉中有许多海拔6,000米以上的山峰，其中最高峰是阿空加瓜山，海拔6,961米，也是西半球和南半球的最高峰。',
    funFacts: [
      '如果算上海底山脉，世界最长的是中洋脊，全长约8万公里，环绕地球一圈',
      '安第斯山脉是年轻的褶皱山脉，仍在不断升高，地震和火山活动频繁',
      '南美洲的的的喀喀湖位于安第斯山脉中，海拔3,812米，是世界上最高的可通航湖泊',
      '安第斯山脉是马铃薯、番茄、玉米、古柯等重要农作物的原产地'
    ],
    relatedRecords: ['highest-mountain', 'largest-continent', 'longest-river'],
    keywords: ['最长', '山脉', '安第斯', '山', '南美洲', '山峰'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-island',
    category: '地理自然',
    title: '世界上最大的岛屿',
    question: '世界上最大的岛屿是哪个？',
    answer: '格陵兰岛，面积约216.6万平方公里',
    background: '格陵兰岛是世界上最大的岛屿，位于北美洲东北部，北冰洋和大西洋之间，是丹麦的自治领地。格陵兰岛约80%的面积被冰雪覆盖，冰盖面积达181.3万平方公里，平均冰厚度为1.67公里。如果格陵兰岛的冰盖全部融化，全球海平面将上升约7.2米。',
    funFacts: [
      '格陵兰岛的名字"Greenland"（绿色的土地）是维京人红毛埃里克为了吸引移民而起的，实际上岛上大部分被冰雪覆盖',
      '格陵兰岛人口只有约5.6万，是世界上人口密度最低的地区之一',
      '格陵兰岛的冰层下有世界上最大的陨石坑之一，直径约31公里，形成于约5,800万年前',
      '夏季时，格陵兰岛会有极昼，太阳全天不落；冬季则有极夜'
    ],
    relatedRecords: ['smallest-country', 'largest-ocean', 'coldest-place'],
    keywords: ['最大', '岛屿', '格陵兰', '岛', '北极', '冰盖'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-city',
    category: '人文地理',
    title: '世界上最大的城市',
    question: '世界上最大的城市是哪个？',
    answer: '按人口（都市区）是日本东京，约3,700万人；按面积是中国重庆，约8.24万平方公里',
    background: '"最大城市"的定义取决于衡量标准。按都市区人口：日本东京-横滨都市圈人口约3,700万，是世界上人口最多的都市圈。按行政辖区面积：中国重庆市面积约8.24万平方公里，比很多国家还大。按城市建成区面积：纽约和东京通常位居前列。按GDP：东京和纽约位居世界前两位。',
    funFacts: [
      '东京都市圈的GDP超过4万亿美元，如果是一个国家，可以排在世界第8位左右',
      '东京的地铁系统是世界上最繁忙的，日均客流量超过800万人次，高峰时段会有专门的工作人员把人推进车厢',
      '重庆市虽然面积很大，但大部分是农村和山区，城市建成区面积约1,500平方公里',
      '世界上人口密度最高的城市是菲律宾马尼拉，每平方公里超过4万人'
    ],
    relatedRecords: ['most-populous-country', 'tallest-building', 'largest-country'],
    keywords: ['最大', '城市', '东京', '重庆', '人口', '都市'],
    source: '联合国人口司、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'volatile'
  },
  {
    id: 'smallest-bird',
    category: '生物世界',
    title: '世界上最小的鸟',
    question: '世界上最小的鸟是什么？',
    answer: '吸蜜蜂鸟，体长约5-6厘米，体重约1.6-2.6克',
    background: '吸蜜蜂鸟是世界上最小的鸟类，仅分布在古巴。雄性体长约5.5厘米，体重约1.6克，雌性稍大。它们的蛋只有咖啡豆大小，约占雌鸟体重的10%。吸蜜蜂鸟的翅膀每秒可拍打约80次，是唯一能够向后飞的鸟类。',
    funFacts: [
      '吸蜜蜂鸟的体重比一枚硬币还轻，它的巢只有核桃大小',
      '尽管体型极小，吸蜜蜂鸟的心脏每分钟跳动约1,200次，是人类的15倍',
      '吸蜜蜂鸟每天需要吸食相当于自身体重一半的花蜜来维持高速代谢',
      '蜂鸟是唯一可以悬停在空中和向后飞行的鸟，它们的飞行方式更接近昆虫'
    ],
    relatedRecords: ['largest-animal', 'fastest-animal', 'tallest-animal'],
    keywords: ['最小', '鸟', '蜂鸟', '吸蜜蜂鸟', '古巴', '飞'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-bird',
    category: '生物世界',
    title: '世界上最大的鸟',
    question: '世界上最大的鸟是什么？',
    answer: '非洲鸵鸟，身高可达2.8米，体重可达156公斤',
    background: '非洲鸵鸟是现存体型最大的鸟类，生活在非洲的沙漠和草原地带。虽然不会飞，但它们的奔跑速度可达每小时70公里，是陆地上跑得最快的鸟类。鸵鸟的蛋是现存所有鸟类中最大的，一个蛋约重1.4公斤，相当于约25-30个鸡蛋的重量。',
    funFacts: [
      '鸵鸟的眼睛是陆地动物中最大的，直径约5厘米，比它的大脑还大',
      '鸵鸟不会把头埋进沙子里，这个传说来自老普林尼的记载，其实是它们在筑巢时低头翻蛋',
      '鸵鸟的脚趾只有两个（其他鸟类通常有四个），这有助于它们高速奔跑',
      '鸵鸟的一脚可以踢死一只狮子，是它们最强有力的防御武器'
    ],
    relatedRecords: ['smallest-bird', 'fastest-animal', 'largest-land-animal'],
    keywords: ['最大', '鸟', '鸵鸟', '非洲', '不会飞', '奔跑'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'oldest-animal',
    category: '生物世界',
    title: '世界上最长寿的动物',
    question: '世界上最长寿的动物是什么？',
    answer: '格陵兰睡鲨，估计可存活400-500年；另有说"明"蛤活了507年',
    background: '格陵兰睡鲨是地球上已知最长寿的脊椎动物，通过放射性碳定年法测定，它们的寿命可达400-500年，性成熟年龄约150岁。而在无脊椎动物中，一只叫"明"的北极蛤（Ming）在2006年被科学家发现时已有507岁，但不幸的是科学家为了研究它而把它杀死了。',
    funFacts: [
      '格陵兰睡鲨的肉含有剧毒的氧化三甲胺，必须经过特殊处理才能食用（冰岛传统美食Hákarl就是经过发酵的鲨鱼肉）',
      '"明"蛤诞生于1499年，比莎士比亚出生还早5年，得名于它出生时中国处于明朝',
      '灯塔水母（Turritopsis dohrnii）被认为是"永生不死"的，因为它能从成年状态返回到幼年水螅体状态，理论上可以无限循环',
      '格陵兰睡鲨游泳速度只有每秒约0.3米，是最慢的鲨鱼之一'
    ],
    relatedRecords: ['oldest-tree', 'largest-animal', 'deepest-trench'],
    keywords: ['最长寿', '最老', '动物', '格陵兰睡鲨', '明蛤', '灯塔水母'],
    source: 'IUCN 红色名录、《自然》杂志',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'slowest-animal',
    category: '生物世界',
    title: '世界上最慢的哺乳动物',
    question: '世界上最慢的哺乳动物是什么？',
    answer: '三趾树懒，移动速度约0.24公里/小时',
    background: '三趾树懒是世界上移动最慢的哺乳动物，主要生活在中美洲和南美洲的热带雨林中。它们一生中90%的时间都挂在树上，甚至睡觉、交配、生产都是倒挂着的。树懒的移动速度极慢，平均每分钟约移动4米，每天只移动约40米。',
    funFacts: [
      '树懒每周才下树排泄一次，每次排便量可达体重的三分之一，这是它们最危险的时刻',
      '树懒的毛发中会生长绿藻，这使它们呈现绿色，帮助它们在树叶中伪装',
      '树懒的脖子有8-9块颈椎骨（大多数哺乳动物只有7块），可以让它们的头旋转270度',
      '尽管看起来很懒，树懒游泳却很快，它们是游泳健将，速度是爬行的3倍'
    ],
    relatedRecords: ['fastest-animal', 'tallest-animal', 'smartest-animal'],
    keywords: ['最慢', '速度', '动物', '树懒', '哺乳动物', '雨林'],
    source: 'IUCN 红色名录、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'smallest-ocean',
    category: '地理自然',
    title: '世界上最小的大洋',
    question: '世界上最小的大洋是哪个？',
    answer: '北冰洋，面积约1,475万平方公里',
    background: '北冰洋是世界五大洋中最小、最浅、最冷的大洋，大致以北极圈为中心，位于地球最北端。面积约1,475万平方公里，不到太平洋的10%。平均深度约1,038米，最深点为5,527米。北冰洋约三分之二的海面终年被海冰覆盖。',
    funFacts: [
      '北冰洋是世界上唯一可以步行跨越的大洋（在冰盖上）',
      '北极点位于北冰洋中，北极点上所有方向都是南方',
      '北冰洋的海冰正在快速减少，据预测可能在2050年左右夏季将完全无冰',
      '北冰洋下蕴藏着丰富的石油和天然气资源，估计占世界未开发油气资源的25%'
    ],
    relatedRecords: ['largest-ocean', 'deepest-trench', 'coldest-place'],
    keywords: ['最小', '大洋', '北冰洋', '北极', '海洋', '冰盖'],
    source: '联合国教科文组织海洋学委员会、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-planet',
    category: '天文宇宙',
    title: '太阳系中最大的行星',
    question: '太阳系中最大的行星是哪个？',
    answer: '木星，质量是其他七颗行星总和的2.5倍',
    background: '木星是太阳系八大行星中体积最大、自转最快的行星，从内向外的第五颗行星。它的质量为太阳的千分之一，但却是太阳系中其他七颗行星质量总和的2.5倍。木星主要由氢和氦组成，是一颗气态巨行星，没有明确的固体表面。',
    funFacts: [
      '木星的大红斑是一个持续了至少350年的巨大风暴，大小可以容纳2-3个地球',
      '木星有95颗已确认的卫星，其中木卫三（Ganymede）是太阳系中最大的卫星，甚至比水星还大',
      '木星的磁场强度是地球的14倍，是太阳系中最强的行星磁场',
      '如果你能站在木星表面（实际上不行，因为没有固体表面），你的体重将是地球上的约2.5倍'
    ],
    relatedRecords: ['smallest-planet', 'hottest-planet', 'tallest-building'],
    keywords: ['最大', '行星', '木星', '太阳系', '气态巨行星', '大红斑'],
    source: 'NASA、国际天文学联合会 IAU',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'smallest-planet',
    category: '天文宇宙',
    title: '太阳系中最小的行星',
    question: '太阳系中最小的行星是哪个？',
    answer: '水星，直径约4,879公里',
    background: '水星是太阳系八大行星中最小的一颗，也是离太阳最近的行星。直径约4,879公里，比月球（3,474公里）稍大，比木卫三和土卫六还小。水星公转周期约88天，自转周期约59天。',
    funFacts: [
      '水星表面昼夜温差极大，白天可达430°C，夜间可降至-180°C，温差超过600°C，是太阳系行星中最大的',
      '水星上没有大气，所以天空是黑色的，即使在白天也能看到星星',
      '水星的北极有永久阴影区，那里可能存在水冰',
      '2006年以前，冥王星被认为是第九大行星，也是最小的行星，但现在被归类为矮行星'
    ],
    relatedRecords: ['largest-planet', 'hottest-planet', 'oldest-tree'],
    keywords: ['最小', '行星', '水星', '太阳系', '距离太阳', '温差'],
    source: 'NASA、国际天文学联合会 IAU',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'hottest-planet',
    category: '天文宇宙',
    title: '太阳系中最热的行星',
    question: '太阳系中最热的行星是哪个？',
    answer: '金星，表面平均温度约462°C',
    background: '金星是太阳系八大行星中从内向外的第二颗行星。虽然水星离太阳更近，但金星浓密的大气层（主要是二氧化碳）产生了极端的温室效应，使金星成为太阳系中最热的行星，表面温度约462°C，比水星的白天还热。',
    funFacts: [
      '金星的大气压力约为地球的92倍，相当于在地球海底1公里深处的压力',
      '金星的云层主要由硫酸滴组成，会下硫酸雨，但由于地表高温，雨水在到达地面之前就被蒸发了',
      '金星是太阳系中自转最慢的行星，自转一圈需要243个地球日，而公转一圈只需要225个地球日——也就是说，金星上的一天比一年还长',
      '金星是夜空中最亮的行星，比天狼星（最亮的恒星）还亮15倍，中国古代称之为"太白金星"'
    ],
    relatedRecords: ['coldest-place', 'hottest-place', 'largest-planet'],
    keywords: ['最热', '行星', '金星', '太阳系', '温室效应', '温度'],
    source: 'NASA、国际天文学联合会 IAU',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'tallest-statue',
    category: '建筑工程',
    title: '世界上最高的雕像',
    question: '世界上最高的雕像是哪座？',
    answer: '印度团结雕像，高182米',
    background: '团结雕像（Statue of Unity）位于印度古吉拉特邦，是为了纪念印度独立运动领导人萨达尔·瓦拉巴伊·帕特尔而建造的。雕像高182米，2018年10月31日正式揭幕，是目前世界上最高的雕像。它的高度几乎是美国自由女神像（93米）的两倍。',
    funFacts: [
      '团结雕像内部有一个博物馆和一个观光平台，游客可以站在雕像的眼睛位置俯瞰全景',
      '雕像的设计能抵御时速约200公里的强风和6.5级地震',
      '排名第二的是中国河南的中原大佛，高153米',
      '雕像在建设过程中使用了约2.1万吨钢铁和1,850吨青铜'
    ],
    relatedRecords: ['tallest-building', 'largest-country', 'smallest-country'],
    keywords: ['最高', '雕像', '雕塑', '团结雕像', '印度', '建筑'],
    source: '吉尼斯世界纪录、各国官方公告',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'longest-bridge',
    category: '建筑工程',
    title: '世界上最长的桥',
    question: '世界上最长的桥是哪座？',
    answer: '中国丹昆特大桥（高铁桥），长164.851公里',
    background: '丹昆特大桥是京沪高速铁路丹阳至昆山段的一座特大铁路桥，全长164.851公里，是吉尼斯世界纪录认定的世界最长的桥梁。它于2011年6月30日随京沪高铁全线正式开通运营。而如果只算跨水大桥，世界最长的跨海大桥是中国的港珠澳大桥，全长55公里。',
    funFacts: [
      '丹昆特大桥由约4,500个900吨重的箱梁组成，建设了约10,000个桥墩',
      '港珠澳大桥连接香港、珠海和澳门，其中海底隧道长约6.7公里，是世界上最长的跨海沉管隧道',
      '世界上最高的桥梁是中国的北盘江大桥，桥面到谷底垂直高度565米，相当于200层楼高',
      '丹昆特大桥的长度约为英吉利海峡隧道（50.5公里）的3倍多'
    ],
    relatedRecords: ['tallest-building', 'tallest-statue', 'most-populous-country'],
    keywords: ['最长', '桥', '桥梁', '丹昆特大桥', '港珠澳大桥', '高铁'],
    source: '吉尼斯世界纪录、国际铁路联盟 UIC',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'largest-lake',
    category: '地理自然',
    title: '世界上最大的湖泊',
    question: '世界上最大的湖泊是哪个？',
    answer: '里海，面积约37.1万平方公里',
    background: '里海位于欧洲和亚洲的交界处，是世界上最大的湖泊（按面积计算），也是最大的咸水湖。它的面积约37.1万平方公里，与日本国土面积相当，比北美五大湖的总面积还大。里海在地理学上属性为"海迹湖"，它与黑海最后分离成为一个内陆湖泊，距今不过1.1万多年。',
    funFacts: [
      '如果按淡水湖计算，世界最大的淡水湖是北美五大湖中的苏必利尔湖，面积约8.2万平方公里',
      '里海的水位低于海平面约27米，它的水是咸的，盐度约为海洋的三分之一',
      '里海沿岸有5个国家：俄罗斯、哈萨克斯坦、土库曼斯坦、伊朗和阿塞拜疆',
      '里海拥有丰富的石油和天然气资源，也是世界上最大的鲟鱼和鱼子酱产地'
    ],
    relatedRecords: ['deepest-lake', 'largest-ocean', 'smallest-ocean'],
    keywords: ['最大', '湖泊', '里海', '咸水湖', '苏必利尔湖', '淡水湖'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-diamond',
    category: '珍宝矿物',
    title: '世界上最大的钻石',
    question: '世界上最大的钻石是哪颗？',
    answer: '库里南钻石，原石重3,106克拉（约621.35克）',
    background: '库里南钻石于1905年1月25日在南非的普雷米尔矿被发现，原石重3,106.75克拉（约621.35克），大小约等于一个成年男子的拳头。它被切割成9颗大钻和96颗小钻，其中最大的两颗是"库里南一世"（530.2克拉，又称非洲之星）和"库里南二世"（317.4克拉），目前分别镶嵌在英国国王的权杖和帝国王冠上。',
    funFacts: [
      '库里南钻石的名字来自矿山的主人托马斯·库里南爵士',
      '库里南一世（530.2克拉）是世界上最大的切割钻石，被称为"非洲之星"，镶嵌在英国君主的权杖上，保存在伦敦塔',
      '这颗钻石的总价值估计超过20亿美元',
      '发现这颗钻石的矿场经理拿到的奖金是一匹小马和一辆马车'
    ],
    relatedRecords: ['largest-gold', 'tallest-building', 'smallest-country'],
    keywords: ['最大', '钻石', '库里南', '宝石', '非洲之星', '英国王室'],
    source: '吉尼斯世界纪录、世界钻石协会',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'fastest-train',
    category: '科技交通',
    title: '世界上最快的火车',
    question: '世界上最快的火车是哪列？',
    answer: '中国CR450高速动车组（商业运营最高设计时速450公里）；试验纪录是日本L0系磁悬浮（603公里/小时）',
    background: '在商业运营领域，中国的复兴号CR400系列最高运营时速350公里，而2024年发布的CR450设计时速达450公里，是目前世界上最快的商业运营列车。在试验速度方面，日本的L0系超导磁悬浮列车在2015年创造了603公里/小时的世界纪录。中国的高速磁浮样车也在2021年成功试跑，设计时速600公里。',
    funFacts: [
      '中国高铁运营里程超过4.5万公里，占世界高铁总里程的三分之二以上',
      '日本的L0系磁悬浮列车使用超导磁铁，列车在轨道上方悬浮约10厘米，完全没有摩擦',
      'CR450的能耗仅为飞机的九分之一，是世界上最节能环保的高速交通工具之一',
      '磁悬浮列车的速度已经接近短程螺旋桨飞机的速度（约600-800公里/小时）'
    ],
    relatedRecords: ['fastest-animal', 'longest-bridge', 'tallest-building'],
    keywords: ['最快', '火车', '高铁', '磁悬浮', '复兴号', 'CR450'],
    source: '吉尼斯世界纪录、国际铁路联盟 UIC',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'largest-cave',
    category: '地理自然',
    title: '世界上最大的洞穴',
    question: '世界上最大的洞穴是哪个？',
    answer: '越南韩松洞，最大的单个洞穴空间长约5公里，高200米，宽150米',
    background: '韩松洞（Hang Son Doong）位于越南广平省的丰芽-格邦国家公园内，是目前已知世界上最大的天然洞穴。它长约9公里，有一段约5公里的地下洞穴通道，最高处约200米，最宽处约150米，大到足以容纳一整栋40层的摩天大楼。洞内有自己的河流、森林和气候系统。',
    funFacts: [
      '韩松洞直到1991年才被当地一名伐木工人偶然发现，2009年科学家才首次正式勘探',
      '洞内的石笋高达70米，是世界上最高的石笋之一',
      '由于洞穴太大，洞内会形成云雾，甚至有自己的微型天气系统',
      '每年只有约1000名游客可以进入韩松洞，需要徒步穿越丛林并涉水，整个探险行程约4天'
    ],
    relatedRecords: ['deepest-trench', 'highest-mountain', 'largest-desert'],
    keywords: ['最大', '洞穴', '山洞', '韩松洞', '越南', '地下'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  },
  {
    id: 'largest-gold',
    category: '珍宝矿物',
    title: '世界上最大的天然金块',
    question: '世界上最大的天然金块是哪块？',
    answer: '欢迎陌生人金块，重约78公斤（含金约72公斤），1869年发现于澳大利亚',
    background: '"欢迎陌生人"（Welcome Stranger）是有记录以来发现的最大的天然金块（狗头金），1869年2月5日由两位英国移民在澳大利亚维多利亚州莫利高尔附近发现。这块金块重约78公斤（2,520盎司），其中含金量约72公斤。它被发现时埋在地下仅3厘米处，靠近树根。',
    funFacts: [
      '"欢迎陌生人"金块被熔化后提炼出约72公斤纯金，按今天的金价计算价值约500万美元',
      '发现者获得了约9,381英镑的报酬，在当时是一笔巨款',
      '现存最大的天然金块是"戈尔德斯通金块"（Golden Eagle Nugget），重约28.4公斤，陈列在珀斯铸币厂',
      '19世纪的澳大利亚淘金热吸引了数十万移民，改变了这个国家的历史'
    ],
    relatedRecords: ['largest-diamond', 'tallest-building', 'smallest-country'],
    keywords: ['最大', '金块', '黄金', '狗头金', '欢迎陌生人', '澳大利亚'],
    source: '吉尼斯世界纪录、各博物馆官方数据',
    updatedAt: '2024-06',
    volatility: 'variable'
  },
  {
    id: 'most-spoken-language',
    category: '人文地理',
    title: '世界上使用人数最多的语言',
    question: '世界上使用人数最多的语言是哪种？',
    answer: '汉语（普通话），母语使用者约9.2亿人，总使用者约11.1亿人',
    background: '汉语是世界上母语使用人数最多的语言，其中普通话是中国的官方语言和标准语。如果按母语使用者算，排名前几位的语言是：汉语（约9.2亿）、西班牙语（约4.9亿）、英语（约3.8亿）。如果按总使用者（包括第二语言）算，英语以约15亿人位居第一。',
    funFacts: [
      '汉语是联合国六种官方语言之一（其他是英语、法语、西班牙语、俄语、阿拉伯语）',
      '汉语方言众多，包括粤语、闽南语、吴语、客家话等，有些方言之间的差异大于部分欧洲语言之间的差异',
      '英语是国际商务、科学、航空等领域最通用的语言',
      '全世界有超过7,000种语言，每两周就有一种语言消失'
    ],
    relatedRecords: ['most-populous-country', 'largest-country', 'largest-city'],
    keywords: ['最多', '语言', '汉语', '英语', '普通话', '使用人数'],
    source: '联合国人口司、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'volatile'
  },
  {
    id: 'tallest-waterfall',
    category: '地理自然',
    title: '世界上最高的瀑布',
    question: '世界上最高的瀑布是哪个？',
    answer: '安赫尔瀑布，落差979米',
    background: '安赫尔瀑布又称天使瀑布，位于委内瑞拉的圭亚那高原上，落差979米，是世界上落差最大的不间断瀑布。瀑布分为两级，先泻下807米落在一个岩架上，然后再跌落172米，落在山脚下一个宽152米的大水池内。瀑布所在的卡奈马国家公园是世界自然遗产。',
    funFacts: [
      '安赫尔瀑布是美国飞行员吉米·安赫尔在1935年寻找黄金时从空中发现的，瀑布因此得名',
      '由于瀑布周围被茂密的热带雨林包围，从地面很难看到瀑布全貌，通常只能从空中观赏',
      '皮克斯电影《飞屋环游记》中的"天堂瀑布"就是以安赫尔瀑布为原型创作的',
      '瀑布底部的水汽蒸发后在周围形成独特的生态环境'
    ],
    relatedRecords: ['largest-waterfall', 'deepest-trench', 'highest-mountain'],
    keywords: ['最高', '瀑布', '安赫尔', '天使瀑布', '落差', '委内瑞拉'],
    source: '联合国教科文组织、吉尼斯世界纪录',
    updatedAt: '2024-06',
    volatility: 'stable'
  }
];

@Injectable()
export class WorldRecordService {
  getAllRecords(): WorldRecord[] {
    return WORLD_RECORDS.filter(r => r.id !== 'smallest-country');
  }

  getCategories(): CategoryInfo[] {
    const categoryMap = new Map<string, { name: string; icon: string; description: string; count: number }>();
    const categoryConfig: Record<string, { icon: string; description: string }> = {
      '地理自然': { icon: '🌍', description: '地球山川湖海、气候地貌的奇迹' },
      '生物世界': { icon: '🦒', description: '动植物界的惊人纪录与奇特物种' },
      '人文地理': { icon: '🏛️', description: '国家城市、人口语言等人类文明纪录' },
      '建筑工程': { icon: '🏗️', description: '人类创造的建筑与工程奇迹' },
      '天文宇宙': { icon: '🌌', description: '太阳系行星与宇宙的壮丽奥秘' },
      '珍宝矿物': { icon: '💎', description: '珍贵宝石与稀有矿物的纪录' },
      '科技交通': { icon: '🚄', description: '科技发明与交通工具的突破' }
    };

    this.getAllRecords().forEach(record => {
      if (!categoryMap.has(record.category)) {
        const config = categoryConfig[record.category] || { icon: '📚', description: '其他知识类纪录' };
        categoryMap.set(record.category, { name: record.category, icon: config.icon, description: config.description, count: 0 });
      }
      const cat = categoryMap.get(record.category)!;
      cat.count++;
    });

    return Array.from(categoryMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      count: data.count,
      description: data.description
    }));
  }

  getRecordsByCategory(category: string): WorldRecord[] {
    return this.getAllRecords().filter(r => r.category === category);
  }

  getRandomRecords(count: number = 5): WorldRecord[] {
    const all = this.getAllRecords();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, all.length));
  }

  getRecordById(id: string): WorldRecord | undefined {
    return this.getAllRecords().find(r => r.id === id);
  }

  private normalize(text: string): string {
    return text.toLowerCase()
      .replace(/[？?。.,！!，、；;：:""''（）()【】\[\]《》]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateScore(question: string, record: WorldRecord): number {
    const normQ = this.normalize(question);
    let score = 0;

    const titleNorm = this.normalize(record.title);
    if (titleNorm === normQ) score += 100;
    if (titleNorm.includes(normQ) || normQ.includes(titleNorm)) score += 60;

    if (record.question && this.normalize(record.question) === normQ) score += 80;
    if (record.question && (this.normalize(record.question).includes(normQ) || normQ.includes(this.normalize(record.question)))) score += 50;

    const qWords = normQ.split(' ').filter(w => w.length > 0);
    record.keywords.forEach(keyword => {
      const normKeyword = this.normalize(keyword);
      if (normKeyword && (normQ.includes(normKeyword) || normKeyword.includes(normQ))) {
        score += 25;
      }
      qWords.forEach(w => {
        if (normKeyword.includes(w) || w.includes(normKeyword)) {
          if (w.length >= 2) score += 10;
        }
      });
    });

    const answerNorm = this.normalize(record.answer);
    if (answerNorm.includes(normQ)) score += 15;

    const backgroundNorm = this.normalize(record.background);
    qWords.forEach(w => {
      if (w.length >= 2 && backgroundNorm.includes(w)) {
        score += 3;
      }
    });

    return score;
  }

  ask(question: string): WorldRecordAnswer {
    const trimmed = question.trim();
    if (!trimmed) {
      return {
        found: false,
        message: '请输入您的问题，例如"世界上最深的海沟是哪里"或"世界上最大的动物是什么"',
        knowledgeVersion: KNOWLEDGE_VERSION
      };
    }

    const scoredRecords = this.getAllRecords().map(record => ({
      record,
      score: this.calculateScore(trimmed, record)
    })).sort((a, b) => b.score - a.score);

    if (scoredRecords.length === 0) {
      return { found: false, message: '知识库中暂无数据', knowledgeVersion: KNOWLEDGE_VERSION };
    }

    const topMatch = scoredRecords[0];

    if (topMatch.score >= 40) {
      return {
        found: true,
        record: topMatch.record,
        category: topMatch.record.category,
        knowledgeVersion: KNOWLEDGE_VERSION
      };
    }

    const suggestions = scoredRecords
      .filter(r => r.score > 5)
      .slice(0, 5)
      .map(r => r.record);

    if (suggestions.length === 0) {
      const random = this.getRandomRecords(3);
      return {
        found: false,
        message: `抱歉，没有找到与"${trimmed}"相关的世界之最知识。您可以试试更通用的提问，比如包含"最高"、"最大"、"最深"等关键词。`,
        suggestions: random,
        knowledgeVersion: KNOWLEDGE_VERSION
      };
    }

    return {
      found: false,
      message: `没有找到与"${trimmed}"完全匹配的结果，以下是一些相关的世界之最知识，可能对您有帮助：`,
      suggestions,
      knowledgeVersion: KNOWLEDGE_VERSION
    };
  }
}
