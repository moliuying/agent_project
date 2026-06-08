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

const GRADE_LEVEL_CONFIG: Record<string, {
  name: string;
  minWords: number;
  maxWords: number;
  paragraphs: number;
  avgSentenceLength: number;
  vocabulary: string;
}> = {
  grade1: { name: '一年级', minWords: 50, maxWords: 100, paragraphs: 2, avgSentenceLength: 8, vocabulary: '简单常用' },
  grade2: { name: '二年级', minWords: 80, maxWords: 150, paragraphs: 2, avgSentenceLength: 10, vocabulary: '基础词汇' },
  grade3: { name: '三年级', minWords: 150, maxWords: 250, paragraphs: 3, avgSentenceLength: 12, vocabulary: '常用词汇' },
  grade4: { name: '四年级', minWords: 250, maxWords: 350, paragraphs: 3, avgSentenceLength: 14, vocabulary: '丰富词汇' },
  grade5: { name: '五年级', minWords: 350, maxWords: 500, paragraphs: 4, avgSentenceLength: 16, vocabulary: '进阶词汇' },
  grade6: { name: '六年级', minWords: 450, maxWords: 600, paragraphs: 4, avgSentenceLength: 18, vocabulary: '高级词汇' },
};

const SCENES = [
  '公园里小朋友在玩耍', '校园里同学们在学习', '家里一家人其乐融融',
  '春天万物复苏的田野', '夏天绿树成荫的河边', '秋天金黄的果园',
  '冬天白雪皑皑的小院', '运动会上同学们奋力拼搏', '图书馆里安静阅读',
  '动物园里小朋友看动物', '海边孩子们捡拾贝壳', '山坡上小朋友放风筝',
  '菜市场里热闹的场景', '雨中人们撑伞行走', '节日里家人团聚吃饭',
  '医院里护士照顾病人', '公交车上年轻人让座', '农田里农民辛勤劳动',
  '博物馆里学生参观学习', '操场上同学们做游戏'
];

const CHARACTER_POOL: Record<string, string[]> = {
  children: ['小明', '小红', '小刚', '小丽', '小华', '小军', '小芳', '小强', '小美', '小伟'],
  adults: ['老师', '妈妈', '爸爸', '奶奶', '爷爷', '阿姨', '叔叔', '护士', '农民伯伯', '警察叔叔'],
  animals: ['小鸟', '小狗', '小猫', '兔子', '蝴蝶', '松鼠', '小鱼', '鸽子', '大熊猫', '猴子']
};

const ACTIONS = [
  '在认真地看书', '快乐地奔跑着', '仔细地观察着', '开心地笑着',
  '专心地写作业', '努力地爬山', '耐心地等待', '热情地打招呼',
  '轻轻地抚摸着', '兴奋地跳起来', '认真地听讲', '勤快地打扫卫生',
  '小心地捧着', '仔细地画着', '大声地朗读', '辛勤地劳动着'
];

const EMOTIONS = [
  '开心', '兴奋', '好奇', '专注', '温暖', '感动', '自豪', '满足',
  '期待', '愉快', '惊喜', '感激', '放松', '幸福', '认真'
];

const TIME_DESCRIPTIONS = [
  '星期天的早晨', '一个阳光明媚的下午', '春天的早上', '周末的下午',
  '放学后的傍晚', '假期里的一天', '春暖花开的日子', '秋高气爽的一天',
  '一个风和日丽的周末', '清晨时分'
];

const LOCATIONS = [
  '在美丽的公园里', '在宽敞明亮的教室里', '在温馨的家里',
  '在热闹的操场上', '在风景如画的郊外', '在安静的图书馆里',
  '在小河边', '在山坡上', '在校园里', '在奶奶家的院子里'
];

const WRITING_STYLES: Record<string, {
  name: string;
  openings: string[];
  transitions: string[];
  endings: string[];
}> = {
  narrative: {
    name: '记叙文',
    openings: [
      '{time}，{character}来到了{location}。',
      '记得{time}，发生了一件让我难忘的事情。',
      '今天是个好日子，{character}兴高采烈地来到{location}。'
    ],
    transitions: [
      '正在这时，', '就在这个时候，', '过了一会儿，',
      '走着走着，', '突然，', '接着，'
    ],
    endings: [
      '这真是美好的一天，{character}心里别提多高兴了。',
      '虽然时间过得很快，但是今天的经历让{character}久久不能忘怀。',
      '回家的路上，{character}还在想着今天发生的事情，嘴角露出了甜甜的微笑。'
    ]
  },
  descriptive: {
    name: '描写文',
    openings: [
      '{time}，{location}呈现出一派美丽的景象。',
      '走进{location}，一幅美丽的画卷展现在眼前。',
      '你看，{location}是多么美丽啊！'
    ],
    transitions: [
      '放眼望去，', '近处，', '远处，',
      '再看看那边，', '不仅如此，', '瞧，'
    ],
    endings: [
      '这美丽的景色，真是让人流连忘返。',
      '这样的美景，怎么不叫人陶醉呢？',
      '我喜欢这美丽的{location}，它给我带来了无尽的欢乐。'
    ]
  }
};

const GOOD_WORDS: Record<string, string[]> = {
  grade1: ['高高兴兴', '快快乐乐', '认认真真', '开开心心', '明明白白', '干干净净'],
  grade2: ['阳光明媚', '万里无云', '五颜六色', '百花盛开', '鸟语花香', '兴致勃勃'],
  grade3: ['春暖花开', '秋高气爽', '一碧如洗', '热闹非凡', '专心致志', '不约而同'],
  grade4: ['姹紫嫣红', '郁郁葱葱', '生机勃勃', '兴高采烈', '聚精会神', '情不自禁'],
  grade5: ['鸟语花香', '美不胜收', '兴致勃勃', '全神贯注', '心旷神怡', '喜气洋洋'],
  grade6: ['繁花似锦', '层林尽染', '硕果累累', '兴致盎然', '专心致志', '心潮澎湃']
};

const WRITING_TIPS = [
  '写作时要注意把人物的动作和神态写具体，让读者仿佛看到当时的场景。',
  '可以适当运用比喻、拟人等修辞手法，让文章更加生动有趣。',
  '记得按照一定的顺序来写，比如从远到近、从上到下，或者按照事情发展的顺序。',
  '多积累好词好句，在写作时灵活运用，可以让文章更加精彩。',
  '写作前先仔细观察图片，想一想：什么时间、什么地方、有什么人、在做什么、心情怎么样。',
  '写完后要认真读一读，把不通顺的地方修改过来，注意标点符号的正确使用。',
  '可以给文章加一个吸引人的题目，让读者一看就想读下去。',
  '写人物时，可以通过语言、动作、表情来表现人物的性格特点。'
];

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
      foundActions.push(...actionMatches.map(a => `在${a}`));
    }

    const locationPattern = /(公园|学校|教室|家里|操场|郊外|图书馆|河边|山坡|校园|院子|动物园|海边|市场|田野)/g;
    const locationMatches = description.match(locationPattern);
    if (locationMatches && locationMatches.length > 0) {
      foundLocation = `在${locationMatches[0]}里`;
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

  private generateParagraph(
    content: string[],
    targetLength: number,
    rand: () => number
  ): string {
    let paragraph = content.join('');
    const goodWords = this.pickSeeded(['春天', '美丽', '快乐', '认真', '温暖', '明亮', '清新'], 1, rand);

    while (paragraph.length < targetLength) {
      const expansions = [
        `${goodWords[0] && ''}阳光暖暖地洒在大地上，给万物带来了生机。`,
        '微风轻轻吹过，带来了阵阵花香。',
        '周围的一切都显得那么美好，让人感到无比幸福。',
        '看到这样的场景，心情也变得格外舒畅。',
        '树上的小鸟叽叽喳喳地叫着，好像在唱着欢快的歌。',
        '路边的小花张开了笑脸，仿佛在向我们点头问好。'
      ];
      paragraph += this.pickOne(expansions, rand);
      if (paragraph.length >= targetLength) break;
    }

    return paragraph;
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
    const gradeConfig = GRADE_LEVEL_CONFIG[gradeLevel] || GRADE_LEVEL_CONFIG.grade3;
    const styleConfig = WRITING_STYLES[writingStyle] || WRITING_STYLES.narrative;

    const extracted = this.extractKeywords(userDescription);

    const selectedCharacters = extracted.characters.length > 0
      ? extracted.characters
      : this.pickSeeded([...CHARACTER_POOL.children, ...CHARACTER_POOL.adults], 2, rand);

    const selectedActions = extracted.actions.length > 0
      ? extracted.actions
      : this.pickSeeded(ACTIONS, 2, rand);

    const selectedEmotions = this.pickSeeded(EMOTIONS, 2, rand);
    const selectedTime = this.pickOne(TIME_DESCRIPTIONS, rand);
    const selectedLocation = extracted.location || this.pickOne(LOCATIONS, rand);
    const mainCharacter = selectedCharacters[0];

    const scene = extracted.scene || this.pickOne(SCENES, rand);

    const analysis: PictureSceneAnalysis = {
      scene,
      characters: selectedCharacters,
      actions: selectedActions,
      emotions: selectedEmotions,
      time: selectedTime,
      location: selectedLocation,
      details: [
        `${mainCharacter}今天穿着干净整洁的衣服`,
        `${selectedTime}的天气特别好`,
        `周围的环境十分${this.pickOne(['美丽', '安静', '热闹', '温馨'], rand)}`
      ]
    };

    const paragraphs: string[] = [];
    const targetWords = Math.floor(
      rand() * (gradeConfig.maxWords - gradeConfig.minWords) + gradeConfig.minWords
    );
    const wordsPerPara = Math.ceil(targetWords / gradeConfig.paragraphs);

    const openingTemplate = this.pickOne(styleConfig.openings, rand);
    let opening = openingTemplate
      .replace('{time}', selectedTime)
      .replace('{character}', mainCharacter)
      .replace('{location}', selectedLocation);

    if (customRequirements && customRequirements.trim()) {
      opening += customRequirements.trim();
    }

    paragraphs.push(opening);

    for (let i = 1; i < gradeConfig.paragraphs; i++) {
      let paraContent: string[] = [];

      if (i === 1) {
        const transition = this.pickOne(styleConfig.transitions, rand);
        paraContent.push(transition);
        paraContent.push(`${mainCharacter}${selectedActions[0] || selectedActions[i % selectedActions.length] || '认真地看着周围的一切'}。`);
        if (selectedCharacters.length > 1) {
          paraContent.push(`${selectedCharacters[1 % selectedCharacters.length]}也在旁边，${selectedActions[1 % selectedActions.length] || '开心地陪伴着'}。`);
        }
        paraContent.push(`大家的脸上都露出了${selectedEmotions[0]}的笑容。`);
      } else if (i === 2) {
        const goodWords = this.pickSeeded(GOOD_WORDS[gradeLevel] || GOOD_WORDS.grade3, 2, rand);
        paraContent.push(`你看，这里的景色真是${goodWords[0]}！`);
        paraContent.push(`${mainCharacter}深深地被这${goodWords[1] || '美丽'}的景象吸引住了。`);
        paraContent.push(`他心想：要是每天都能这样${selectedEmotions[1] || '开心'}就好了。`);
      } else {
        const endingTemplate = this.pickOne(styleConfig.endings, rand);
        const ending = endingTemplate.replace('{character}', mainCharacter);
        paraContent.push(ending);
      }

      paragraphs.push(this.generateParagraph(paraContent, wordsPerPara, rand));
    }

    if (paragraphs.length < gradeConfig.paragraphs) {
      const endingTemplate = this.pickOne(styleConfig.endings, rand);
      paragraphs.push(endingTemplate.replace('{character}', mainCharacter));
    }

    const content = paragraphs.join('\n\n');

    const titles = [
      `${selectedTime}的一件事`,
      `难忘的一天`,
      `${mainCharacter}的${this.pickOne(['快乐', '开心', '美好', '难忘'], rand)}一天`,
      `发生在${selectedLocation.replace('在', '').replace('里', '')}的故事`,
      `一件${selectedEmotions[0]}的事`,
      `${scene.substring(0, 6)}`
    ];
    const title = this.pickOne(titles, rand);

    const keyWords = this.pickSeeded(
      [...GOOD_WORDS[gradeLevel], ...selectedCharacters, ...selectedActions],
      5,
      rand
    );

    const writingTips = this.pickSeeded(WRITING_TIPS, 3, rand);

    const response: PictureWritingResponse = {
      analysis,
      content,
      title,
      gradeLevel: gradeConfig.name,
      wordCount: content.replace(/\s/g, '').length,
      keyWords,
      writingTips
    };

    return response;
  }
}
