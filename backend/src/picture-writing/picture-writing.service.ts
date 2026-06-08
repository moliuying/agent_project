import { Injectable } from '@nestjs/common';

export interface PictureWritingRequest {
  imageBase64: string;
  userDescription?: string;
  gradeLevel?: string;
  wordCount?: string;
  writingStyle?: string;
  customRequirements?: string;
  variantSeed?: number;
}

export interface PictureSceneAnalysis {
  scene: string;
  characters: string[];
  actions: string[];
  emotions: string[];
  time: string;
  location: string;
  details: string[];
}

export interface PictureWritingResponse {
  analysis: PictureSceneAnalysis;
  content: string;
  title: string;
  gradeLevel: string;
  wordCount: number;
  keyWords: string[];
  writingTips: string[];
}

const GRADE_META: Record<string, {
  name: string;
  minWords: number;
  maxWords: number;
  paragraphs: number;
  description: string;
}> = {
  grade1: { name: '一年级', minWords: 50, maxWords: 100, paragraphs: 2, description: '短句为主，每句5-8字，基本的四要素：时间、地点、人物、事件' },
  grade2: { name: '二年级', minWords: 80, maxWords: 150, paragraphs: 2, description: '简单修饰，每句8-12字，加入形容词和简单对话' },
  grade3: { name: '三年级', minWords: 150, maxWords: 250, paragraphs: 3, description: '完整段落，每句10-15字，加入比喻句和心理活动' },
  grade4: { name: '四年级', minWords: 250, maxWords: 350, paragraphs: 3, description: '细节描写，每句12-18字，多种修辞和环境描写' },
  grade5: { name: '五年级', minWords: 350, maxWords: 500, paragraphs: 4, description: '立意升华，每句14-20字，结构完整，感悟深刻' },
  grade6: { name: '六年级', minWords: 450, maxWords: 600, paragraphs: 5, description: '写作技巧丰富，每句16-25字，有深度有文采' }
};

interface GradeVocabulary {
  adjectives: string[];
  adverbs: string[];
  verbs: string[];
  idioms: string[];
  nouns: string[];
}

const GRADE_VOCABULARY: Record<string, GradeVocabulary> = {
  grade1: {
    adjectives: ['大的', '小的', '红的', '绿的', '好的', '美的', '高的', '矮的', '长的', '短的', '快的', '慢的', '开心的', '快乐的', '干净的'],
    adverbs: ['快快地', '慢慢地', '轻轻地', '好好地', '开心地'],
    verbs: ['看', '听', '说', '读', '写', '跑', '跳', '笑', '哭', '玩', '吃', '走', '坐', '站', '飞'],
    idioms: ['高高兴兴', '快快乐乐', '开开心心', '明明白白', '干干净净', '大大小小'],
    nouns: ['太阳', '月亮', '花', '草', '树', '山', '水', '鸟', '鱼', '小朋友', '老师', '爸爸', '妈妈', '学校', '公园']
  },
  grade2: {
    adjectives: ['美丽的', '可爱的', '温暖的', '明亮的', '干净的', '热闹的', '安静的', '高兴的', '认真的', '勤劳的', '勇敢的', '善良的'],
    adverbs: ['认真地', '仔细地', '轻轻地', '悄悄地', '慢慢地', '飞快地', '兴奋地', '高兴地'],
    verbs: ['观察', '帮助', '打扫', '阅读', '欣赏', '制作', '参加', '享受', '发现', '学习'],
    idioms: ['阳光明媚', '万里无云', '五颜六色', '百花盛开', '鸟语花香', '兴致勃勃', '干干净净', '整整齐齐'],
    nouns: ['春天', '夏天', '秋天', '冬天', '花园', '草地', '森林', '小河', '田野', '校园', '教室', '同学', '朋友']
  },
  grade3: {
    adjectives: ['风景如画的', '生机勃勃的', '五彩斑斓的', '清澈见底的', '郁郁葱葱的', '情不自禁的', '兴高采烈的', '专心致志的', '不约而同的', '秋高气爽的'],
    adverbs: ['聚精会神地', '兴高采烈地', '情不自禁地', '不约而同地', '小心翼翼地', '恋恋不舍地', '津津有味地'],
    verbs: ['探索', '分享', '鼓励', '创造', '克服', '坚持', '感受', '领悟', '展现', '描绘'],
    idioms: ['春暖花开', '秋高气爽', '一碧如洗', '热闹非凡', '专心致志', '不约而同', '恋恋不舍', '津津有味', '小心翼翼', '栩栩如生'],
    nouns: ['大自然', '知识', '友谊', '勇气', '梦想', '希望', '努力', '成功', '困难', '挑战']
  },
  grade4: {
    adjectives: ['姹紫嫣红的', '郁郁葱葱的', '生机勃勃的', '情不自禁的', '兴高采烈的', '聚精会神的', '心旷神怡的', '如诗如画的', '五彩缤纷的', '层峦叠翠的'],
    adverbs: ['兴致勃勃地', '聚精会神地', '情不自禁地', '恋恋不舍地', '心旷神怡地', '全神贯注地', '有条不紊地'],
    verbs: ['领略', '领悟', '探索', '创造', '展现', '描绘', '克服', '坚持', '分享', '鼓舞'],
    idioms: ['姹紫嫣红', '郁郁葱葱', '生机勃勃', '兴高采烈', '聚精会神', '情不自禁', '心旷神怡', '如诗如画', '五彩缤纷', '层峦叠翠', '鸟语花香', '美不胜收'],
    nouns: ['意境', '情趣', '魅力', '内涵', '真谛', '境界', '氛围', '韵律', '灵感', '启迪']
  },
  grade5: {
    adjectives: ['美不胜收的', '引人入胜的', '心旷神怡的', '喜气洋洋的', '全神贯注的', '兴致勃勃的', '触景生情的', '回味无穷的', '流光溢彩的', '精妙绝伦的'],
    adverbs: ['兴致勃勃地', '全神贯注地', '心旷神怡地', '触景生情地', '回味无穷地', '意味深长地', '淋漓尽致地'],
    verbs: ['感悟', '体味', '领略', '诠释', '诠释', '塑造', '描绘', '彰显', '传承', '启迪'],
    idioms: ['鸟语花香', '美不胜收', '兴致勃勃', '全神贯注', '心旷神怡', '喜气洋洋', '触景生情', '回味无穷', '流光溢彩', '精妙绝伦', '引人入胜', '意味深长'],
    nouns: ['感悟', '启迪', '情怀', '境界', '意蕴', '洗礼', '馈赠', '瑰宝', '精髓', '传承']
  },
  grade6: {
    adjectives: ['繁花似锦的', '层林尽染的', '硕果累累的', '兴致盎然的', '专心致志的', '心潮澎湃的', '意蕴深远的', '惟妙惟肖的', '跌宕起伏的', '感人至深的'],
    adverbs: ['兴致盎然地', '专心致志地', '心潮澎湃地', '意蕴深远地', '惟妙惟肖地', '淋漓尽致地', '意味深长地', '情不自禁地'],
    verbs: ['感悟', '诠释', '铸就', '谱写', '承载', '寄托', '抒发', '彰显', '启迪', '传承'],
    idioms: ['繁花似锦', '层林尽染', '硕果累累', '兴致盎然', '专心致志', '心潮澎湃', '意蕴深远', '惟妙惟肖', '跌宕起伏', '感人至深', '淋漓尽致', '意味深长', '引人入胜', '回味无穷'],
    nouns: ['情怀', '意蕴', '境界', '洗礼', '瑰宝', '精髓', '传承', '启迪', '感悟', '真谛', '积淀', '底蕴']
  }
};

interface GradeSentenceTemplates {
  simple: string[];
  compound: string[];
  complex: string[];
  figurative: string[];
}

const GRADE_SENTENCE_TEMPLATES: Record<string, GradeSentenceTemplates> = {
  grade1: {
    simple: [
      '{character}在{location}{action}。',
      '今天天气{adj}。',
      '{character}很{emotion}。',
      '{time}，{character}去{location}。',
      '{character}看到了{noun}。'
    ],
    compound: [],
    complex: [],
    figurative: []
  },
  grade2: {
    simple: [
      '{time}，{character}{adverb}{action}。',
      '{location}有很多{adj}的{noun}。',
      '{character}看到{adj}的{noun}，心里{emotion}极了。'
    ],
    compound: [
      '{character}一边{action}，一边{action}。',
      '因为{reason}，所以{character}感到{emotion}。'
    ],
    complex: [],
    figurative: []
  },
  grade3: {
    simple: [
      '{time}，{character}怀着{emotion}的心情来到{location}。',
      '放眼望去，{location}呈现出一派{adj}的景象。',
      '{character}{adverb}{action}，仿佛{feeling}。'
    ],
    compound: [
      '{character}不仅{action}，还{action}。',
      '虽然{condition}，但是{character}依然坚持{action}。'
    ],
    complex: [
      '看着眼前这{adj}的景象，{character}心想：{thought}。',
      '当{character}{action}的时候，他突然意识到{realization}。'
    ],
    figurative: [
      '远处的{noun}像{metaphor}一样，{description}。',
      '{noun}宛如{metaphor}，在阳光下闪闪发光。'
    ]
  },
  grade4: {
    simple: [
      '{time}，{character}怀着{emotion}而又{emotion}的心情，漫步在{location}。',
      '步入{location}，一股{adj}的气息扑面而来，令人{feeling}。',
      '{character}驻足凝望，只见{scene}，好一派{adj}的景象！'
    ],
    compound: [
      '{character}既{action}，又{action}，还不时地{action}。',
      '与其{alternative}，不如{character}选择{action}，去感受{feeling}。'
    ],
    complex: [
      '之所以{character}如此{emotion}，是因为{reason}，这让他深深体会到{insight}。',
      '无论{condition}如何变化，{character}始终坚信{belief}，并{action}。'
    ],
    figurative: [
      '那{adj}的{noun}，仿佛是{metaphor}，又似{metaphor}，让人{feeling}。',
      '微风拂过，{noun}轻轻摇曳，犹如{character}{action}一般，{description}。',
      '{noun}就像{metaphor}，在{time}的映衬下显得格外{adj}。'
    ]
  },
  grade5: {
    simple: [
      '{time}，当{character}怀着{emotion}的心绪踏入{location}时，立刻被眼前这{adj}的景象深深震撼了。',
      '置身于{location}，{character}的思绪随着{scene}飘向远方，心中涌起一股{emotion}而又{emotion}的情感。',
      '望着眼前{adj}的{scene}，{character}不禁停下脚步，细细品味这{adj}的瞬间。'
    ],
    compound: [
      '{character}不仅{action}，更从中{action}，领悟到{insight}的深刻内涵。',
      '正是因为{character}{action}，他才能够{action}，最终收获了{result}。'
    ],
    complex: [
      '从{character}的身上，我们看到了{quality}的力量，这不禁让我们思考：{question}？',
      '虽然{character}只是{action}，但这平凡的举动背后，却蕴含着{deepmeaning}，让人{feeling}。'
    ],
    figurative: [
      '眼前这{adj}的景象，宛如一幅{metaphor}的画卷，又似一首{metaphor}的诗篇，让{character}深深沉醉其中。',
      '如果说{scene}是{metaphor}，那么{character}{action}就是{metaphor}，两者交相辉映，{description}。',
      '{noun}在{time}的{scene}中，如同{metaphor}般，{description}，让人回味无穷。'
    ]
  },
  grade6: {
    simple: [
      '{time}，{character}伫立在{location}，凝望着眼前{adj}的{scene}，心中不禁涌起万千思绪，{emotion}与{emotion}交织在一起，久久难以平复。',
      '当{character}的目光与{scene}交汇的那一刻，时间仿佛静止了，所有的喧嚣都悄然退去，只留下{character}与这{adj}的景象默默对视。',
      '置身于这{adj}的{location}，{character}仿佛穿越了时空，与{scene}进行着一场无声的对话，心灵得到了前所未有的{result}。'
    ],
    compound: [
      '{character}既{action}，又{action}，更在这过程中{action}，完成了一次{result}的蜕变。',
      '正是这份{quality}，让{character}在{condition}面前没有{action}，反而{action}，最终{action}。'
    ],
    complex: [
      '从{character}{action}这件小事中，我们或许可以窥见{bigtheme}的真谛——它不仅仅是{simpleview}，更是{deepview}，是{deepestview}。',
      '也许{character}从未想过{unexpected}，但正是这{adj}的{scene}，让他忽然明白了{realization}，这种{quality}，恰恰是我们这个时代最需要的{result}。'
    ],
    figurative: [
      '如果说人生是一部{metaphor}的巨著，那么眼前这{adj}的{scene}，便是其中{metaphor}的篇章，{character}在其中读到了{reading}。',
      '那{adj}的{noun}，恰似{metaphor}，在{time}的长河中静静伫立，见证着{history}，诉说着{story}，启迪着{character}去{action}。',
      '当{scene}与{character}的心灵产生共鸣的那一刻，{character}仿佛听到了{sound}，那是{metaphor}在{action}，是{metaphor}在{action}，更是{deepmeaning}在{character}心中{result}。'
    ]
  }
};

interface GradeParagraphStructure {
  openings: string[];
  middles: string[];
  endings: string[];
}

const GRADE_PARAGRAPH_STRUCTURE: Record<string, GradeParagraphStructure> = {
  grade1: {
    openings: [
      '{time}，{character}去{location}。',
      '今天，{character}和{other}到{location}玩。',
      '{time}天气{adj}，{character}在{location}。'
    ],
    middles: [
      '{character}看到{noun}很{adj}。',
      '{character}{action}，很{emotion}。'
    ],
    endings: [
      '{character}真{emotion}！',
      '今天{character}过得很{emotion}。',
      '{character}喜欢{location}。'
    ]
  },
  grade2: {
    openings: [
      '{time}，{character}和{other}{adverb}来到{location}。',
      '今天天气{adj}，{character}怀着{emotion}的心情去{location}。',
      '{time}，{location}一派{adj}的景象，{character}来这里{action}。'
    ],
    middles: [
      '只见{location}有很多{adj}的{noun}，{character}{adverb}{action}。',
      '{character}一边{action}，一边{action}，还不时和{other}{action}。',
      '看着眼前{adj}的{scene}，{character}心里{emotion}极了。'
    ],
    endings: [
      '不知不觉，{time}到了，{character}{adverb}地回家了。',
      '虽然{character}有点累，但是心里非常{emotion}。',
      '这真是{emotion}的一天，{character}永远也不会忘记。'
    ]
  },
  grade3: {
    openings: [
      '{time}，{character}怀着{emotion}的心情，和{other}一起{adverb}地来到{location}。刚一进门，{character}就被眼前{adj}的景象吸引住了。',
      '记得{time}，{character}和{other}去{location}。那天天气{adj}，{location}里到处都是{adj}的景象，让人{feeling}。',
      '{time}，{location}呈现出一派{adj}的景象。{character}漫步其中，{action}，尽情享受着这美好的时光。'
    ],
    middles: [
      '走进{location}深处，{character}看到{adj}的{noun}像{metaphor}一样{description}。{character}{adverb}地{action}，心想：{thought}。',
      '{character}一边{action}，一边仔细{action}。他发现{discovery}，这让他不禁感叹道："{exclamation}"',
      '就在这时，{character}看到{scene}。他立刻{adverb}{action}，虽然{condition}，但是{character}依然坚持{action}。'
    ],
    endings: [
      '{time}，{character}{adverb}地离开了{location}。回家的路上，他还在想着今天发生的事情，{emotion}的心情久久不能平静。',
      '虽然今天的{action}结束了，但是{character}收获了{result}。他暗暗下定决心：{decision}。',
      '这{emotion}的一天，让{character}深深体会到{insight}。他永远也不会忘记这段{adj}的经历。'
    ]
  },
  grade4: {
    openings: [
      '{time}，{character}怀着{emotion}而又{emotion}的心情，和{other}一起步入{location}。刚踏入这片土地，一股{adj}的气息便扑面而来，{character}情不自禁地深吸一口气，顿觉{feeling}。',
      '那是{time}的一天，{character}和{other}相约来到{location}。抬头望去，{scene}，好一派{adj}的景象！{character}顿时觉得整个人都{feeling}。',
      '人们都说{location}是{metaphor}，{character}一直向往着能亲眼一见。{time}，这个愿望终于实现了！当{character}真正站在{location}时，眼前的景象比想象中还要{adj}。'
    ],
    middles: [
      '放眼望去，{adj}的{noun}宛如{metaphor}，在{time}的映衬下显得格外{adj}。{character}{adverb}地{action}，不禁感叹：大自然真是{metaphor}！他一边{action}，一边{action}，还不时{action}，用心感受着这里的每一处{scene}。',
      '{character}驻足在{noun}前，久久不愿离去。只见{scene}，如同{metaphor}一般，{description}。他心想：{thought}。就在这时，{character}看到{scene}，这让他更加深刻地体会到{insight}。',
      '沿着{location}的小路往前走，{character}的心情愈发{emotion}。不仅是因为{reason}，更是因为{reason}。他仿佛听到了{sound}，看到了{scene}，感受到了{feeling}。这种种感受交织在一起，让{character}{adverb}地{action}。'
    ],
    endings: [
      '夕阳西下，{character}才{adverb}地踏上归途。回首望去，{location}在暮色中显得更加{adj}。今天的{action}不仅让{character}{result}，更让他{result}。这{adj}的经历，将永远珍藏在{character}的记忆深处。',
      '虽然{character}离开了{location}，但那{adj}的景象依然清晰地浮现在他的脑海。他深刻地认识到{insight}。是的，{character}{action}，因为他知道，{belief}。',
      '今天的{action}，对{character}来说是一次{adj}的体验。它让{character}明白了{insight}，也让{character}更加{emotion}。回到家里，{character}迫不及待地拿起笔，将今天的所见所闻一一记录下来，因为他想永远珍藏这份{result}。'
    ]
  },
  grade5: {
    openings: [
      '{time}，当{character}怀着{emotion}的心绪踏入{location}时，立刻被眼前这{adj}的景象深深震撼了。{scene}，这一切是如此的{adj}，仿佛时间都在这一刻凝固了，只留下{character}与这片{location}默默对视。',
      '在{character}的记忆深处，一直珍藏着一幅{adj}的画面——那是{time}在{location}的一次{action}。每当想起那个{adj}的日子，{character}的心中便会涌起一股{emotion}而又{emotion}的情感。',
      '有人说，{bigtheme}是{metaphor}。直到{time}，{character}在{location}经历了那次{action}之后，才真正读懂了这句话的含义。那{adj}的景象，那{emotion}的感受，至今仍历历在目。'
    ],
    middles: [
      '置身于这{adj}的{location}，{character}的思绪不禁飘向了远方。他看到{scene}，听到{sound}，感受到{feeling}。这一切让{character}联想到{association}，他忽然明白了{realization}。是啊，{character}在心中默念着，{belief}。正是这份{quality}，让{character}更加{adverb}地{action}，去{action}。',
      '走着走着，{character}忽然停下了脚步。眼前的景象让他惊呆了：{scene}！这宛如一幅{metaphor}的画卷，又似一首{metaphor}的诗篇，让{character}深深沉醉其中。他开始{adverb}地{action}，试图用{action}记录下这{adj}的瞬间。然而，{character}很快发现，无论怎样{action}，都无法完全表达出此刻的{emotion}。也许，真正的{result}，是无法用{action}来形容的，它需要我们{action}去感受、去领悟。',
      '{character}继续向前走去，每一步都让他有新的{result}。他看到{scene}，这让他想起了{memory}；他听到{sound}，这让他感受到{feeling}；他触摸到{scene}，这让他领悟到{insight}。从{scene}到{scene}，从{feeling}到{feeling}，{character}的心灵经历了一次{adj}的洗礼。他深深体会到，{bigtheme}不仅仅是{simpleview}，更是{deepview}，是{deepestview}。'
    ],
    endings: [
      '当{character}依依不舍地离开{location}时，{time}已经悄悄来临。回首望去，{location}在{time}的{scene}中显得更加{adj}。今天的{action}，对{character}来说绝不仅仅是一次简单的{action}，更是一次{result}的旅程。它让{character}{result}，让{character}{result}，更让{character}{result}。带着这份{result}，{character}踏上了归途，他知道，自己的人生从此将变得更加{adj}。',
      '回家的路上，{character}的心情久久不能平静。那{adj}的一幕幕不断在脑海中回放，让{character}陷入了深深的思索。{bigquestion}？{character}一遍遍地问自己。今天的经历给了他答案：{answer}。是的，{character}微笑着望向远方，他仿佛看到了{vision}，感受到了{feeling}。这次{action}，将成为{character}人生中一笔宝贵的财富，激励着他不断{action}，去{action}。',
      '夜幕降临，{character}躺在床上，却久久无法入眠。今天在{location}的所见所闻所感，如{metaphor}般在他的心头{action}。{character}忽然明白了，我们每个人都是{metaphor}，都在{bigtheme}中{action}。而今天的这段{adj}的经历，就是{character}人生{metaphor}中{metaphor}的一页。明天，{character}将带着这份{result}，继续{action}，去书写属于自己的{metaphor}。因为他深深知道，{belief}。'
    ]
  },
  grade6: {
    openings: [
      '{time}，{character}伫立在{location}，凝望着眼前{adj}的{scene}，心中不禁涌起万千思绪，{emotion}与{emotion}交织在一起，久久难以平复。远处，{scene}，{sound}，这一切都在无声地诉说着{story}，将{character}的思绪带向了{placename}，带向了{bigtheme}的深处。',
      '在{character}迄今为止的人生旅途中，{time}在{location}的那次{action}，无疑是最{adj}、最{adj}、也最{adj}的一段记忆。它像{metaphor}，深深地镌刻在{character}的心灵深处，每当{condition}，便会{action}，让{character}重新{action}，重新{action}。',
      '人们常说，{bigtheme}是{metaphor}。对于这句话，{character}以前总是{simpleview}。直到{time}，当{character}站在{location}，亲眼目睹了那{adj}的{scene}，亲身体验了那份{feeling}之后，他才蓦然惊觉，自己之前的理解是多么的{simpleview}。原来，{bigtheme}远比我们想象的要{adj}，要{adj}，要{adj}。'
    ],
    middles: [
      '当{character}的目光与{scene}交汇的那一刻，时间仿佛静止了，所有的喧嚣都悄然退去，只留下{character}与这{adj}的景象默默对视。他仿佛听到了{sound}——那是{metaphor}在{action}，是{metaphor}在{action}，更是{deepmeaning}在{character}心中{result}。这一刻，{character}忽然领悟到{realization}。是啊，从{scene}到{scene}，从{action}到{action}，从{feeling}到{feeling}，这其中蕴含的，不正是{bigtheme}最本质、最深刻的内涵吗？{character}不禁想起了{memory}，想起了{memory}，想起了所有那些{adj}的瞬间。原来，{bigtheme}从来都不是{metaphor}，而是{metaphor}；不是{metaphor}，而是{metaphor}。它需要我们{action}，需要我们{action}，更需要我们{action}。',
      '沿着{location}缓缓前行，{character}的思绪如同{metaphor}般{action}。他看到{scene}——那是{metaphor}，在{time}的长河中{action}；他听到{sound}——那是{metaphor}，在{bigtheme}的{scene}中{action}；他感受到{feeling}——那是{metaphor}，在{character}的心灵深处{action}。这三重感受交织在一起，形成了一股{adj}的力量，冲击着{character}的内心，让他对{bigtheme}有了全新的、{adj}的认识。以前，{character}总以为{oldview}；现在，他终于明白{newview}。这种认知的转变，绝不是简单的{action}，而是一次{result}的蜕变，一次{result}的升华。{character}知道，从这一刻起，他看待{bigtheme}的眼光将永远不同了。',
      '置身于这{adj}的{location}，{character}仿佛穿越了时空，与{scene}进行着一场无声的对话，心灵得到了前所未有的{result}。他想到了{person}，想到了{person}是如何{action}，如何{action}，如何{action}。与{person}相比，{character}忽然觉得自己的{action}是那么的{simpleview}，自己的{emotion}是那么的{simpleview}。然而，就在这时，{scene}吸引了{character}的注意：{detaileddescription}。看着这{adj}的一幕，{character}的眼眶不禁湿润了。他忽然明白了：{bigtheme}并不在于{metaphor}，而在于{metaphor}；不在于{metaphor}，而在于{metaphor}。每个人都在用自己的方式{action}，每个人都是{metaphor}。这个{adj}的领悟，像{metaphor}一样，照亮了{character}前行的道路。'
    ],
    endings: [
      '如果说人生是一部{metaphor}的巨著，那么今天在{location}的这段{adj}的经历，便是其中{metaphor}的篇章。{character}在其中读到了{reading}，读到了{reading}，更读到了{reading}。带着这份沉甸甸的{result}，{character}踏上了归途。他的脚步比来时更加{adj}，他的眼神比来时更加{adj}，因为他知道，从今天起，自己将以一种全新的姿态去{action}，去{action}，去{action}。{time}的{scene}渐渐远去，但它带给{character}的{result}，却将永远{action}，成为{character}人生道路上{metaphor}，指引着他不断{action}，去{action}，去{action}。',
      '当{character}依依不舍地告别{location}时，{time}已经悄悄来临。回首望去，{location}在{time}的{scene}中宛如{metaphor}，{description}。今天的{action}，对{character}来说，绝不仅仅是一次简单的{action}，而是一次{result}、一次{result}、一次{result}。它让{character}对{bigtheme}有了{adj}的认识，对{bigtheme}有了{adj}的理解，对{bigtheme}有了{adj}的追求。回到家中，{character}坐在书桌前，久久没有动笔。他在想，该用怎样的语言才能描述今天的{result}？然而，{character}很快发现，任何语言在如此{adj}的{result}面前都显得那么{metaphor}。最终，{character}只写下了一句话：{shortquote}。是的，仅此而已，却已足够。因为{character}知道，真正的{result}，从来都不是用{action}来记录的，而是用{action}去{action}的。',
      '夜深了，{character}躺在床上，凝望着窗外{adj}的{scene}，今天在{location}的点点滴滴如{metaphor}般在他的心头{action}。从{scene}到{scene}，从{action}到{action}，从{feeling}到{feeling}，这{adj}的一幕幕共同构成了{character}生命中{metaphor}。{character}忽然明白了：我们每个人的一生，都是在不断地{action}，不断地{action}，不断地{action}。而那些{adj}的{scene}、{adj}的{feeling}、{adj}的{insight}，便是{bigtheme}赐予我们最珍贵的{result}。{character}紧紧地将这份{result}捧在手心，就像捧着{metaphor}。他知道，明天的太阳升起时，他将带着这份{result}，继续{action}，去书写属于自己的{metaphor}。因为，{character}在心中{adverb}地对自己说：{finalquote}。'
    ]
  }
};

const GRADE_WRITING_TIPS: Record<string, string[]> = {
  grade1: [
    '写作文时要写清楚：什么时间、谁、在什么地方、做什么。',
    '可以用简单的词语，比如"大的""小的""红的""绿的"来形容东西。',
    '每句话要短一些，说清楚一句话再写下一句。',
    '写完后读一读，看看句子通顺不通顺。'
  ],
  grade2: [
    '观察图片时，可以从远到近或从上到下按顺序来看。',
    '试着用"美丽的""可爱的""认真地""仔细地"这样的词语让句子更生动。',
    '可以加入人物的对话，比如谁说了什么话。',
    '开头交代时间和地点，结尾说说自己的心情，这样作文就完整了。'
  ],
  grade3: [
    '写人物时要写出他的动作和神态，比如"他皱着眉头思考"。',
    '可以尝试写一个比喻句，比如"树上的苹果像一个个小灯笼"。',
    '加入心理活动描写，写写"我心想……"，让文章更真实。',
    '作文要有开头、中间、结尾三个部分，每部分各有侧重。'
  ],
  grade4: [
    '环境描写很重要，可以通过描写天气、景物来烘托气氛。',
    '可以运用比喻、拟人、排比等多种修辞手法，让文章文采飞扬。',
    '注意细节描写，比如人物的一个眼神、一个细微的动作，都能打动人。',
    '学会使用过渡句，让段落之间衔接自然，文章更流畅。'
  ],
  grade5: [
    '文章要有明确的中心思想，所有内容都要围绕中心来写。',
    '选材要新颖独特，避免人云亦云，写出自己独特的感受。',
    '结尾可以写自己的感悟和收获，升华文章的主题。',
    '注意文章的详略安排，重要的内容详写，次要的内容略写。'
  ],
  grade6: [
    '写作前先构思好文章的整体结构，可以使用倒叙、插叙等叙述方式。',
    '注重语言的锤炼，用词要精准生动，避免重复和口语化。',
    '可以运用象征、借物抒情、托物言志等表现手法，使文章更有深度。',
    '文章要有真情实感，以情动人，让读者产生共鸣。',
    '写完后反复修改，从立意、结构、语言等多方面打磨，精益求精。'
  ]
};

const TITLE_TEMPLATES: Record<string, string[]> = {
  grade1: [
    '快乐的一天',
    '去公园玩',
    '我和妈妈',
    '可爱的小鸟',
    '今天真开心'
  ],
  grade2: [
    '难忘的星期天',
    '美丽的公园',
    '一件有趣的事',
    '我和小明的故事',
    '快乐的春游'
  ],
  grade3: [
    '{time}的一件事',
    '记一次{action}',
    '发生在{location}的故事',
    '{character}的{emotion}一天',
    '令我{emotion}的一件事'
  ],
  grade4: [
    '那一次，我懂得了{insight}',
    '{location}里的{adj}瞬间',
    '一抹{adj}的记忆',
    '与{scene}的美丽邂逅',
    '那一刻，我{emotion}了'
  ],
  grade5: [
    '在{location}读懂了{bigtheme}',
    '{scene}让我明白',
    '珍藏在心底的{adj}',
    '那{adj}的一幕幕',
    '一次{result}的心灵之旅'
  ],
  grade6: [
    '站在{location}前的沉思',
    '当{scene}与心灵相遇',
    '镌刻在时光里的{adj}',
    '论{bigtheme}的{adj}内涵',
    '从{scene}看{bigtheme}'
  ]
};

const CHARACTER_POOL: Record<string, string[]> = {
  children: ['小明', '小红', '小刚', '小丽', '小华', '小军', '小芳', '小强', '小美', '小伟'],
  adults: ['老师', '妈妈', '爸爸', '奶奶', '爷爷', '阿姨', '叔叔', '护士', '农民伯伯', '警察叔叔'],
  animals: ['小鸟', '小狗', '小猫', '兔子', '蝴蝶', '松鼠', '小鱼', '鸽子', '大熊猫', '猴子']
};

const EMOTIONS_BY_GRADE: Record<string, string[]> = {
  grade1: ['开心', '高兴', '快乐', '喜欢', '好'],
  grade2: ['开心', '高兴', '快乐', '兴奋', '感动', '难忘'],
  grade3: ['开心', '兴奋', '感动', '自豪', '温暖', '难忘', '幸福'],
  grade4: ['兴奋', '感动', '自豪', '温暖', '震撼', '敬佩', '陶醉'],
  grade5: ['震撼', '感动', '自豪', '敬佩', '陶醉', '感悟', '深思', '鼓舞'],
  grade6: ['震撼', '深思', '感悟', '启迪', '振奋', '升华', '敬畏', '眷恋']
};

const SIMPLE_ACTIONS: Record<string, string[]> = {
  grade1: ['玩', '看书', '跑步', '笑', '吃', '走', '看', '听'],
  grade2: ['玩耍', '观察', '打扫', '阅读', '欣赏', '学习', '帮助别人', '画画'],
  grade3: ['认真地看书', '快乐地奔跑', '仔细地观察', '专心地写作业', '努力地爬山', '耐心地帮助同学'],
  grade4: ['聚精会神地阅读', '兴致勃勃地探索', '情不自禁地赞叹', '小心翼翼地呵护', '恋恋不舍地离开'],
  grade5: ['全神贯注地观察', '心旷神怡地感受', '兴致勃勃地体验', '触景生情地回忆', '意味深长地思考'],
  grade6: ['兴致盎然地探索', '专心致志地研究', '心潮澎湃地感受', '意蕴深远地思考', '淋漓尽致地展现']
};

const TIME_BY_GRADE: Record<string, string[]> = {
  grade1: ['今天', '星期天', '早上', '下午'],
  grade2: ['星期天的早晨', '一个阳光明媚的下午', '春天的早上', '周末的下午'],
  grade3: ['星期天的早晨', '一个阳光明媚的下午', '春天的早上', '放学后的傍晚', '假期里的一天'],
  grade4: ['一个风和日丽的周末', '春暖花开的时节', '秋高气爽的午后', '那年暮春的一个清晨', '记忆中那个{adj}的日子'],
  grade5: ['那个{adj}的清晨', '正值{season}的美好时节', '在我{adj}的记忆里', '那年的{season}格外{adj}'],
  grade6: ['那个{adj}而{adj}的午后', '正值{season}、{adj}的时节', '在我{adj}而{adj}的青春岁月里', '那年的{season}，似乎格外{adj}']
};

const LOCATION_BY_GRADE: Record<string, string[]> = {
  grade1: ['公园', '学校', '家里', '操场'],
  grade2: ['美丽的公园', '宽敞的教室', '温馨的家里', '热闹的操场', '安静的图书馆'],
  grade3: ['美丽的公园里', '宽敞明亮的教室里', '温馨的家里', '热闹的操场上', '风景如画的郊外', '安静的图书馆里'],
  grade4: ['风景如画的{location}公园', '充满欢声笑语的{location}校园', '郁郁葱葱的{location}郊外', '鸟语花香的{location}花园', '古朴典雅的{location}庭院'],
  grade5: ['充满{adj}气息的{location}园林', '承载着{adj}记忆的{location}小路', '洋溢着{adj}氛围的{location}校园', '浸润着{adj}的{location}旧居', '见证着{adj}的{location}长廊'],
  grade6: ['承载着{adj}与{adj}的{location}古巷', '弥漫着{adj}与{adj}的{location}书院', '积淀着{adj}底蕴的{location}旧址', '镌刻着{adj}篇章的{location}长廊', '诉说着{adj}故事的{location}小院']
};

const TEMPLATE_VALUES_BY_GRADE: Record<string, Record<string, string[]>> = {
  grade1: {
    feeling: ['很开心', '很高兴', '很快乐'],
    thought: ['真好！', '真好玩！', '真好看！'],
    exclamation: ['真好！', '真美！', '真好玩！'],
    metaphor: ['一朵花', '一只小鸟', '一个太阳'],
    description: ['好看', '好玩', '美丽'],
    discovery: ['一只小鸟', '一朵小花', '一只蝴蝶'],
    decision: ['以后还要来玩', '以后要好好学习', '以后要天天开心'],
    insight: ['快乐很重要', '学习很重要', '朋友很重要'],
    result: ['快乐', '开心', '好朋友'],
    quality: ['开心', '快乐', '认真'],
    belief: ['好好学习', '天天开心', '和朋友好好玩'],
    memory: ['昨天玩的游戏', '妈妈讲的故事', '幼儿园的事'],
    association: ['好玩的事', '学过的儿歌', '妈妈讲的故事'],
    realization: ['要开心', '要好好学习', '要和小朋友好好玩'],
    sound: ['小鸟叫', '小朋友笑', '风吹树叶响'],
    bigtheme: ['开心', '快乐', '好玩'],
    simpleview: ['一件小事', '很好玩的事', '一件好事'],
    deepview: ['快乐的事', '开心的事', '好玩的事'],
    deepestview: ['最开心的事', '最好玩的事', '最快乐的事'],
    bigquestion: ['为什么这么好玩', '为什么这么开心', '怎么这么好看'],
    answer: ['因为开心', '因为好玩', '因为好看'],
    vision: ['更多好玩的', '更多好吃的', '更多朋友'],
    story: ['好玩的事', '开心的事', '好看的事'],
    person: ['妈妈', '老师', '爸爸'],
    reading: ['好玩的事', '好看的东西', '好吃的东西'],
    shortquote: ['真好玩！', '真开心！', '真好看！'],
    finalquote: ['我要天天开心！', '我要好好学习！', '我要和好朋友好好玩！'],
    detaileddescription: ['一只小鸟在飞', '一朵小花在开', '小朋友在玩'],
    deepmeaning: ['好看的', '好玩的', '好吃的'],
    alternative: ['坐着不动', '不好好玩', '不学习'],
    question: ['为什么好玩', '为什么开心', '为什么好看'],
    unexpected: ['这么好玩', '这么开心', '这么好看'],
    history: ['以前好玩的事', '以前开心的事', '好看的东西'],
    oldview: ['不好玩', '不开心', '不好看'],
    newview: ['很好玩', '很开心', '很好看'],
    reason: ['因为好看', '因为好玩', '因为开心'],
    condition: ['下雨了', '天黑了', '累了']
  },
  grade2: {
    feeling: ['心情很好', '很开心', '很快乐', '很高兴'],
    thought: ['真是太美了！', '真有趣！', '我也要这样！', '真开心！'],
    exclamation: ['真美啊！', '真有趣！', '好开心啊！'],
    metaphor: ['一朵美丽的花', '一只可爱的小鸟', '一个红红的太阳'],
    description: ['美丽动人', '很好看', '真有趣'],
    discovery: ['一件有趣的事情', '一个小小的惊喜', '一朵美丽的花'],
    decision: ['以后还要来这里', '要更加努力学习', '要做个好孩子'],
    insight: ['快乐的意义', '朋友很重要', '学习很有趣'],
    result: ['美好的回忆', '开心的一天', '好朋友'],
    quality: ['勇敢', '善良', '勤劳'],
    belief: ['努力就会进步', '开心过好每一天', '帮助别人很快乐'],
    memory: ['小时候的趣事', '老师说过的话', '妈妈讲的故事'],
    association: ['有趣的往事', '学过的课文', '好朋友在一起的时光'],
    realization: ['帮助别人很快乐', '认真学习很重要', '大自然真美丽'],
    sound: ['小鸟的歌声', '小朋友的笑声', '树叶沙沙响'],
    bigtheme: ['快乐', '成长', '友谊', '美好'],
    simpleview: ['一件简单的事', '一件有趣的事', '一件小事'],
    deepview: ['一份快乐', '一份友谊', '美好的时光'],
    deepestview: ['最珍贵的回忆', '最快乐的时光', '最好的朋友'],
    bigquestion: ['为什么这么快乐', '我们要怎样学习', '什么是好朋友'],
    answer: ['因为有好朋友', '要认真努力', '一起玩一起学习'],
    vision: ['更美好的明天', '更多的好朋友', '学到更多知识'],
    story: ['有趣的故事', '美好的时光', '快乐的回忆'],
    person: ['妈妈', '老师', '爸爸'],
    reading: ['有趣的故事', '美丽的风景', '快乐的时光'],
    shortquote: ['今天真开心！', '真是美好的一天！', '我喜欢这里！'],
    finalquote: ['我要快乐地学习和成长！', '每一天都值得珍惜！', '我要和好朋友永远在一起！'],
    detaileddescription: ['一只小鸟在树上唱歌', '一朵小花在阳光下开放', '小朋友们在一起快乐地玩耍'],
    deepmeaning: ['大自然的美好', '快乐的感觉', '友谊的温暖'],
    alternative: ['坐着不动', '不认真学习', '不跟朋友玩'],
    question: ['什么是快乐', '怎样学习更好', '怎样交到好朋友'],
    unexpected: ['会这么开心', '会这么有趣', '会这么美丽'],
    history: ['过去的美好时光', '小时候的趣事', '以前的回忆'],
    oldview: ['学习很无聊', '交朋友很难', '这里不好玩'],
    newview: ['学习很有趣', '交朋友很开心', '这里真好玩'],
    reason: ['景色太美了', '和朋友在一起很开心', '今天收获很多'],
    condition: ['天气不太好', '有点累了', '天快黑了']
  },
  grade3: {
    feeling: ['心旷神怡', '心情舒畅', '流连忘返', '很感动', '很开心'],
    thought: ['真是太美了！', '我也要像这样！', '大自然真神奇！', '今天真开心！'],
    exclamation: ['太美了！', '真有趣啊！', '好感动啊！', '太神奇了！'],
    metaphor: ['一幅美丽的画', '一首动听的歌', '一个温暖的梦', '一颗闪亮的星星'],
    description: ['美丽动人', '栩栩如生', '光彩夺目', '令人陶醉'],
    discovery: ['一个小小的秘密', '一件有趣的事情', '一个意想不到的惊喜', '一道美丽的风景'],
    decision: ['以后还要来这里', '要更加努力学习', '要做一个乐于助人的人', '要好好保护大自然'],
    insight: ['快乐的真谛', '坚持的意义', '团结的力量', '大自然的美好'],
    result: ['宝贵的收获', '深刻的感悟', '美好的回忆', '心灵的成长'],
    quality: ['坚持', '勇气', '善良', '勤劳', '热爱'],
    belief: ['努力就会有收获', '世界是美好的', '团结就是力量', '付出就有回报'],
    memory: ['小时候的一件事', '老师曾经说过的话', '妈妈的教诲', '那段美好的时光'],
    association: ['很多美好的往事', '书本上学到的知识', '爸爸妈妈的教导', '一个古老的传说'],
    realization: ['什么才是真正的美', '坚持的意义有多么重要', '大自然有多么神奇', '帮助别人是多么快乐'],
    sound: ['小鸟的歌声', '溪水的流淌声', '树叶的沙沙声', '孩子们的欢笑声'],
    bigtheme: ['生命', '成长', '自然', '时光', '美好', '勇气'],
    simpleview: ['很简单的一件事', '表面看到的那样', '一件容易的事'],
    deepview: ['一种精神的追求', '一份珍贵的情感', '人生的一种境界'],
    deepestview: ['我们生命中最宝贵的财富', '心灵深处最温暖的港湾', '人生永恒的追求'],
    bigquestion: ['人生的意义究竟是什么', '我们应该怎样面对生活', '什么才是真正的美好'],
    answer: ['用热爱和坚持去书写每一天', '珍惜当下，感恩生活', '用心感受生命中的每一份美好'],
    vision: ['更美好的未来', '前方灿烂的阳光', '生活中更多的精彩'],
    story: ['岁月的故事', '时光的变迁', '生命的美好'],
    person: ['那位伟大的作家', '历史上的先贤', '身边的榜样'],
    reading: ['生命的律动', '时光的珍贵', '自然的伟大', '人性的光辉'],
    shortquote: ['这一刻，将永远定格。', '原来美好就在身边。', '生活，值得我们用心去爱。'],
    finalquote: ['生活，永远值得我去热爱、去探索、去书写。', '每一个今天，都是未来最珍贵的回忆。', '用心感受，才能看见生命最美的风景。'],
    detaileddescription: ['一只小蚂蚁正在努力搬运比自己大几倍的食物', '一朵小花在石缝中顽强地绽放', '一位老人正在耐心地给孩子讲故事'],
    deepmeaning: ['生命的力量', '时光的低语', '自然的智慧'],
    alternative: ['被动地等待', '随波逐流', '墨守成规'],
    question: ['什么才是真正有价值的', '我们应该追求什么', '生命的意义在哪里'],
    unexpected: ['自己会有如此深刻的感悟', '这个瞬间会如此动人', '这样的场景会带来启迪'],
    history: ['岁月的沧桑', '时光的变迁', '历史的印记'],
    oldview: ['事情不过如此简单', '一切都理所当然', '生活就是平平淡淡'],
    newview: ['平凡中蕴含着伟大', '每一刻都值得珍惜', '生活处处皆是美好'],
    reason: ['眼前的景象太美了', '今天的收获特别大', '他付出了很多努力', '这件事让他深受感动'],
    condition: ['天气不好', '遇到了困难', '已经很累了', '时间很晚了']
  }
};

const FORBIDDEN_WORDS_BY_GRADE: Record<string, string[]> = {
  grade1: [
    '然而', '但是', '可是', '虽然', '尽管', '不过', '反而', '因此', '所以', '因为',
    '不仅', '而且', '并且', '或者', '还是', '如果', '假如', '即使', '就算', '既然',
    '无论', '不管', '只要', '只有', '除非', '以便', '以免', '于是', '然后', '接着',
    '首先', '其次', '最后', '终于', '其实', '实际上', '事实上', '显然', '当然',
    '的确', '确实', '或许', '大概', '似乎', '好像', '仿佛', '宛如', '犹如',
    '兴高采烈', '聚精会神', '情不自禁', '恋恋不舍', '小心翼翼', '津津有味',
    '风景如画', '生机勃勃', '五彩斑斓', '清澈见底', '郁郁葱葱', '秋高气爽',
    '不约而同', '栩栩如生', '春暖花开', '一碧如洗', '热闹非凡', '专心致志',
    '心旷神怡', '美不胜收', '引人入胜', '触景生情', '回味无穷', '流光溢彩',
    '精妙绝伦', '喜气洋洋', '全神贯注', '意味深长', '淋漓尽致', '繁花似锦',
    '层林尽染', '硕果累累', '兴致盎然', '心潮澎湃', '意蕴深远', '惟妙惟肖',
    '跌宕起伏', '感人至深', '姹紫嫣红', '如诗如画', '五彩缤纷', '层峦叠翠'
  ],
  grade2: [
    '然而', '尽管', '反而', '因此', '既然', '无论', '不管', '除非', '以便', '以免',
    '其实', '实际上', '事实上', '显然', '的确', '确实', '或许', '大概',
    '情不自禁', '恋恋不舍', '小心翼翼', '津津有味', '风景如画', '生机勃勃',
    '五彩斑斓', '清澈见底', '郁郁葱葱', '秋高气爽', '不约而同', '栩栩如生',
    '春暖花开', '一碧如洗', '心旷神怡', '美不胜收', '引人入胜', '触景生情',
    '回味无穷', '流光溢彩', '精妙绝伦', '全神贯注', '意味深长', '淋漓尽致',
    '繁花似锦', '层林尽染', '硕果累累', '兴致盎然', '心潮澎湃', '意蕴深远',
    '惟妙惟肖', '跌宕起伏', '感人至深', '姹紫嫣红', '如诗如画', '五彩缤纷',
    '层峦叠翠'
  ],
  grade3: [
    '然而', '尽管', '反而', '因此', '既然', '无论', '不管', '除非', '以便', '以免',
    '其实', '实际上', '事实上', '显然', '的确', '确实', '或许', '大概',
    '心旷神怡', '美不胜收', '引人入胜', '触景生情', '回味无穷', '流光溢彩',
    '精妙绝伦', '全神贯注', '意味深长', '淋漓尽致', '繁花似锦', '层林尽染',
    '硕果累累', '兴致盎然', '心潮澎湃', '意蕴深远', '惟妙惟肖', '跌宕起伏',
    '感人至深', '姹紫嫣红', '如诗如画', '五彩缤纷', '层峦叠翠'
  ],
  grade4: [
    '心潮澎湃', '意蕴深远', '惟妙惟肖', '跌宕起伏', '感人至深'
  ],
  grade5: [],
  grade6: []
};

const MAX_SENTENCE_LENGTH: Record<string, number> = {
  grade1: 10,
  grade2: 14,
  grade3: 20,
  grade4: 24,
  grade5: 28,
  grade6: 32
};

interface SceneContext {
  gradeLevel: string;
  characters: string[];
  actions: string[];
  emotions: string[];
  time: string;
  location: string;
  mainCharacter: string;
  otherCharacter: string;
  vocab: GradeVocabulary;
  sentences: GradeSentenceTemplates;
  paragraphs: GradeParagraphStructure;
  scene: string;
}

@Injectable()
export class PictureWritingService {
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

  private extractKeywords(description: string | undefined): {
    characters: string[];
    actions: string[];
    scene: string;
    location: string;
  } {
    if (!description || !description.trim()) {
      return { characters: [], actions: [], scene: '', location: '' };
    }

    const foundCharacters: string[] = [];
    const foundActions: string[] = [];
    let foundScene = '';
    let foundLocation = '';

    const charPattern = /(小明|小红|小刚|小丽|小华|小军|小芳|小强|小美|小伟|老师|妈妈|爸爸|奶奶|爷爷|阿姨|叔叔|护士|小鸟|小狗|小猫|兔子|蝴蝶|松鼠|小鱼|鸽子|小朋友|同学)/g;
    const charMatches = description.match(charPattern);
    if (charMatches) {
      foundCharacters.push(...charMatches);
    }

    const actionPattern = /(看书|读书|跑步|玩耍|游戏|学习|写字|画画|唱歌|跳舞|吃饭|睡觉|打扫|爬山|游泳|钓鱼|做饭|浇水|植树|观察|微笑|奔跑|跳绳|打球|帮助|打扫)/g;
    const actionMatches = description.match(actionPattern);
    if (actionMatches) {
      foundActions.push(...actionMatches.map(a => a));
    }

    const locationPattern = /(公园|学校|教室|家里|操场|郊外|图书馆|河边|山坡|校园|院子|动物园|海边|市场|田野)/g;
    const locationMatches = description.match(locationPattern);
    if (locationMatches && locationMatches.length > 0) {
      foundLocation = locationMatches[0];
    }

    if (description.trim().length > 0 && description.trim().length < 50) {
      foundScene = description.trim();
    }

    return {
      characters: [...new Set(foundCharacters)],
      actions: [...new Set(foundActions)],
      scene: foundScene,
      location: foundLocation
    };
  }

  private getTemplateValue(key: string, gradeLevel: string, rand: () => number): string {
    const gradePool = TEMPLATE_VALUES_BY_GRADE[gradeLevel];
    if (gradePool && gradePool[key]) {
      return this.pickOne(gradePool[key], rand);
    }
    const grade3Pool = TEMPLATE_VALUES_BY_GRADE.grade3;
    if (grade3Pool && grade3Pool[key]) {
      return this.pickOne(grade3Pool[key], rand);
    }
    return '';
  }

  private fillTemplate(template: string, ctx: SceneContext, rand: () => number): string {
    const { vocab, gradeLevel } = ctx;
    let result = template;

    result = result.replace(/{character}/g, ctx.mainCharacter);
    result = result.replace(/{other}/g, ctx.otherCharacter);
    result = result.replace(/{time}/g, ctx.time);
    result = result.replace(/{location}/g, ctx.location);
    result = result.replace(/{emotion}/g, () => this.pickOne(ctx.emotions, rand));
    result = result.replace(/{adj}/g, () => this.pickOne(vocab.adjectives, rand));
    result = result.replace(/{adverb}/g, () => this.pickOne(vocab.adverbs, rand));
    result = result.replace(/{noun}/g, () => this.pickOne(vocab.nouns, rand));
    result = result.replace(/{action}/g, () => this.pickOne(ctx.actions, rand));
    result = result.replace(/{idiom}/g, () => this.pickOne(vocab.idioms, rand));
    result = result.replace(/{scene}/g, () => ctx.scene || '美丽的景象');
    result = result.replace(/{season}/g, () => this.pickOne(['春天', '夏天', '秋天', '冬天'], rand));
    result = result.replace(/{placename}/g, () => this.pickOne(['远方', '记忆深处', '童年时光', '历史长河'], rand));
    result = result.replace(/{reason}/g, () => this.getTemplateValue('reason', gradeLevel, rand));
    result = result.replace(/{condition}/g, () => this.getTemplateValue('condition', gradeLevel, rand));
    result = result.replace(/{feeling}/g, () => this.getTemplateValue('feeling', gradeLevel, rand));
    result = result.replace(/{thought}/g, () => this.getTemplateValue('thought', gradeLevel, rand));
    result = result.replace(/{exclamation}/g, () => this.getTemplateValue('exclamation', gradeLevel, rand));
    result = result.replace(/{metaphor}/g, () => this.getTemplateValue('metaphor', gradeLevel, rand));
    result = result.replace(/{description}/g, () => this.getTemplateValue('description', gradeLevel, rand));
    result = result.replace(/{discovery}/g, () => this.getTemplateValue('discovery', gradeLevel, rand));
    result = result.replace(/{decision}/g, () => this.getTemplateValue('decision', gradeLevel, rand));
    result = result.replace(/{insight}/g, () => this.getTemplateValue('insight', gradeLevel, rand));
    result = result.replace(/{result}/g, () => this.getTemplateValue('result', gradeLevel, rand));
    result = result.replace(/{quality}/g, () => this.getTemplateValue('quality', gradeLevel, rand));
    result = result.replace(/{belief}/g, () => this.getTemplateValue('belief', gradeLevel, rand));
    result = result.replace(/{memory}/g, () => this.getTemplateValue('memory', gradeLevel, rand));
    result = result.replace(/{association}/g, () => this.getTemplateValue('association', gradeLevel, rand));
    result = result.replace(/{realization}/g, () => this.getTemplateValue('realization', gradeLevel, rand));
    result = result.replace(/{sound}/g, () => this.getTemplateValue('sound', gradeLevel, rand));
    result = result.replace(/{bigtheme}/g, () => this.getTemplateValue('bigtheme', gradeLevel, rand));
    result = result.replace(/{simpleview}/g, () => this.getTemplateValue('simpleview', gradeLevel, rand));
    result = result.replace(/{deepview}/g, () => this.getTemplateValue('deepview', gradeLevel, rand));
    result = result.replace(/{deepestview}/g, () => this.getTemplateValue('deepestview', gradeLevel, rand));
    result = result.replace(/{bigquestion}/g, () => this.getTemplateValue('bigquestion', gradeLevel, rand));
    result = result.replace(/{answer}/g, () => this.getTemplateValue('answer', gradeLevel, rand));
    result = result.replace(/{vision}/g, () => this.getTemplateValue('vision', gradeLevel, rand));
    result = result.replace(/{story}/g, () => this.getTemplateValue('story', gradeLevel, rand));
    result = result.replace(/{person}/g, () => this.getTemplateValue('person', gradeLevel, rand));
    result = result.replace(/{reading}/g, () => this.getTemplateValue('reading', gradeLevel, rand));
    result = result.replace(/{shortquote}/g, () => this.getTemplateValue('shortquote', gradeLevel, rand));
    result = result.replace(/{finalquote}/g, () => this.getTemplateValue('finalquote', gradeLevel, rand));
    result = result.replace(/{detaileddescription}/g, () => this.getTemplateValue('detaileddescription', gradeLevel, rand));
    result = result.replace(/{deepmeaning}/g, () => this.getTemplateValue('deepmeaning', gradeLevel, rand));
    result = result.replace(/{alternative}/g, () => this.getTemplateValue('alternative', gradeLevel, rand));
    result = result.replace(/{question}/g, () => this.getTemplateValue('question', gradeLevel, rand));
    result = result.replace(/{unexpected}/g, () => this.getTemplateValue('unexpected', gradeLevel, rand));
    result = result.replace(/{history}/g, () => this.getTemplateValue('history', gradeLevel, rand));
    result = result.replace(/{oldview}/g, () => this.getTemplateValue('oldview', gradeLevel, rand));
    result = result.replace(/{newview}/g, () => this.getTemplateValue('newview', gradeLevel, rand));

    return result;
  }

  private buildSceneContext(
    gradeLevel: string,
    extracted: { characters: string[]; actions: string[]; scene: string; location: string },
    rand: () => number
  ): SceneContext {
    const vocab = GRADE_VOCABULARY[gradeLevel] || GRADE_VOCABULARY.grade3;
    const sentences = GRADE_SENTENCE_TEMPLATES[gradeLevel] || GRADE_SENTENCE_TEMPLATES.grade3;
    const paragraphs = GRADE_PARAGRAPH_STRUCTURE[gradeLevel] || GRADE_PARAGRAPH_STRUCTURE.grade3;

    const characters = extracted.characters.length > 0
      ? extracted.characters
      : this.pickSeeded([...CHARACTER_POOL.children, ...CHARACTER_POOL.adults], 2, rand);

    const baseActions = SIMPLE_ACTIONS[gradeLevel] || SIMPLE_ACTIONS.grade3;
    const actions = extracted.actions.length > 0
      ? extracted.actions
      : this.pickSeeded(baseActions, 3, rand);

    const emotionsPool = EMOTIONS_BY_GRADE[gradeLevel] || EMOTIONS_BY_GRADE.grade3;
    const emotions = this.pickSeeded(emotionsPool, 3, rand);

    let time = this.pickOne(TIME_BY_GRADE[gradeLevel] || TIME_BY_GRADE.grade3, rand);
    time = time.replace(/{adj}/g, () => this.pickOne(vocab.adjectives, rand));

    let location = extracted.location
      ? (this.pickOne(LOCATION_BY_GRADE[gradeLevel] || LOCATION_BY_GRADE.grade3, rand)).replace(/{location}/g, extracted.location)
      : this.pickOne(LOCATION_BY_GRADE[gradeLevel] || LOCATION_BY_GRADE.grade3, rand);
    location = location.replace(/{adj}/g, () => this.pickOne(vocab.adjectives, rand));

    const mainCharacter = characters[0];
    const otherCharacter = characters[1] || characters[0];

    const scene = extracted.scene || this.pickOne([
      '美丽的风景', '动人的瞬间', '温馨的画面', '欢乐的场景', '感人的一幕'
    ], rand);

    return {
      gradeLevel,
      characters,
      actions,
      emotions,
      time,
      location,
      mainCharacter,
      otherCharacter,
      vocab,
      sentences,
      paragraphs,
      scene
    };
  }

  private generateGrade1(ctx: SceneContext, rand: () => number, targetWords: number): string[] {
    const paragraphs: string[] = [];
    let p1 = '';
    while (p1.length < Math.floor(targetWords / 2)) {
      const tpl = this.pickOne([...ctx.paragraphs.openings, ...ctx.sentences.simple], rand);
      p1 += this.fillTemplate(tpl, ctx, rand);
    }
    paragraphs.push(p1);

    let p2 = '';
    while (p2.length < Math.ceil(targetWords / 2)) {
      const tpl = this.pickOne([...ctx.paragraphs.middles, ...ctx.paragraphs.endings, ...ctx.sentences.simple], rand);
      p2 += this.fillTemplate(tpl, ctx, rand);
    }
    paragraphs.push(p2);

    return paragraphs;
  }

  private generateGrade2(ctx: SceneContext, rand: () => number, targetWords: number): string[] {
    const paragraphs: string[] = [];
    let p1 = '';
    while (p1.length < Math.floor(targetWords / 2)) {
      const pool = [...ctx.paragraphs.openings];
      if (ctx.sentences.simple.length > 0) pool.push(...ctx.sentences.simple);
      if (ctx.sentences.compound.length > 0) pool.push(...ctx.sentences.compound);
      p1 += this.fillTemplate(this.pickOne(pool, rand), ctx, rand);
    }
    paragraphs.push(p1);

    let p2 = '';
    while (p2.length < Math.ceil(targetWords / 2)) {
      const pool = [...ctx.paragraphs.middles, ...ctx.paragraphs.endings];
      if (ctx.sentences.simple.length > 0) pool.push(...ctx.sentences.simple);
      if (ctx.sentences.compound.length > 0) pool.push(...ctx.sentences.compound);
      p2 += this.fillTemplate(this.pickOne(pool, rand), ctx, rand);
    }
    paragraphs.push(p2);

    return paragraphs;
  }

  private generateHigherGrade(
    ctx: SceneContext,
    rand: () => number,
    targetWords: number,
    paragraphsCount: number,
    gradeLevel: string
  ): string[] {
    const paragraphs: string[] = [];
    const wordsPerPara = Math.ceil(targetWords / paragraphsCount);

    let opening = this.fillTemplate(this.pickOne(ctx.paragraphs.openings, rand), ctx, rand);
    while (opening.length < wordsPerPara) {
      const pool = [...ctx.sentences.simple];
      if (ctx.sentences.compound.length > 0) pool.push(...ctx.sentences.compound);
      opening += this.fillTemplate(this.pickOne(pool, rand), ctx, rand);
      if (opening.length >= wordsPerPara) break;
    }
    paragraphs.push(opening);

    for (let i = 1; i < paragraphsCount - 1; i++) {
      let middle = this.fillTemplate(this.pickOne(ctx.paragraphs.middles, rand), ctx, rand);
      while (middle.length < wordsPerPara) {
        const pool = [...ctx.sentences.simple];
        if (ctx.sentences.compound.length > 0) pool.push(...ctx.sentences.compound);
        if (ctx.sentences.complex.length > 0) pool.push(...ctx.sentences.complex);
        if (ctx.sentences.figurative.length > 0 && rand() > 0.4) pool.push(...ctx.sentences.figurative);
        middle += this.fillTemplate(this.pickOne(pool, rand), ctx, rand);
        if (middle.length >= wordsPerPara) break;
      }
      paragraphs.push(middle);
    }

    let ending = this.fillTemplate(this.pickOne(ctx.paragraphs.endings, rand), ctx, rand);
    while (ending.length < wordsPerPara) {
      const pool = [...ctx.sentences.simple];
      if (ctx.sentences.compound.length > 0) pool.push(...ctx.sentences.compound);
      if (ctx.sentences.complex.length > 0) pool.push(...ctx.sentences.complex);
      if (ctx.sentences.figurative.length > 0 && rand() > 0.5) pool.push(...ctx.sentences.figurative);
      ending += this.fillTemplate(this.pickOne(pool, rand), ctx, rand);
      if (ending.length >= wordsPerPara) break;
    }
    paragraphs.push(ending);

    return paragraphs;
  }

  private removeForbiddenWords(text: string, gradeLevel: string): string {
    const forbidden = FORBIDDEN_WORDS_BY_GRADE[gradeLevel];
    if (!forbidden || forbidden.length === 0) return text;
    let result = text;
    for (const word of forbidden) {
      const regex = new RegExp(word, 'g');
      result = result.replace(regex, '');
    }
    return result;
  }

  private truncateLongSentences(text: string, gradeLevel: string): string {
    const maxLen = MAX_SENTENCE_LENGTH[gradeLevel] || 30;
    return text.split(/(?<=[。！？!?])/).map(sentence => {
      if (!sentence.trim()) return sentence;
      if (sentence.length > maxLen + 2) {
        let cutIdx = -1;
        const puncts = ['，', ',', '、', '；', ';'];
        for (let i = maxLen; i >= Math.floor(maxLen * 0.6); i--) {
          if (puncts.includes(sentence.charAt(i))) {
            cutIdx = i;
            break;
          }
        }
        if (cutIdx > 0) {
          return sentence.substring(0, cutIdx) + sentence.charAt(sentence.length - 1);
        }
        return sentence.substring(0, maxLen) + sentence.charAt(sentence.length - 1);
      }
      return sentence;
    }).join('');
  }

  private simplifyPunctuation(text: string, gradeLevel: string): string {
    if (gradeLevel !== 'grade1' && gradeLevel !== 'grade2') return text;
    return text
      .replace(/[；;：:]/g, '，')
      .replace(/……/g, '。')
      .replace(/\.\.\./g, '。')
      .replace(/[（(【\[][^）)】\]]*[）)】\]]/g, '');
  }

  private sanitizeContentForGrade(content: string, gradeLevel: string): string {
    if (!content || !content.trim()) return content;
    let result = content;
    result = this.removeForbiddenWords(result, gradeLevel);
    result = this.simplifyPunctuation(result, gradeLevel);
    result = this.truncateLongSentences(result, gradeLevel);
    result = result.replace(/[ ]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
    return result.trim();
  }

  async generate(request: PictureWritingRequest): Promise<PictureWritingResponse> {
    const {
      userDescription,
      gradeLevel = 'grade3',
      writingStyle = 'narrative',
      customRequirements,
      variantSeed = 0
    } = request;

    const rand = this.seededRandom(variantSeed || Date.now() % 100000);
    const gradeMeta = GRADE_META[gradeLevel] || GRADE_META.grade3;
    const vocab = GRADE_VOCABULARY[gradeLevel] || GRADE_VOCABULARY.grade3;
    const extracted = this.extractKeywords(userDescription);
    const ctx = this.buildSceneContext(gradeLevel, extracted, rand);

    const targetWords = Math.floor(
      rand() * (gradeMeta.maxWords - gradeMeta.minWords) + gradeMeta.minWords
    );

    let paragraphs: string[];

    if (gradeLevel === 'grade1') {
      paragraphs = this.generateGrade1(ctx, rand, targetWords);
    } else if (gradeLevel === 'grade2') {
      paragraphs = this.generateGrade2(ctx, rand, targetWords);
    } else {
      paragraphs = this.generateHigherGrade(ctx, rand, targetWords, gradeMeta.paragraphs, gradeLevel);
    }

    let content = paragraphs.join('\n\n');

    if (gradeLevel !== 'grade1' && gradeLevel !== 'grade2' && customRequirements && customRequirements.trim()) {
      content = customRequirements.trim() + '\n\n' + content;
    }

    content = this.sanitizeContentForGrade(content, gradeLevel);

    const titleTemplates = TITLE_TEMPLATES[gradeLevel] || TITLE_TEMPLATES.grade3;
    let title = this.fillTemplate(this.pickOne(titleTemplates, rand), ctx, rand);
    title = this.removeForbiddenWords(title, gradeLevel);

    if (title.length > 20) {
      title = title.substring(0, 18) + '…';
    }

    const analysis: PictureSceneAnalysis = {
      scene: ctx.scene,
      characters: ctx.characters,
      actions: ctx.actions,
      emotions: ctx.emotions,
      time: ctx.time,
      location: ctx.location,
      details: [
        `${gradeMeta.name}水平，约${targetWords}字`,
        `句式特点：${gradeMeta.description}`,
        `词汇量：约${vocab.adjectives.length + vocab.idioms.length}个常用词汇和短语`
      ]
    };

    let keywordPool: string[];
    if (gradeLevel === 'grade1') {
      keywordPool = vocab.adjectives.slice(0, 8);
    } else if (gradeLevel === 'grade2') {
      keywordPool = [...vocab.idioms.slice(0, 2), ...vocab.adjectives.slice(0, 6)];
    } else {
      keywordPool = [...vocab.idioms, ...vocab.adjectives.slice(0, 5)];
    }
    const keyWords = this.pickSeeded(keywordPool, 5, rand);

    const tipsPool = GRADE_WRITING_TIPS[gradeLevel] || GRADE_WRITING_TIPS.grade3;
    const writingTips = this.pickSeeded(tipsPool, 3, rand);

    return {
      analysis,
      content,
      title,
      gradeLevel: gradeMeta.name,
      wordCount: content.replace(/\s/g, '').length,
      keyWords,
      writingTips
    };
  }
}
