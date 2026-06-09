import { Injectable } from '@nestjs/common';

export type DiscourseStyle =
  | 'solemn'        // 严肃沉郁：苦难文学、存在主义
  | 'magical'       // 魔幻诗意：魔幻现实主义、奇幻
  | 'gentle'        // 温柔细腻：青春文学、治愈系
  | 'profound'      // 深邃哲思：哲学小说、寓言
  | 'classical'     // 典雅厚重：古典文学、历史小说
  | 'grand'         // 宏大冷峻：科幻、史诗
  | 'scholarly'     // 平实严谨：学术、社会学
  | 'melancholic';  // 华丽忧伤：爵士时代、都市感伤

export interface BookInfo {
  title: string;
  author: string;
  authorNationality?: string;
  year?: string;
  genre: string[];
  originalLanguage?: string;
  summary: string;
  themes: string[];
  iconicQuotes: { quote: string; character?: string; chapter?: string }[];
  readingTips: string[];
  similarBooks: { title: string; author: string; reason: string }[];
  tags: string[];
  difficulty: '入门' | '进阶' | '挑战';
  emotionalTone: string;
  discourseStyle: DiscourseStyle;
}

interface StyleConfig {
  greeting: string[];
  themeIntro: string;
  quoteIntro: string;
  tipIntro: string;
  closing: string[];
  emoji: {
    book: string;
    theme: string;
    quote: string;
    tip: string;
    closing: string;
  };
  emphasisMarkers: { start: string; end: string };
  discussionTone: 'deep' | 'warm' | 'rational' | 'poetic';
}

export interface LiteratureMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  relatedBooks?: BookInfo[];
  discussionPoints?: string[];
  recommendedBooks?: { title: string; author: string; reason: string }[];
}

export interface AskResponse {
  answer: string;
  relatedBooks: BookInfo[];
  discussionPoints: string[];
  recommendedBooks: { title: string; author: string; reason: string }[];
  style: DiscourseStyle;
}

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  bookTitles?: string[];
  recommendedBooks?: { title: string; author: string; reason: string }[];
  discussionPoints?: string[];
  style: DiscourseStyle;
}

const BOOK_DATABASE: BookInfo[] = [
  {
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    authorNationality: '哥伦比亚',
    year: '1967',
    genre: ['魔幻现实主义', '长篇小说', '家族史诗'],
    originalLanguage: '西班牙语',
    summary: '《百年孤独》讲述了布恩迪亚家族七代人在马孔多小镇的兴衰史。从何塞·阿尔卡蒂奥·布恩迪亚建立马孔多开始，这个家族在百年间经历了战争、爱情、背叛、疯狂与孤独，最终整个家族和小镇一起从地球上消失，如同从未存在过。小说融合了现实与魔幻，交织着政治、神话与家族命运，被誉为"再现拉丁美洲历史社会图景的鸿篇巨著"。',
    themes: ['孤独的本质与循环', '时间的主观性与轮回', '家族命运与宿命论', '魔幻与现实的边界', '文明与野蛮的冲突', '爱情与欲望的悲剧'],
    iconicQuotes: [
      { quote: '多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。', chapter: '开篇' },
      { quote: '生命中曾经有过的所有灿烂，原来终究，都需要用寂寞来偿还。' },
      { quote: '过去都是假的，回忆是一条没有归途的路，以往的一切春天都无法复原，即使最狂乱且坚韧的爱情，归根结底也不过是一种瞬息即逝的现实，唯有孤独永恒。' },
    ],
    readingTips: [
      '建议准备一张家族人物关系图，七代人的名字高度重复，容易混淆',
      '不必执着于"魔幻"与"现实"的界限，享受马尔克斯创造的独特叙事氛围',
      '注意"孤独"在不同人物身上的不同表现形式——有的是逃避，有的是封闭，有的是疯狂',
      '小说的开头是理解全书的钥匙，首尾呼应的结构设计精妙',
    ],
    similarBooks: [
      { title: '霍乱时期的爱情', author: '加西亚·马尔克斯', reason: '同作者作品，同样融合魔幻与爱情，时间跨度更长' },
      { title: '小径分岔的花园', author: '博尔赫斯', reason: '同样探讨时间、命运与文学迷宫，更凝练深邃' },
      { title: '佩德罗·巴拉莫', author: '胡安·鲁尔福', reason: '魔幻现实主义先驱之作，亡灵叙事的经典' },
    ],
    tags: ['魔幻现实主义', '诺奖作品', '拉美文学', '经典必读', '家族史诗'],
    difficulty: '挑战',
    emotionalTone: '苍凉而诗意，在宏大的时间长河中体味个体的孤独与命运的轮回',
    discourseStyle: 'magical',
  },
  {
    title: '活着',
    author: '余华',
    authorNationality: '中国',
    year: '1993',
    genre: ['现实主义', '长篇小说', '当代文学'],
    summary: '《活着》讲述了农村人福贵悲惨的人生遭遇。福贵本是个纨绔子弟，嗜赌成性，终于赌光了家业一贫如洗。穷困之中的福贵因为母亲生病前去求医，没想到半路上被国民党部队抓了壮丁，后被解放军所俘虏，回到家乡才知道母亲已经过世，妻子家珍含辛茹苦带大了一双儿女，但女儿不幸变成了聋哑人。然而，真正的悲剧从此才开始渐次上演——儿子有庆被抽血致死，女儿凤霞难产而死，女婿二喜被水泥板夹死，外孙苦根吃豆子撑死……生命里难得的温情将被一次次死亡撕扯得粉碎，只剩得老了的福贵伴随着一头老牛在阳光下回忆。',
    themes: ['苦难与生存意志', '生命的韧性与尊严', '命运的无常与残酷', '亲情的力量', '活着本身的意义'],
    iconicQuotes: [
      { quote: '人是为活着本身而活着，而不是为了活着之外的任何事物而活着。' },
      { quote: '活着是为了活着本身，而不是为了活着之外的任何事物。' },
      { quote: '少年去游荡，中年想掘藏，老年做和尚。' },
    ],
    readingTips: [
      '做好心理准备，这本书的悲剧浓度很高，阅读过程中可能会流泪',
      '注意福贵的叙述语言——平实、质朴、没有华丽辞藻，正是这种"零度叙事"让苦难更有力量',
      '思考：为什么余华选择让福贵活下来，而不是死去？这背后的生命哲学是什么？',
      '可以和电影版对比阅读，张艺谋的改编有很多精彩的再创造',
    ],
    similarBooks: [
      { title: '许三观卖血记', author: '余华', reason: '同作者，同样以平凡人物的苦难展现生存的力量' },
      { title: '平凡的世界', author: '路遥', reason: '同样书写普通人在时代洪流中的坚韧与奋斗' },
      { title: '白鹿原', author: '陈忠实', reason: '同样是家族命运与时代变迁交织的史诗' },
    ],
    tags: ['当代中国文学', '苦难叙事', '生命哲学', '畅销经典', '茅盾文学奖'],
    difficulty: '入门',
    emotionalTone: '沉重却温暖，在极致的苦难中开出一朵名为"活着"的花',
    discourseStyle: 'solemn',
  },
  {
    title: '挪威的森林',
    author: '村上春树',
    authorNationality: '日本',
    year: '1987',
    genre: ['青春文学', '爱情小说', '都市文学'],
    summary: '《挪威的森林》以主人公渡边彻的视角，讲述了他与两位女孩之间的情感纠葛。温柔娴静的直子是他高中好友木月的恋人，木月的自杀让两人之间产生了微妙的羁绊；而活泼开朗的小林绿子则像是照进他阴郁生活的一缕阳光。小说通过渡边在爱与性、生与死、责任与自由之间的挣扎，探讨了现代人的孤独、疏离与对爱的渴望。',
    themes: ['青春的迷茫与成长', '爱与性的纠葛', '死亡与存在', '都市人的孤独', '记忆与遗忘'],
    iconicQuotes: [
      { quote: '死并非生的对立面，而是作为生的一部分永存。' },
      { quote: '不要同情自己，同情自己是卑劣懦夫干的勾当。' },
      { quote: '哪里会有人喜欢孤独，不过是不喜欢失望罢了。' },
    ],
    readingTips: [
      '这不是一本"言情小说"，不要用爱情故事的期待去读它',
      '直子和绿子可以看作渡边（也是我们每个人）内心的两个面向——一个沉湎于过去与死亡，一个面向未来与生命',
      '注意书中反复出现的"井"的意象，它象征着什么？',
      '可以搭配甲壳虫乐队的《Norwegian Wood》一起阅读，感受那种忧伤而温柔的氛围',
    ],
    similarBooks: [
      { title: '海边的卡夫卡', author: '村上春树', reason: '同作者，同样探讨青春、孤独与自我寻找，多了魔幻色彩' },
      { title: '且听风吟', author: '村上春树', reason: '村上春树处女作，青春迷茫主题的源头' },
      { title: '挪威的森林', author: '菲茨杰拉德', reason: '原名《了不起的盖茨比》，同样书写繁华背后的空虚与幻灭' },
    ],
    tags: ['日本文学', '青春小说', '都市孤独', '畅销百万', '文艺青年必读'],
    difficulty: '入门',
    emotionalTone: '忧郁而温柔，像雨后的下午，在回忆中轻轻叹息',
    discourseStyle: 'gentle',
  },
  {
    title: '红楼梦',
    author: '曹雪芹',
    authorNationality: '中国',
    year: '清代（约1791年程高本刊行）',
    genre: ['古典小说', '世情小说', '章回体'],
    summary: '《红楼梦》以贾、史、王、薛四大家族的兴衰为背景，以贾宝玉和林黛玉、薛宝钗的爱情婚姻悲剧为主线，刻画了以金陵十二钗为代表的众多个性鲜明的女性形象，展现了封建社会末期的人生百态和制度危机。小说被誉为"中国古典小说的巅峰之作"，"中国封建社会的百科全书"。',
    themes: ['爱情与婚姻的悲剧', '家族兴衰与历史轮回', '女性命运与男权社会', '人生如梦与色空观念', '封建制度的腐朽与崩溃'],
    iconicQuotes: [
      { quote: '满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味。', chapter: '第一回' },
      { quote: '假作真时真亦假，无为有处有还无。', chapter: '太虚幻境对联' },
      { quote: '一个是阆苑仙葩，一个是美玉无瑕。', character: '《枉凝眉》' },
      { quote: '寒塘渡鹤影，冷月葬花魂。', character: '史湘云、林黛玉联句' },
    ],
    readingTips: [
      '初次阅读建议从程高本一百二十回本入手，熟悉故事后再读脂批本',
      '人物众多，建议对照人物关系表阅读，特别注意"玉"字辈和"春"字辈',
      '诗词歌赋是理解人物命运和主题的重要线索，不要跳过',
      "第三回林黛玉进贾府、第二十七回黛玉葬花、第三十三回宝玉挨打、第九十七回黛玉焚稿都是名场面，值得精读",
    ],
    similarBooks: [
      { title: '金瓶梅', author: '兰陵笑笑生', reason: '世情小说的另一座高峰，《红楼梦》深受其影响' },
      { title: '源氏物语', author: '紫式部', reason: '日本古典文学巅峰，同样以细腻笔触描绘贵族男女的命运' },
      { title: '牡丹亭', author: '汤显祖', reason: '同样书写至情至性，"情不知所起，一往而深"' },
    ],
    tags: ['四大名著', '古典文学巅峰', '红学', '封建社会百科全书', '中华文化瑰宝'],
    difficulty: '进阶',
    emotionalTone: '繁华落尽的悲凉，在锦绣丛中读出人世的沧桑与无常',
    discourseStyle: 'classical',
  },
  {
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    authorNationality: '美籍阿富汗',
    year: '2003',
    genre: ['成长小说', '历史小说', '当代文学'],
    summary: '12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而，在一场风筝比赛后，发生了一件悲惨的事，阿米尔为自己的懦弱感到自责和痛苦，逼走了哈桑。不久，阿富汗政变爆发，他与父亲逃亡美国。成年后的阿米尔始终无法原谅自己当年对哈桑的背叛。为了赎罪，他再度踏上了阔别二十多年的故乡，发现了一个惊天谎言……这是一个关于友谊、背叛、救赎与爱的故事。',
    themes: ['友谊与背叛', '赎罪与救赎', '成长的代价', '战争与人性', '父子关系', '阶层与身份'],
    iconicQuotes: [
      { quote: '为你，千千万万遍。', character: '哈桑' },
      { quote: '许多年过去了，人们说陈年旧事可以被埋葬，然而我终于明白这是错的，因为往事会自行爬上来。' },
      { quote: '得到了再失去，总是比从来就没有得到更伤人。' },
    ],
    readingTips: [
      '"风筝"是全书最重要的意象——它既是童年的友谊，也是救赎的希望，更是对自由的追逐',
      '前半段的阿富汗与后半段的美国形成鲜明对比，空间的转换也是主人公内心的转变',
      '注意阿米尔和哈桑、阿米尔和他父亲、阿米尔和索拉博这三组关系的呼应',
      '这是胡赛尼的处女作，阅读后可以继续读他的《灿烂千阳》《群山回唱》，构成"阿富汗三部曲"',
    ],
    similarBooks: [
      { title: '灿烂千阳', author: '卡勒德·胡赛尼', reason: '同作者，同样以阿富汗为背景，聚焦两位女性的命运' },
      { title: '群山回唱', author: '卡勒德·胡赛尼', reason: '同作者，阿富汗主题终章，更宏大的时间跨度' },
      { title: '芒果街上的小屋', author: '桑德拉·希斯内罗丝', reason: '同样书写移民记忆与成长的诗化小说' },
    ],
    tags: ['成长救赎', '阿富汗文学', '全球畅销书', '改编电影', '友谊与背叛'],
    difficulty: '入门',
    emotionalTone: '温暖而刺痛，在人性的懦弱与勇敢之间，看见救赎的光',
    discourseStyle: 'gentle',
  },
  {
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    authorNationality: '法国',
    year: '1943',
    genre: ['童话', '哲理小说', '寓言'],
    summary: '一位飞行员在撒哈拉沙漠中遇到了来自B-612号小行星的小王子。小王子向飞行员讲述了他在各个星球旅行的见闻——他遇见了国王、爱慕虚荣的人、酒鬼、商人、点灯人和地理学家，最后来到地球。在地球上，他与狐狸相遇，懂得了"驯养"的意义，也明白了他对那朵独一无二的玫瑰的爱。这是一本写给"曾经是孩子的大人"的童话，用最简单的语言讲述最深刻的人生哲理。',
    themes: ['童真与成人世界的异化', '爱的真谛与驯养', '孤独与友谊', '物质与精神的价值', '责任与忠诚'],
    iconicQuotes: [
      { quote: '所有的大人都曾经是小孩，虽然，只有少数的人记得。' },
      { quote: '真正重要的东西，用眼睛是看不见的，只有用心才能看清。', character: '狐狸' },
      { quote: '你在你的玫瑰花身上耗费的时间，使得你的玫瑰花变得如此重要。', character: '狐狸' },
    ],
    readingTips: [
      '这不是一本"儿童读物"，甚至可以说它主要是写给成年人的',
      '每个星球上遇到的人物都是现实世界某种成人的缩影——权力欲、虚荣、贪婪、教条……',
      '"狐狸"那段关于"驯养"的对话是全书的哲学核心，值得反复品味',
      '建议每隔几年重读一次，不同年龄会读出完全不同的感受',
    ],
    similarBooks: [
      { title: '夏洛的网', author: 'E·B·怀特', reason: '同样是写给所有人的童话，关于友谊与生命的意义' },
      { title: '牧羊少年奇幻之旅', author: '保罗·柯艾略', reason: '同样是寓言式的旅程，关于寻找与天命' },
      { title: '夜航', author: '圣-埃克苏佩里', reason: '同作者作品，更真实的飞行经历与哲思' },
    ],
    tags: ['世界经典', '哲理童话', '全年龄阅读', '全球销量过亿', '法语文学'],
    difficulty: '入门',
    emotionalTone: '纯净而深邃，像夜空中最温柔的那颗星',
    discourseStyle: 'profound',
  },
  {
    title: '局外人',
    author: '阿尔贝·加缪',
    authorNationality: '法国',
    year: '1942',
    genre: ['存在主义', '中篇小说', '哲学小说'],
    summary: '《局外人》的主人公默尔索在母亲去世的葬礼上没有流泪，不久后，他在海滩上因为阳光的刺眼而失手开枪打死了一个阿拉伯人。在法庭上，所有人关心的不是他的杀人行为本身，而是他在母亲葬礼上的冷漠——他被指控"怀着一颗犯罪的心埋葬了母亲"，最终被判处死刑。小说通过默尔索这个"局外人"的视角，揭示了现代社会的荒诞与虚伪，以及存在本身的意义问题。',
    themes: ['存在的荒诞', '社会规范与个体真实', '死刑与司法制度的虚伪', '冷漠与激情', '死亡面前的真实'],
    iconicQuotes: [
      { quote: '今天，妈妈死了。也许是昨天，我不知道。', chapter: '开篇' },
      { quote: '我一直都觉得，人生在世，永远也不该演戏作假。' },
      { quote: '我想，我没有权利去打断他，也没有权利去告诉他，他其实是在白费力气。' },
    ],
    readingTips: [
      '开篇第一句话就奠定了全书的基调——默尔索的冷漠不是无情，而是拒绝演戏',
      '"阳光"是一个重要的意象，从葬礼到海滩杀人，阳光多次出现，它是推动默尔索行动的非理性力量',
      '可以搭配加缪的哲学随笔《西西弗斯神话》一起读，更能理解"荒诞"的哲学内涵',
      '思考：默尔索到底是"局外人"，还是唯一诚实的人？',
    ],
    similarBooks: [
      { title: '鼠疫', author: '阿尔贝·加缪', reason: '同作者，荒诞哲学的另一代表作，更具正面反抗精神' },
      { title: '恶心', author: '萨特', reason: '存在主义文学的另一经典，探讨存在的偶然性' },
      { title: '变形记', author: '卡夫卡', reason: '同样书写现代人的异化与荒诞感' },
    ],
    tags: ['存在主义', '诺贝尔文学奖', '法国文学', '哲学入门必读', '荒诞文学'],
    difficulty: '进阶',
    emotionalTone: '冷静到刺骨，在阳光下直视荒诞，在死亡中寻找真实',
    discourseStyle: 'solemn',
  },
  {
    title: '三体',
    author: '刘慈欣',
    authorNationality: '中国',
    year: '2008（第一部）',
    genre: ['硬科幻', '长篇小说', '太空歌剧'],
    summary: '《三体》三部曲（《三体》《三体Ⅱ：黑暗森林》《三体Ⅲ：死神永生》）讲述了地球文明与三体文明之间的宇宙博弈。文化大革命时期，天文学家叶文洁向宇宙发出信号，被三体文明接收。三体人因母星生存危机决定入侵地球。人类在恐惧与希望中建立了面壁计划、阶梯计划等应对策略，但最终的宇宙图景远超人类想象——宇宙是一座黑暗森林，每个文明都是带枪的猎人。',
    themes: ['宇宙社会学与黑暗森林法则', '人类文明的命运', '科学与道德的边界', '个体牺牲与集体利益', '时间的尺度与文明的渺小'],
    iconicQuotes: [
      { quote: '不要回答！不要回答！不要回答！' },
      { quote: '弱小和无知不是生存的障碍，傲慢才是。' },
      { quote: '给岁月以文明，而不是给文明以岁月。' },
      { quote: '宇宙就是一座黑暗森林，每个文明都是带枪的猎人。', character: '罗辑' },
    ],
    readingTips: [
      '第一部节奏较慢，铺垫很多，坚持读到三体游戏和"古筝行动"就会渐入佳境',
      '第二部《黑暗森林》是公认的系列巅峰，"黑暗森林法则"是整个三部曲的理论基石',
      '第三部《死神永生》格局最大，阅读时需要适应从太阳系到整个宇宙的尺度跃迁',
      '如果对物理学概念感到困惑，可以结合网上的科普解读辅助阅读，但不要被剧透',
    ],
    similarBooks: [
      { title: '黑暗的左手', author: '厄休拉·K·勒古恩', reason: '同样探讨异文明接触与人类本质，女性视角的科幻经典' },
      { title: '基地', author: '艾萨克·阿西莫夫', reason: '同样是文明兴衰的宏大叙事，科幻文学的奠基之作' },
      { title: '球状闪电', author: '刘慈欣', reason: '同作者，三体之前的作品，可以看作三体的某种精神前传' },
    ],
    tags: ['雨果奖', '中国科幻巅峰', '硬科幻', '宇宙社会学', '现象级作品'],
    difficulty: '进阶',
    emotionalTone: '宏大而冷酷，在宇宙的尺度下审视人类文明的渺小与伟大',
    discourseStyle: 'grand',
  },
  {
    title: '了不起的盖茨比',
    author: 'F·斯科特·菲茨杰拉德',
    authorNationality: '美国',
    year: '1925',
    genre: ['现代主义', '中篇小说', '爵士时代文学'],
    summary: '20世纪20年代的纽约长岛，神秘富豪杰伊·盖茨比经常在自己的豪宅举办盛大宴会，却无人知道他的来历。邻居尼克逐渐了解到，盖茨比年轻时是一个贫穷的军官，他爱上了富家女黛西，但黛西嫁给了富家子弟汤姆。盖茨比通过非法手段暴富，买下豪宅就是为了吸引对岸的黛西注意。然而，当他终于与黛西重燃旧情，等待他的却是一个幻灭的结局……',
    themes: ['美国梦的幻灭', '金钱与爱情', '旧贵族与新贵的冲突', '记忆中的完美与现实的残酷', '爵士时代的浮华与空虚'],
    iconicQuotes: [
      { quote: '于是我们奋力前行，小舟逆水而上，不断地被推回到过去。', chapter: '结尾' },
      { quote: '每当你想要批评任何人的时候，你就记住，这个世界上并不是所有人都拥有你那些优越条件。', chapter: '开篇' },
      { quote: '他把他的梦幻看得那么高，以致连她也无法企及了。' },
    ],
    readingTips: [
      '"绿灯"是全书最重要的意象——它既是黛西码头的灯光，也是盖茨比的梦想，更是美国梦本身',
      '叙述者尼克是理解这本书的关键——他既是参与者，又是旁观者，他的态度在认同和疏离之间摇摆',
      '注意"东卵"和"西卵"的象征意义——旧贵族和新贵的地理分野也是社会阶层的分界线',
      '这本书篇幅不长但极为精致，建议精读，每一遍都会有新的发现',
    ],
    similarBooks: [
      { title: '太阳照常升起', author: '欧内斯特·海明威', reason: '同为"迷惘的一代"代表作，同样书写战后青年的幻灭' },
      { title: '夜色温柔', author: '菲茨杰拉德', reason: '同作者，同样描写富人群体的爱情与衰落' },
      { title: '美国悲剧', author: '西奥多·德莱塞', reason: '同样探讨美国梦的黑暗面与阶层鸿沟' },
    ],
    tags: ['美国文学经典', '爵士时代', '迷惘的一代', '美国梦的幻灭', '诺奖遗珠'],
    difficulty: '入门',
    emotionalTone: '华丽而忧伤，在爵士时代的香槟泡沫中，看见梦想碎成星光',
    discourseStyle: 'melancholic',
  },
  {
    title: '乡土中国',
    author: '费孝通',
    authorNationality: '中国',
    year: '1948',
    genre: ['社会学', '人类学', '学术随笔'],
    summary: '《乡土中国》是费孝通先生对中国基层社会结构的经典分析。他从乡村社区、文化传递、家族制度、道德观念、权力结构、社会规范、社会变迁等多个方面，深入剖析了中国乡土社会的特点，提出了"差序格局""礼治秩序""长老统治"等一系列重要概念，帮助我们理解中国人行为方式背后的深层文化逻辑。',
    themes: ['差序格局与团体格局的对比', '礼治与法治的差异', '家族制度与男女有别', '血缘与地缘的关系', '乡土社会的变迁'],
    iconicQuotes: [
      { quote: '中国社会是乡土性的。' },
      { quote: '我们的格局不是一捆一捆扎清楚的柴，而是好像把一块石头丢在水面上所发生的一圈圈推出去的波纹。每个人都是他社会影响所推出去的圈子的中心。' },
      { quote: '礼并不是靠一个外在的权力来推行的，而是从教化中养成了个人的敬畏之感，使人服膺；人服礼是主动的。' },
    ],
    readingTips: [
      '这是一本学术著作，但语言平实通俗，任何人都能读懂',
      '"差序格局"是理解中国人社会关系的钥匙，对照自己的生活经验去读会特别有共鸣',
      '可以和当下中国社会对照阅读——70多年过去了，哪些特点还在，哪些已经改变？',
      '建议搭配费孝通的另一本《江村经济》一起读，理论与田野调查互相印证',
    ],
    similarBooks: [
      { title: '江村经济', author: '费孝通', reason: '同作者，《乡土中国》的田野调查基础，更具体的乡村生活图景' },
      { title: '金翼', author: '林耀华', reason: '同样是中国社会学经典，以小说笔法书写家族兴衰' },
      { title: '皇权与绅权', author: '费孝通 吴晗 等', reason: '理解中国传统社会权力结构的必读之作' },
    ],
    tags: ['社会学经典', '理解中国', '学术入门', '费孝通', '中国社会结构'],
    difficulty: '入门',
    emotionalTone: '平实而深刻，用最朴素的语言道出中国社会最深层的结构',
    discourseStyle: 'scholarly',
  },
];

const STYLE_CONFIGS: Record<DiscourseStyle, StyleConfig> = {
  solemn: {
    greeting: [
      '谈起《{title}》，我的语气会不自觉地沉下来——这不是一本可以轻松翻阅的书。',
      '说到《{title}》，我想先停下来，认真地和你聊聊。',
      '每次重读《{title}》，都需要一些勇气。让我们慢慢走进它。',
    ],
    themeIntro: '它叩问的是这些人生的根本问题：',
    quoteIntro: '书中那些沉重的句子，每一个字都需要慢慢咀嚼：',
    tipIntro: '读这样的书，不必急于翻页。给你几个小小的建议：',
    closing: [
      '这本书可能会让你难过，甚至压抑。但如果你愿意，可以和我说说——哪一部分最让你透不过气来？',
      '苦难本身不值得赞美，但面对苦难的姿态值得。你在书中看到了怎样的活着？',
      '读完这样的书，往往需要沉默一会儿。你此刻心里涌起的是什么？',
    ],
    emoji: { book: '🪨', theme: '🔍', quote: '📜', tip: '🕯️', closing: '🌿' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'deep',
  },
  magical: {
    greeting: [
      '啊，《{title}》——这是一本翻开就会跌入另一个世界的书。准备好开始这场梦了吗？',
      '聊起《{title}》，就像聊起一个只有读过的人才懂的秘密。让我们慢慢道来。',
      '每次想起《{title}》，耳边就会响起某种遥远的风声。让我们跟着它走进去。',
    ],
    themeIntro: '在这个亦真亦幻的世界里，它想和我们谈的是：',
    quoteIntro: '马尔克斯（或者说，那些魔法般的文字）留下了这些永不褪色的句子：',
    tipIntro: '读这种书，最重要的是放下"这是真的还是假的"的执念。给你几个小小的提示：',
    closing: [
      '其实读魔幻现实主义，某种程度上是在读我们自己的梦。你在书中看到了哪些像梦一样的片段？',
      '合上书之后，有没有哪个画面一直挥之不去？就像做了一场醒不来的梦？',
      '孤独、命运、时间……你觉得这本书最想抓住的是什么？',
    ],
    emoji: { book: '🌙', theme: '✨', quote: '🪄', tip: '🗝️', closing: '🌌' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'poetic',
  },
  gentle: {
    greeting: [
      '聊起《{title}》，心情会不自觉地变得柔软起来。这是一本适合在雨天慢慢读的书。',
      '啊，《{title}》——这是我非常喜欢的一本书，像一个很久没见的朋友。',
      '说到《{title}》，我的语速都会放慢下来。让我们轻轻地聊。',
    ],
    themeIntro: '它温柔地触碰了这些我们每个人都有的心事：',
    quoteIntro: '这些句子像是说给自己听的悄悄话：',
    tipIntro: '读这样的书，不需要什么技巧，只要把心打开就好。不过可以留意：',
    closing: [
      '读的时候，有没有哪句话让你想抄在笔记本上，或者发给某个人？',
      '你是在什么样的心情下遇到这本书的？它有没有陪你走过某段特别的日子？',
      '直子和绿子（或者书中的某两个人物），你更心疼谁？',
    ],
    emoji: { book: '☕', theme: '💭', quote: '🍃', tip: '🌱', closing: '🌧️' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'warm',
  },
  profound: {
    greeting: [
      '《{title}》薄薄的一本，却装下了整个宇宙的问题。让我们认真地聊聊它。',
      '这是一本适合每隔几年重读一次的书。每次翻开，都会看到不一样的东西。',
      '说起《{title}》，我们其实是在聊我们自己。准备好了吗？',
    ],
    themeIntro: '它看似简单的故事背后，藏着这些沉甸甸的追问：',
    quoteIntro: '这些简单到近乎天真的句子，其实是说给大人听的：',
    tipIntro: '读这种书，"懂不懂"不重要，重要的是"感受到了什么"。给你几个可以留意的角度：',
    closing: [
      '如果用一句话来概括这本书对你说的话，会是什么？',
      '你是在什么年纪第一次读它的？现在重读，感受有没有不一样？',
      '狐狸说的"驯养"，在你看来是什么意思？（或者书中某个核心概念）',
    ],
    emoji: { book: '⭐', theme: '💫', quote: '🕊️', tip: '🔭', closing: '🌠' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'deep',
  },
  classical: {
    greeting: [
      '说起《{title}》，真不知该从何说起——这是一部说不尽的大书。让我们试着走进它。',
      '《{title}》是一座宝库，每读一遍都能发现新的东西。我们今天从哪里聊起？',
      '谈《{title}》，需要一点敬畏心——这是中国文学最华美的梦。',
    ],
    themeIntro: '它在繁华锦绣之中，藏着这些人世最深的感慨：',
    quoteIntro: '这些传唱不衰的句子，每一句都值得细细品味：',
    tipIntro: '读古典名著，入门有法。给你几个实用的建议：',
    closing: [
      '金陵十二钗（或书中的人物群像），你最牵挂谁？为什么？',
      '有人说这是一本"色空"之书，有人说这是一本"人情"之书，你怎么看？',
      '如果你是宝玉（或书中某个核心人物），你会做出不一样的选择吗？',
    ],
    emoji: { book: '🏮', theme: '🎋', quote: '📜', tip: '🖌️', closing: '🏯' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'poetic',
  },
  grand: {
    greeting: [
      '聊《{title}》，我们需要先把视角拉到宇宙的高度。准备好了吗？',
      '《{title}》是那种读完之后会让你抬头看星空的书。让我们一起聊聊它。',
      '说起《{title}》，人的渺小与伟大会同时涌上来。',
    ],
    themeIntro: '它在宏大的时空尺度下，追问这些关于文明与存在的根本问题：',
    quoteIntro: '这些句子像来自宇宙深处的回响，每一句都震撼人心：',
    tipIntro: '读硬科幻，需要一点耐心，但也不必强求理解所有设定。给你几个阅读建议：',
    closing: [
      '"黑暗森林法则"（或书中某个核心设定），你觉得它在逻辑上成立吗？',
      '如果真的存在外星文明，你认为人类应该怎么做？',
      '读完之后，你对人类文明的看法有改变吗？',
    ],
    emoji: { book: '🚀', theme: '🌌', quote: '🔭', tip: '🧭', closing: '✨' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'rational',
  },
  scholarly: {
    greeting: [
      '《{title}》是那种可以反复读、每读都有新收获的书。我们今天从哪个角度切入？',
      '说起《{title}》，费孝通先生（或作者名）平实的文字里藏着很深的洞察。',
      '《{title}》虽然是学术著作，但写得非常好读。让我们一起来梳理它的核心观点。',
    ],
    themeIntro: '这本书系统地讨论了这些重要的问题：',
    quoteIntro: '这些朴素的论断，背后是扎实的田野调查和深刻的思考：',
    tipIntro: '读这类学术著作，可以带着问题意识。给你几个阅读方法的建议：',
    closing: [
      '"差序格局"（或书中某个核心概念），对照你自己的生活经验，有没有共鸣？',
      '你觉得书中的哪些观察在今天依然成立？哪些已经发生了变化？',
      '如果让你用书中的一个观点去解释当下的某个社会现象，你会选什么？',
    ],
    emoji: { book: '📚', theme: '💡', quote: '📝', tip: '🧭', closing: '🔬' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'rational',
  },
  melancholic: {
    greeting: [
      '啊，《{title}》——这是一本适合在深夜读的书，像一杯苦中带甜的鸡尾酒。',
      '聊起《{title}》，就像聊起一个已经过去的、黄金般的夏天。',
      '《{title}》有一种迷人的忧伤——那种明知道梦会碎，还是忍不住伸手去抓的感觉。',
    ],
    themeIntro: '在华丽的表象之下，它真正想讲的是这些：',
    quoteIntro: '这些句子写尽了繁华与幻灭之间的距离：',
    tipIntro: '读这样的书，可以留意它的叙事者（尼克/渡边等人）——他的视角就是理解全书的钥匙。给你几个建议：',
    closing: [
      '盖茨比对岸的那盏绿灯（或书中的核心意象），在你看来象征着什么？',
      '你觉得书中最悲剧的人物是谁？为什么？',
      '有没有哪个人物，让你看到了自己身上的影子？',
    ],
    emoji: { book: '🥂', theme: '🌙', quote: '🥀', tip: '🎷', closing: '✨' },
    emphasisMarkers: { start: '**', end: '**' },
    discussionTone: 'poetic',
  },
};

const WHY_DIFFICULT_ANSWERS: KnowledgeEntry[] = [
  {
    keywords: ['为什么难读', '读不下去', '看不懂', '好难读', '太复杂'],
    bookTitles: ['百年孤独'],
    answer: '我特别理解读《百年孤独》的挫败感——很多人第一次翻开它都会在前三章就败下阵来。📖\n\n**为什么这么难读？**\n\n1. **名字的诅咒**：七代人反复使用"奥雷里亚诺"和"阿卡蒂奥"这两个名字，读到中段你会开始怀疑自己是不是脸盲症发作。马尔克斯故意这么做的——名字的重复暗示着命运的轮回，这个家族的人永远在重蹈覆辙。\n\n2. **时间的折叠**：那句著名的"多年以后"开头，一下子把过去、现在和未来叠在了一起。马尔克斯不按线性时间讲故事，他让记忆、预言和现实交织在一起。\n\n3. **魔幻的冲击**：死人的鬼魂来访、天降黄花雨、女孩升天……如果你抱着"读现实小说"的心态，会觉得这都什么跟什么。但马尔克斯的"魔幻"从来不是为了炫技，而是拉美大陆真实历史的隐喻——独裁、战争、殖民，这些本身就足够魔幻了。\n\n**我的阅读建议**：\n- 先画一张家族树，把谁是谁搞清楚（网上也有现成的）\n- 不要纠结"这是真的还是假的"，就像读《西游记》一样接受这个世界的规则\n- 前半段慢读，后半段会越来越快，因为当孤独的宿命感袭来时，你根本停不下来\n\n读完之后你会明白：这本书讲的不只是布恩迪亚家族，也是我们每个人的孤独——那种繁华落尽后，发现自己始终是一个人的感觉。🌙',
    discussionPoints: [
      '你读到哪里卡壳了？是人物关系还是叙事方式？',
      '有没有哪一段"魔幻"的描写让你觉得特别有共鸣？',
      '你身边有没有人像布恩迪亚家族的人——永远陷在某种循环里走不出来？',
    ],
    style: 'magical',
  },
];

const WHAT_EXPRESS_ANSWERS: KnowledgeEntry[] = [
  {
    keywords: ['想表达什么', '主题是什么', '中心思想', '主旨', '讲了什么道理'],
    bookTitles: ['活着'],
    answer: '每次有人问《活着》"想表达什么"，我都会犹豫一下——因为这本书最动人的地方，恰恰是它拒绝给你一个简单的"答案"。余华让福贵活下来，不是为了告诉我们什么大道理。\n\n**但如果一定要说，我觉得是这几层意思**：\n\n**1. 活着，就是活着本身**\n小说里最有名的那句话"人是为活着本身而活着，而不是为了活着之外的任何事物而活着"，很多人觉得这是"鸡汤"，但如果你跟着福贵经历了一次次失去——父母、妻子、儿女、女婿、外孙——你会明白这句话的重量。当所有支撑你活下去的理由都被抽走，"活着"本身就成了最后的、也是最顽强的理由。\n\n**2. 苦难面前，人是多么渺小，又是多么伟大**\n余华写苦难从不煽情，他像一台冷静的记录仪，把悲剧一件件列出来。但福贵从来没有抱怨过命运不公，他只是默默承受，然后继续活着。这种"不反抗的反抗"，比任何呐喊都更有力量。\n\n**3. 命运的荒诞与偶然**\n有庆被抽血抽死，凤霞难产而死，二喜被水泥板夹死，苦根吃豆子撑死——这些死亡都不是什么"轰轰烈烈的牺牲"，而是琐碎的、偶然的、甚至有点荒唐的。这就是真实的人生啊，很多离别根本没有铺垫，说来就来。\n\n**最后我想分享一个私人的感受**：\n我第一次读《活着》是在高二，那时候只觉得福贵太惨了，哭得稀里哗啦。工作之后重读，我注意到了小说的结尾——福贵和老牛在田埂上唱着歌谣，夕阳把他们的影子拉得很长。那时候我突然明白：余华写的不是绝望，而是在绝望之上，人依然可以选择温柔地活着。🌾\n\n你是在什么情境下读的这本书？有没有哪个细节让你特别难忘？',
    discussionPoints: [
      '你觉得福贵是"坚强"还是"麻木"？这两者的界线在哪里？',
      '如果让余华写一个"幸福版"的结局，你觉得会更有力量还是更弱？',
      '余华说"写作是为了活着"，你认同吗？写作（或阅读）对你来说意味着什么？',
    ],
    style: 'solemn',
  },
];

const RECOMMEND_STYLE_ANSWERS: KnowledgeEntry[] = [
  {
    keywords: ['推荐', '类似', '风格像', '同类型', '差不多', '推荐几本', '像挪威的森林', '类似挪威的森林', '和挪威的森林一样'],
    answer: '喜欢《挪威的森林》的人，通常被它的那种气质打动——忧郁的、温柔的、有点疏离感的，像是在雨天的咖啡馆里听一个人轻声讲自己的心事。☕️\n\n**如果这种感觉是你在找的，我推荐这几本**：\n\n**🌿 同作者系列**\n- **《海边的卡夫卡》**：如果你喜欢村上的孤独感，这本是更成熟的作品。少年田村卡夫卡的逃亡之旅，交织着俄狄浦斯式的命运隐喻，比《挪威的森林》多了魔幻色彩，但内核同样是关于自我寻找。\n- **《且听风吟》**：村上的处女作，篇幅很短，更青涩也更纯粹。20岁的"我"和那个没有手指的女孩，在夏天的海边，像一首没有歌词的歌。\n\n**🌙 同样温柔而忧伤的**\n- **《国境以南，太阳以西》**（村上春树）：很多人忽略了这本，但它其实是《挪威的森林》的"成人版"。37岁的"我"事业有成、家庭美满，却在某个雨天偶遇了年少时暗恋的女孩……原来有些遗憾，过了二十年还是会痛。\n- **《一个人的好天气》**（青山七惠）：日本新锐作家的芥川奖作品。更轻盈、更日常，讲一个打零工的女孩和老太太合租的故事。没有跌宕起伏的剧情，但那种淡淡的疏离感，和村上有异曲同工之妙。\n\n**🗺️ 稍微走远一点，但气质相通的**\n- **《不能承受的生命之轻》**（米兰·昆德拉）：比村上更哲学，但同样探讨爱、性、责任与自由。托马斯和特蕾莎的关系，像极了渡边和直子的另一种可能。\n- **《心是孤独的猎手》**（卡森·麦卡勒斯）：美国南方文学的经典，写尽了人与人之间无法逾越的孤独。比村上更沉郁，但那种"人终究是一个人"的感受，是相通的。\n\n**最后问你一个问题**：你最爱《挪威的森林》的什么？是直子的忧郁、绿子的明媚，还是渡边那种永远站在边缘的疏离感？知道你喜欢的具体是什么，我可以推荐更精准的书给你。📚',
    recommendedBooks: [
      { title: '海边的卡夫卡', author: '村上春树', reason: '同作者，更成熟的孤独叙事，融合魔幻与自我寻找' },
      { title: '且听风吟', author: '村上春树', reason: '村上处女作，青涩纯粹，青春迷茫的源头' },
      { title: '一个人的好天气', author: '青山七惠', reason: '芥川奖作品，日常中的疏离感，轻盈而治愈' },
      { title: '国境以南，太阳以西', author: '村上春树', reason: '《挪威的森林》成人版，关于遗憾与重逢' },
      { title: '心是孤独的猎手', author: '卡森·麦卡勒斯', reason: '写尽人与人之间无法逾越的孤独，沉郁而深刻' },
    ],
    discussionPoints: [
      '你最爱《挪威的森林》里的谁？直子、绿子，还是渡边自己？',
      '村上的小说里总有一种"距离感"——你觉得这是一种保护，还是一种遗憾？',
      '有没有哪本书也给过你类似"下雨的下午"那种感觉？',
    ],
    style: 'gentle',
  },
];

const COMMON_QUESTIONS: KnowledgeEntry[] = [
  {
    keywords: ['读后感', '读书心得', '感悟', '读完之后的感受'],
    answer: '读书这件事，最珍贵的从来不是"正确答案"，而是你自己被触动的那个瞬间。✨\n\n我自己写读书笔记时，通常会记录这几个角度：\n\n**🎯 那个击中我的瞬间**\n不管是一句话、一个场景、还是一个人物的选择——先把那个"啊，就是这个！"的感受写下来，哪怕只有几句话。几年后翻回来，最先感动你的还是这些。\n\n**🤔 它让我想起了什么**\n文学最迷人的地方，就是它会照见你自己的人生。这本书让你想起了谁？你有没有过类似的经历？如果是你，你会怎么选？\n\n**💬 如果能和作者对话**\n你最想问作者什么问题？你同意他/她的看法吗？你觉得哪个情节可以有不一样的走向？\n\n你最近读的是哪本书？可以和我分享你的感受，哪怕只有一句"我觉得好难过"或者"我好像没读懂"都没关系。💝',
    discussionPoints: [
      '你最近在读什么书？',
      '有没有一本书读完后，让你久久无法平静？',
      '你是习惯写读书笔记，还是让感受留在心里就好？',
    ],
    style: 'gentle',
  },
  {
    keywords: ['读书会', '怎么讨论', '讨论话题', '分享会', '聊什么'],
    answer: '组织读书会讨论最关键的一点是：**不要变成"阅读理解考试"**。好的讨论不是比谁理解得"更正确"，而是让每个人都能说出自己真实的感受。💬\n\n**我常用的讨论引导方式**：\n\n**✨ 从"感受"开始，而不是"观点"**\n不要一开始就问"这本书的主题是什么"，而要问：\n- "读完之后，你印象最深的画面是什么？"\n- "你最讨厌/最喜欢哪个角色？为什么？"\n- "有没有哪个片段让你想合上书缓一缓？"\n\n当大家开始分享感受，观点自然会出来。\n\n**🗣️ 设计"有争议"的问题**\n好的讨论话题没有标准答案，比如读《红楼梦》可以问：\n- "如果你是贾宝玉，你会选林黛玉还是薛宝钗？"\n- "王熙凤到底是悲剧人物还是恶人？"\n\n**🎭 代入式讨论**\n- "如果你是福贵，在失去所有亲人之后，你会怎么继续活下去？"\n- "如果你是盖茨比，知道黛西是那样的人，你还会等她吗？"\n\n**📝 最后的保留环节**\n每次讨论的最后，留一个问题："这本书会改变你看待生活的某个方式吗？如果会，是哪一点？"\n\n你打算和朋友讨论哪本书？我可以帮你设计一套具体的讨论话题！',
    discussionPoints: [
      '你参加过读书会吗？有没有印象特别深刻的讨论？',
      '你觉得读书是"一个人的事"，还是"可以和别人分享的事"？',
      '有没有哪本书，你特别想和别人讨论，但一直没找到合适的人？',
    ],
    style: 'profound',
  },
  {
    keywords: ['文学入门', '新手怎么读', '怎么开始读文学', '文学欣赏', '怎么读懂'],
    answer: '欢迎进入文学的世界！🌿 很多人想读文学却不知道从哪里开始，我给你分享几个让阅读门槛变低的小建议：\n\n**📚 第一，不要从"经典"开始**\n很多人一上来就读《百年孤独》《尤利西斯》，然后被劝退，从此认定"我不是读书的料"。完全没必要！先从**让你有快感**的书开始——\n- 喜欢悬疑感？试试东野圭吾，再过渡到卡夫卡\n- 喜欢青春故事？从《挪威的森林》入门，再读《麦田里的守望者》\n- 喜欢中国故事？《活着》《平凡的世界》都是极好的入门\n\n**🤔 第二，读不懂很正常，不要急**\n文学不是数学题，没有"正确解答"。你读《红楼梦》只觉得大观园里的人吃的东西好精致，这也是一种"读懂"。随着阅历增长，你会在不同年纪读出不同的东西——这就是经典的魅力。\n\n**💭 第三，接受"读不完"**\n一本书翻了三分之一还没感觉，可以放下。读书不是打卡，是约会——不喜欢就换一本，没什么大不了的。\n\n**👥 第四，找人聊**\n一个人读容易闷，和朋友聊一聊，哪怕只是吐槽"这人也太傻了吧"，都会让阅读变得更有趣。\n\n对了，你平时喜欢看电影吗？很多文学经典都有改编电影，可以**先看电影再看书**，降低理解门槛。\n\n你平时喜欢什么类型的故事？我可以帮你推荐几本"一读就停不下来"的入门书！',
    discussionPoints: [
      '你最近有想读但还没开始的书吗？',
      '有没有一本书，是你学生时代讨厌，但长大之后突然爱上的？',
      '你觉得读文学最重要的是"读懂"，还是"感受到"？',
    ],
    style: 'gentle',
  },
  {
    keywords: ['如何做笔记', '怎么记笔记', '阅读笔记', '笔记方法'],
    answer: '读书笔记这件事，我走了很多年弯路——以前追求"工整""全面"，抄了一大堆名言警句，后来从来没翻过。现在我做笔记的原则是：**只记那些让你"心动"的东西**。❤️\n\n**我目前在用的几种方法**：\n\n**✏️ 画线 + 旁注（最原始也最好用）**\n读到让你停顿的地方，就画下来，在空白处随手写两三个字——比如"想哭""太真实了""我也有过"。不要追求完整的句子，这些碎片化的标注，日后回看时会瞬间把你拉回当时的心境。\n\n**📝 三色便利贴法**\n- **黄色**：画精彩句子（之后可以整理成摘抄）\n- **蓝色**：写疑问和思考（"为什么他要这么做？""这个象征什么？"）\n- **粉色**：写和自己生活的关联（"像我去年那个时候""我妈也说过类似的话"）\n\n**🎯 读完后的"三句话总结"**\n合上书之后，立刻强迫自己写三句话：\n1. 这本书最打动我的是____\n2. 它让我重新思考了____\n3. 我想把它推荐给____，因为____\n\n就三句，多一句都不要写。这个方法可以帮你把模糊的感受凝结成清晰的想法。\n\n**最后说一句**：笔记是给自己看的，不是给别人晒的。乱七八糟、涂涂抹抹都没关系，只要它记录了你和这本书相遇的那个瞬间，就是最好的笔记。📖\n\n你平时有做笔记的习惯吗？有没有哪本书的笔记，你偶尔还会翻出来看？',
    discussionPoints: [
      '你是喜欢在书上画线写字，还是保持书的干净整洁？',
      '有没有哪页笔记，你现在翻到还会会心一笑？',
      '你觉得电子笔记和手写笔记，哪个更有"温度"？',
    ],
    style: 'scholarly',
  },
];

@Injectable()
export class LiteratureQaService {
  getAllBooks(): BookInfo[] {
    return BOOK_DATABASE;
  }

  getBookByTitle(title: string): BookInfo | undefined {
    return BOOK_DATABASE.find(
      b => b.title === title || title.includes(b.title) || b.title.includes(title)
    );
  }

  getSuggestedQuestions(): string[] {
    return [
      '《百年孤独》为什么这么难读？',
      '《活着》想表达什么？',
      '推荐几本像《挪威的森林》这种风格的书',
      '《红楼梦》人物太多怎么记？',
      '《三体》的"黑暗森林法则"是什么意思？',
      '《小王子》真的只是童话吗？',
      '如何写好读书心得？',
      '文学入门应该读什么书？',
    ];
  }

  ask(question: string): AskResponse {
    const trimmedQuestion = question.trim();
    const lowerQuestion = trimmedQuestion.toLowerCase();

    let relatedBooks: BookInfo[] = [];
    let recommendedBooks: { title: string; author: string; reason: string }[] = [];
    let discussionPoints: string[] = [];
    let answer = '';
    let style: DiscourseStyle = 'gentle';

    for (const book of BOOK_DATABASE) {
      if (
        lowerQuestion.includes(book.title.toLowerCase()) ||
        lowerQuestion.includes(book.author.toLowerCase())
      ) {
        if (!relatedBooks.find(b => b.title === book.title)) {
          relatedBooks.push(book);
        }
      }
      for (const tag of book.tags) {
        if (lowerQuestion.includes(tag.toLowerCase())) {
          if (!relatedBooks.find(b => b.title === book.title)) {
            relatedBooks.push(book);
          }
        }
      }
    }

    for (const entry of WHY_DIFFICULT_ANSWERS) {
      if (this.matchKeywords(lowerQuestion, entry.keywords)) {
        answer = entry.answer;
        discussionPoints = entry.discussionPoints || [];
        style = entry.style;
        if (entry.bookTitles) {
          for (const t of entry.bookTitles) {
            const book = this.getBookByTitle(t);
            if (book && !relatedBooks.find(b => b.title === book.title)) {
              relatedBooks.push(book);
            }
          }
        }
        break;
      }
    }

    if (!answer) {
      for (const entry of WHAT_EXPRESS_ANSWERS) {
        if (this.matchKeywords(lowerQuestion, entry.keywords)) {
          answer = entry.answer;
          discussionPoints = entry.discussionPoints || [];
          style = entry.style;
          if (entry.bookTitles) {
            for (const t of entry.bookTitles) {
              const book = this.getBookByTitle(t);
              if (book && !relatedBooks.find(b => b.title === book.title)) {
                relatedBooks.push(book);
              }
            }
          }
          break;
        }
      }
    }

    if (!answer) {
      for (const entry of RECOMMEND_STYLE_ANSWERS) {
        if (this.matchKeywords(lowerQuestion, entry.keywords)) {
          answer = entry.answer;
          discussionPoints = entry.discussionPoints || [];
          recommendedBooks = entry.recommendedBooks || [];
          style = entry.style;
          break;
        }
      }
    }

    if (!answer) {
      for (const entry of COMMON_QUESTIONS) {
        if (this.matchKeywords(lowerQuestion, entry.keywords)) {
          answer = entry.answer;
          discussionPoints = entry.discussionPoints || [];
          style = entry.style;
          break;
        }
      }
    }

    if (!answer) {
      if (relatedBooks.length > 0) {
        const book = relatedBooks[0];
        style = book.discourseStyle;
        answer = this.generateBookIntroduction(book, trimmedQuestion);
        recommendedBooks = book.similarBooks;
        discussionPoints = this.generateDiscussionPoints(book);
      } else {
        style = 'gentle';
        answer = this.generateGeneralAnswer(trimmedQuestion, style);
        recommendedBooks = this.generateRandomRecommendations();
        discussionPoints = [
          '可以和我聊聊你最近在读什么书吗？',
          '有没有哪个书中的人物让你特别有共鸣？',
          '你觉得读文学作品对你最大的改变是什么？',
        ];
      }
    }

    relatedBooks = relatedBooks.slice(0, 3);
    recommendedBooks = recommendedBooks.slice(0, 5);
    discussionPoints = discussionPoints.slice(0, 5);

    return { answer, relatedBooks, discussionPoints, recommendedBooks, style };
  }

  private matchKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => {
      const lowerKw = kw.toLowerCase();
      if (lowerKw.includes(' ')) {
        return text.includes(lowerKw);
      }
      return text.split(/[，。！？、\s,.!?]+/).some(word => word === lowerKw || word.includes(lowerKw));
    });
  }

  private generateBookIntroduction(book: BookInfo, question: string): string {
    const cfg = STYLE_CONFIGS[book.discourseStyle];
    const randomGreeting = cfg.greeting[Math.floor(Math.random() * cfg.greeting.length)];
    const randomClosing = cfg.closing[Math.floor(Math.random() * cfg.closing.length)];
    const greeting = randomGreeting.replace('{title}', book.title);

    let answer = `${greeting} ${cfg.emoji.book}\n\n`;
    answer += `**${cfg.emoji.book} 关于这本书**\n\n${book.summary}\n\n`;
    answer += `**${cfg.emoji.theme} ${cfg.themeIntro}**\n\n`;
    book.themes.slice(0, 4).forEach((theme, i) => {
      answer += `${i + 1}. ${cfg.emphasisMarkers.start}${theme}${cfg.emphasisMarkers.end}\n`;
    });
    answer += `\n**${cfg.emoji.quote} ${cfg.quoteIntro}**\n\n`;
    book.iconicQuotes.slice(0, 2).forEach(q => {
      answer += `> "${q.quote}"${q.character ? ` —— ${q.character}` : ''}\n\n`;
    });
    answer += `**${cfg.emoji.tip} ${cfg.tipIntro}**\n\n`;
    book.readingTips.slice(0, 2).forEach((tip, i) => {
      answer += `${i + 1}. ${tip}\n`;
    });
    answer += `\n这本书的整体气质可以说是：${cfg.emphasisMarkers.start}${book.emotionalTone}${cfg.emphasisMarkers.end}。\n\n`;
    answer += `${cfg.emoji.closing} ${randomClosing}`;
    return answer;
  }

  private generateGeneralAnswer(question: string, style: DiscourseStyle): string {
    const cfg = STYLE_CONFIGS[style];
    const greetings = [
      '这是一个很棒的问题！',
      '聊到文学，总有说不完的话～',
      '谢谢你愿意和我聊这个话题！',
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    return `${greeting} ${cfg.emoji.closing}\n\n关于你的问题"${question}"，我想说：\n\n文学最迷人的地方，就在于它没有标准答案。每一本书、每一个人物、每一段情节，在不同的人眼中都会折射出不同的光。这也是为什么我们需要和别人讨论——因为别人的解读，会让你看到自己从未注意过的风景。\n\n我整理了一些相关的书籍和讨论话题，希望能给你一些启发。你也可以告诉我更多：\n\n- 你是在准备读书心得还是读书会讨论？\n- 有没有哪本具体的书是你最近在思考的？\n- 你更想聊"内容解读"还是"写作方法"？\n\n不管是什么，我都很乐意和你一起慢慢聊～ ${cfg.emoji.closing}`;
  }

  private generateRandomRecommendations(): { title: string; author: string; reason: string }[] {
    const shuffled = [...BOOK_DATABASE].sort(() => Math.random() - 0.5).slice(0, 3);
    return shuffled.map(b => ({
      title: b.title,
      author: b.author,
      reason: `${b.genre.join('、')}的代表作，${b.emotionalTone.slice(0, 15)}...`,
    }));
  }

  private generateDiscussionPoints(book: BookInfo): string[] {
    const cfg = STYLE_CONFIGS[book.discourseStyle];
    const base = [
      `你觉得《${book.title}》里最打动你的是什么？`,
      `书中哪个角色让你最有共鸣（或者最讨厌）？为什么？`,
    ];

    const toneBased: Record<StyleConfig['discussionTone'], string[]> = {
      deep: [
        `这本书有没有让你对某个根深蒂固的看法产生动摇？`,
        `如果让你用一个词来概括这本书的"内核"，你会选什么？`,
      ],
      warm: [
        `读的时候，有没有哪个瞬间让你想起了自己的某段经历？`,
        `你会把这本书推荐给此刻的谁？为什么？`,
      ],
      rational: [
        `书中哪个设定或观点，你觉得逻辑上最有意思（或最值得商榷）？`,
        `如果跳出情感层面，你觉得作者在写作技巧上最厉害的是什么？`,
      ],
      poetic: [
        `有没有哪个画面或句子，读完之后在你脑子里久久不散？`,
        `如果把这本书比作一首曲子、一幅画或一种天气，你觉得它是什么？`,
      ],
    };

    const closing = cfg.discussionTone === 'deep'
      ? `读完这本书之后，你觉得自己有什么东西被永久地改变了吗？`
      : cfg.discussionTone === 'warm'
      ? `你会在什么样的心情下，想要再次翻开这本书？`
      : cfg.discussionTone === 'rational'
      ? `如果用一句话向朋友推荐这本书，你会怎么说？`
      : `如果让你给这本书换一个结尾（或换一个书名），你会怎么改？`;

    return [...base, ...toneBased[cfg.discussionTone], closing];
  }
}
