import { Injectable } from '@nestjs/common';

export interface WordOcrRequest {
  imageBase64: string;
  language?: 'en' | 'zh-en';
  includeExamples?: boolean;
  includePhonetic?: boolean;
}

export interface WordExample {
  en: string;
  zh: string;
}

export interface WordItem {
  id: string;
  word: string;
  phonetic: string;
  phoneticUk?: string;
  phoneticUs?: string;
  partOfSpeech: string;
  definition: string;
  definitionEn?: string;
  examples: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
  confidence: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WordOcrResponse {
  success: boolean;
  words: WordItem[];
  fullText: string;
  processingTime: number;
  imageAnalysis: {
    wordCount: number;
    uniqueWordCount: number;
    hasChinese: boolean;
    qualityScore: number;
    sceneType: 'book' | 'sign' | 'product' | 'document' | 'other';
    totalLowConfidence: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  suggestions: string[];
}

const MOCK_WORDS: Record<string, {
  phonetic: string;
  phoneticUk: string;
  phoneticUs: string;
  partOfSpeech: string;
  definition: string;
  definitionEn: string;
  examples: { en: string; zh: string }[];
  synonyms: string[];
  antonyms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}> = {
  apple: {
    phonetic: '/ˈæp.l/',
    phoneticUk: '/ˈæp.l/',
    phoneticUs: '/ˈæp.əl/',
    partOfSpeech: 'n. 名词',
    definition: '苹果；苹果树',
    definitionEn: 'a round fruit with red or green skin and a white inside',
    examples: [
      { en: 'I eat an apple every day.', zh: '我每天吃一个苹果。' },
      { en: 'The apple tree is full of fruit.', zh: '苹果树上结满了果实。' },
      { en: 'An apple a day keeps the doctor away.', zh: '每天一苹果，医生远离我。' }
    ],
    synonyms: ['fruit', 'orchard fruit'],
    antonyms: [],
    difficulty: 'beginner'
  },
  beautiful: {
    phonetic: '/ˈbjuː.tɪ.fəl/',
    phoneticUk: '/ˈbjuː.tɪ.fəl/',
    phoneticUs: '/ˈbjuː.t̬ɪ.fəl/',
    partOfSpeech: 'adj. 形容词',
    definition: '美丽的；漂亮的；出色的',
    definitionEn: 'having beauty; pleasing to look at',
    examples: [
      { en: 'What a beautiful day!', zh: '多么美好的一天！' },
      { en: 'She is a beautiful woman.', zh: '她是一位美丽的女人。' },
      { en: 'The sunset was absolutely beautiful.', zh: '日落美得令人窒息。' }
    ],
    synonyms: ['pretty', 'gorgeous', 'lovely', 'stunning'],
    antonyms: ['ugly', 'unattractive', 'hideous'],
    difficulty: 'beginner'
  },
  knowledge: {
    phonetic: '/ˈnɒl.ɪdʒ/',
    phoneticUk: '/ˈnɒl.ɪdʒ/',
    phoneticUs: '/ˈnɑː.lɪdʒ/',
    partOfSpeech: 'n. 名词',
    definition: '知识；学问；了解',
    definitionEn: 'information and skills acquired through experience or education',
    examples: [
      { en: 'Knowledge is power.', zh: '知识就是力量。' },
      { en: 'He has a wide knowledge of history.', zh: '他有广博的历史知识。' },
      { en: 'She has little knowledge of the subject.', zh: '她对这个学科知之甚少。' }
    ],
    synonyms: ['wisdom', 'understanding', 'learning', 'awareness'],
    antonyms: ['ignorance', 'stupidity'],
    difficulty: 'intermediate'
  },
  restaurant: {
    phonetic: '/ˈres.trɒnt/',
    phoneticUk: '/ˈres.trɒnt/',
    phoneticUs: '/ˈres.tər.ɑːnt/',
    partOfSpeech: 'n. 名词',
    definition: '餐馆；餐厅',
    definitionEn: 'a place where people go to eat meals',
    examples: [
      { en: 'Let\'s go to a restaurant tonight.', zh: '今晚我们去餐厅吃饭吧。' },
      { en: 'This restaurant serves excellent food.', zh: '这家餐厅的食物非常棒。' },
      { en: 'I booked a table at the Italian restaurant.', zh: '我在意大利餐厅订了位。' }
    ],
    synonyms: ['eatery', 'café', 'diner', 'bistro'],
    antonyms: [],
    difficulty: 'beginner'
  },
  exit: {
    phonetic: '/ˈek.sɪt/',
    phoneticUk: '/ˈek.sɪt/',
    phoneticUs: '/ˈek.sɪt/',
    partOfSpeech: 'n. / v. 名词/动词',
    definition: '出口；退出；离去',
    definitionEn: 'a way out; to leave a place',
    examples: [
      { en: 'The exit is over there.', zh: '出口在那边。' },
      { en: 'Please exit through the back door.', zh: '请从后门离开。' },
      { en: 'Press Esc to exit the program.', zh: '按 Esc 键退出程序。' }
    ],
    synonyms: ['way out', 'leave', 'depart', 'outlet'],
    antonyms: ['enter', 'entrance', 'arrive'],
    difficulty: 'beginner'
  },
  warning: {
    phonetic: '/ˈwɔː.nɪŋ/',
    phoneticUk: '/ˈwɔː.nɪŋ/',
    phoneticUs: '/ˈwɔːr.nɪŋ/',
    partOfSpeech: 'n. 名词',
    definition: '警告；警示；预告',
    definitionEn: 'something that warns of danger or a problem',
    examples: [
      { en: 'The warning sign says "Danger".', zh: '警示标志上写着"危险"。' },
      { en: 'He gave me a warning about the traffic.', zh: '他提醒我注意交通状况。' },
      { en: 'There was no warning before the storm.', zh: '暴风雨来临前没有任何预兆。' }
    ],
    synonyms: ['caution', 'alert', 'notice', 'admonition'],
    antonyms: ['assurance', 'encouragement'],
    difficulty: 'intermediate'
  },
  photosynthesis: {
    phonetic: '/ˌfəʊ.təʊˈsɪn.θə.sɪs/',
    phoneticUk: '/ˌfəʊ.təʊˈsɪn.θə.sɪs/',
    phoneticUs: '/ˌfoʊ.t̬oʊˈsɪn.θə.sɪs/',
    partOfSpeech: 'n. 名词',
    definition: '光合作用',
    definitionEn: 'the process by which green plants use sunlight to make food from carbon dioxide and water',
    examples: [
      { en: 'Plants produce oxygen through photosynthesis.', zh: '植物通过光合作用产生氧气。' },
      { en: 'Photosynthesis is essential for life on Earth.', zh: '光合作用对地球上的生命至关重要。' }
    ],
    synonyms: ['light synthesis'],
    antonyms: [],
    difficulty: 'advanced'
  },
  ubiquitous: {
    phonetic: '/juːˈbɪk.wɪ.təs/',
    phoneticUk: '/juːˈbɪk.wɪ.təs/',
    phoneticUs: '/juːˈbɪk.wə.t̬əs/',
    partOfSpeech: 'adj. 形容词',
    definition: '无处不在的；普遍存在的',
    definitionEn: 'present, appearing, or found everywhere',
    examples: [
      { en: 'Smartphones have become ubiquitous.', zh: '智能手机已经无处不在。' },
      { en: 'Coffee shops are ubiquitous in this city.', zh: '这座城市到处都是咖啡店。' }
    ],
    synonyms: ['omnipresent', 'pervasive', 'universal', 'everywhere'],
    antonyms: ['rare', 'scarce', 'unique'],
    difficulty: 'advanced'
  },
  environment: {
    phonetic: '/ɪnˈvaɪ.rən.mənt/',
    phoneticUk: '/ɪnˈvaɪ.rən.mənt/',
    phoneticUs: '/ɪnˈvaɪ.rən.mənt/',
    partOfSpeech: 'n. 名词',
    definition: '环境；周围状况',
    definitionEn: 'the conditions that surround someone or something',
    examples: [
      { en: 'We must protect the environment.', zh: '我们必须保护环境。' },
      { en: 'A good working environment is important.', zh: '良好的工作环境很重要。' },
      { en: 'Children need a safe environment to grow up in.', zh: '孩子们需要一个安全的环境成长。' }
    ],
    synonyms: ['surroundings', 'atmosphere', 'habitat', 'setting'],
    antonyms: [],
    difficulty: 'intermediate'
  },
  emergency: {
    phonetic: '/ɪˈmɜː.dʒən.si/',
    phoneticUk: '/ɪˈmɜː.dʒən.si/',
    phoneticUs: '/ɪˈmɝː.dʒən.si/',
    partOfSpeech: 'n. 名词',
    definition: '紧急情况；突发事件',
    definitionEn: 'a serious or dangerous situation that needs immediate action',
    examples: [
      { en: 'In case of emergency, call 911.', zh: '紧急情况请拨打911。' },
      { en: 'This is a medical emergency.', zh: '这是医疗紧急情况。' },
      { en: 'Keep emergency supplies in your car.', zh: '在车里备一些应急物资。' }
    ],
    synonyms: ['crisis', 'urgency', 'exigency', 'predicament'],
    antonyms: ['calm', 'peace', 'normality'],
    difficulty: 'intermediate'
  },
  caution: {
    phonetic: '/ˈkɔː.ʃən/',
    phoneticUk: '/ˈkɔː.ʃən/',
    phoneticUs: '/ˈkɑː.ʃən/',
    partOfSpeech: 'n. / v. 名词/动词',
    definition: '谨慎；警告；小心',
    definitionEn: 'great care and attention; to warn someone',
    examples: [
      { en: 'Proceed with caution.', zh: '小心行事。' },
      { en: 'He was cautioned against speeding.', zh: '他被警告不要超速。' },
      { en: 'Caution: Wet Floor.', zh: '小心：地面湿滑。' }
    ],
    synonyms: ['care', 'prudence', 'warn', 'admonish'],
    antonyms: ['recklessness', 'carelessness'],
    difficulty: 'intermediate'
  },
  ingredients: {
    phonetic: '/ɪnˈɡriː.di.ənts/',
    phoneticUk: '/ɪnˈɡriː.di.ənts/',
    phoneticUs: '/ɪnˈɡriː.di.ənts/',
    partOfSpeech: 'n. 名词（复数）',
    definition: '配料；成分；原料',
    definitionEn: 'the foods or substances that are combined to make a particular dish or product',
    examples: [
      { en: 'The ingredients are listed on the label.', zh: '配料列在标签上。' },
      { en: 'What are the ingredients of this cake?', zh: '这个蛋糕的配料是什么？' },
      { en: 'Natural ingredients are better for your skin.', zh: '天然成分对皮肤更好。' }
    ],
    synonyms: ['components', 'elements', 'constituents'],
    antonyms: [],
    difficulty: 'intermediate'
  },
  understand: {
    phonetic: '/ˌʌn.dəˈstænd/',
    phoneticUk: '/ˌʌn.dəˈstænd/',
    phoneticUs: '/ˌʌn.dɚˈstænd/',
    partOfSpeech: 'v. 动词',
    definition: '理解；明白；懂得',
    definitionEn: 'to know the meaning of something',
    examples: [
      { en: 'I understand what you mean.', zh: '我明白你的意思。' },
      { en: 'Do you understand English?', zh: '你懂英语吗？' },
      { en: 'She understands children very well.', zh: '她非常了解孩子。' }
    ],
    synonyms: ['comprehend', 'grasp', 'realize', 'perceive'],
    antonyms: ['misunderstand', 'confuse'],
    difficulty: 'beginner'
  },
  happiness: {
    phonetic: '/ˈhæp.i.nəs/',
    phoneticUk: '/ˈhæp.i.nəs/',
    phoneticUs: '/ˈhæp.i.nəs/',
    partOfSpeech: 'n. 名词',
    definition: '幸福；快乐；愉快',
    definitionEn: 'the state of feeling or showing pleasure',
    examples: [
      { en: 'Money cannot buy happiness.', zh: '金钱买不到幸福。' },
      { en: 'She found happiness in simple things.', zh: '她在简单的事物中找到了快乐。' },
      { en: 'Their faces were full of happiness.', zh: '他们的脸上洋溢着幸福。' }
    ],
    synonyms: ['joy', 'pleasure', 'delight', 'bliss'],
    antonyms: ['sadness', 'sorrow', 'misery'],
    difficulty: 'beginner'
  },
  destination: {
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    phoneticUk: '/ˌdes.tɪˈneɪ.ʃən/',
    phoneticUs: '/ˌdes.t̬əˈneɪ.ʃən/',
    partOfSpeech: 'n. 名词',
    definition: '目的地；终点',
    definitionEn: 'the place where someone is going or where something is being sent',
    examples: [
      { en: 'What is your final destination?', zh: '你的最终目的地是哪里？' },
      { en: 'The package reached its destination.', zh: '包裹到达了目的地。' },
      { en: 'Paris is a popular tourist destination.', zh: '巴黎是热门的旅游目的地。' }
    ],
    synonyms: ['end', 'goal', 'endpoint', 'target'],
    antonyms: ['origin', 'starting point'],
    difficulty: 'intermediate'
  }
};

const SCENE_TYPES = ['book', 'sign', 'product', 'document', 'other'] as const;
const SCENE_LABELS: Record<string, string> = {
  book: '书籍/教材',
  sign: '路标/标识',
  product: '商品包装',
  document: '文档/读物',
  other: '其他场景'
};

const BASE_SUGGESTIONS = [
  '拍照时请保持光线充足，避免反光和阴影',
  '尽量让文字清晰对焦，避免模糊',
  '单词尽量占满画面，减少无关背景',
  '识别后可点击单词卡片收藏或加入生词本',
  '建议在安静环境中使用发音功能跟读练习',
  '复杂长句建议分段拍摄，识别更准确',
  '路标、商品包装等场景建议近距离拍摄',
  '可以收藏生词，方便后续复习巩固'
];

@Injectable()
export class WordOcrService {
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

  private generateWordItem(wordKey: string, rand: () => number, idx: number): WordItem {
    const wordData = MOCK_WORDS[wordKey];
    const baseConf = 0.75 + rand() * 0.24;
    const confidence = Math.round(baseConf * 100) / 100;

    return {
      id: `word_${Date.now()}_${idx}`,
      word: wordKey,
      phonetic: wordData.phonetic,
      phoneticUk: wordData.phoneticUk,
      phoneticUs: wordData.phoneticUs,
      partOfSpeech: wordData.partOfSpeech,
      definition: wordData.definition,
      definitionEn: wordData.definitionEn,
      examples: wordData.examples,
      synonyms: wordData.synonyms,
      antonyms: wordData.antonyms,
      confidence,
      position: {
        x: Math.floor(rand() * 300),
        y: Math.floor(rand() * 50 + idx * 60),
        width: Math.floor(rand() * 80 + 80),
        height: Math.floor(rand() * 20 + 30)
      }
    };
  }

  async recognize(request: WordOcrRequest): Promise<WordOcrResponse> {
    const startTime = Date.now();
    const { includeExamples = true, includePhonetic = true } = request;

    const seed = Date.now() % 100000;
    const rand = this.seededRandom(seed);

    const wordKeys = Object.keys(MOCK_WORDS);
    const wordCount = Math.floor(rand() * 5) + 3;
    const pickedKeys = this.pickSeeded(wordKeys, wordCount, rand);

    const words: WordItem[] = pickedKeys.map((key, idx) => {
      const item = this.generateWordItem(key, rand, idx);
      if (!includeExamples) {
        item.examples = [];
      }
      if (!includePhonetic) {
        item.phonetic = '';
        item.phoneticUk = '';
        item.phoneticUs = '';
      }
      return item;
    });

    const fullText = words.map(w => w.word).join(' ');
    const uniqueWordCount = new Set(pickedKeys).size;
    const totalLowConfidence = words.filter(w => w.confidence < 0.85).length;

    const difficulties = words.map(w => MOCK_WORDS[w.word].difficulty);
    let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (difficulties.includes('advanced')) {
      difficultyLevel = 'advanced';
    } else if (difficulties.includes('intermediate')) {
      difficultyLevel = 'intermediate';
    }

    const hasChinese = rand() > 0.7;
    const sceneIdx = Math.floor(rand() * SCENE_TYPES.length);
    const sceneType = SCENE_TYPES[sceneIdx];
    const qualityScore = Math.round((0.7 + rand() * 0.29) * 100);

    const suggestions = [...BASE_SUGGESTIONS];
    suggestions.unshift(`识别场景：${SCENE_LABELS[sceneType]}，已针对性优化识别准确率`);
    if (totalLowConfidence > 0) {
      suggestions.unshift(`检测到 ${totalLowConfidence} 个单词识别置信度较低，建议核对`);
    }
    if (difficultyLevel === 'advanced') {
      suggestions.push('检测到高级词汇，建议结合例句深入理解用法');
    }
    const finalSuggestions = this.pickSeeded(suggestions, 5, rand);

    const processingTime = Date.now() - startTime + Math.floor(rand() * 400 + 150);

    return {
      success: true,
      words,
      fullText,
      processingTime,
      imageAnalysis: {
        wordCount: words.length,
        uniqueWordCount,
        hasChinese,
        qualityScore,
        sceneType,
        totalLowConfidence,
        difficultyLevel
      },
      suggestions: finalSuggestions
    };
  }
}
