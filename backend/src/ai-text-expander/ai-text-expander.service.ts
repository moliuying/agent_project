import { Injectable } from '@nestjs/common';

export interface ExpandRequest {
  text: string;
  style: string;
  length: string;
  tone: string;
  audience: string;
}

export interface ExpandResponse {
  result: string;
  style: string;
  length: string;
  wordCount: number;
}

interface StyleConfig {
  key: string;
  name: string;
  openingTemplates: string[];
  transitionPhrases: string[];
  closingTemplates: string[];
  connectorWords: string[];
  descriptiveWords: string[];
}

interface LengthConfig {
  key: string;
  name: string;
  minSentences: number;
  maxSentences: number;
  paragraphs: number;
}

interface ToneConfig {
  key: string;
  name: string;
  modifiers: string[];
  emotionWords: string[];
}

interface AudienceConfig {
  key: string;
  name: string;
  addressingWords: string[];
  levelWords: string[];
}

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  article: {
    key: 'article',
    name: '公众号文章',
    openingTemplates: [
      '在日常生活中，我们经常会遇到这样的情况：',
      '不知道你是否也有过类似的经历——',
      '最近，一个话题引起了很多人的关注和讨论：',
      '生活中总有一些瞬间，让我们不禁停下脚步去思考：',
      '说到这个话题，相信很多人都有自己的感受和体会。',
    ],
    transitionPhrases: [
      '从另一个角度来看，',
      '值得我们深思的是，',
      '更重要的是，',
      '事实上，',
      '不难发现，',
      '细细想来，',
    ],
    closingTemplates: [
      '希望今天的分享能给你带来一些启发和思考。如果你也有类似的经历或想法，欢迎在评论区留言交流，让我们一起探讨这个有趣的话题。',
      '总之，无论是怎样的体验，都是我们人生中宝贵的财富。愿我们都能在平凡的日子里，发现不平凡的美好。',
      '最后，想对每一个正在阅读这篇文章的你说：珍惜当下，用心感受生活中的每一个细节，你会发现，原来美好就在身边。',
    ],
    connectorWords: ['而且', '此外', '同时', '另外', '再者', '除此之外'],
    descriptiveWords: ['美好的', '温暖的', '深刻的', '难忘的', '珍贵的', '独特的', '动人的'],
  },
  social: {
    key: 'social',
    name: '社交媒体',
    openingTemplates: [
      '今天想和大家分享一件小事～',
      '姐妹们/兄弟们，我来了！今天必须说说这件事！',
      '救命！我真的要被这件事感动到了🥹',
      '谁懂啊！今天真的太开心/有感触了！',
      '日常分享｜最近的一些小感悟～',
    ],
    transitionPhrases: [
      '话说回来，',
      '讲真，',
      '有一说一，',
      '而且最绝的是，',
      '重点来了！',
      '真的，',
    ],
    closingTemplates: [
      '好啦，今天的分享就到这里～你们有什么想说的吗？评论区等你们！❤️ #日常分享 #生活感悟',
      '总之就是很推荐/很有感触！你们也快去试试/感受一下吧！有什么想法欢迎评论区交流～',
      '好啦不说了，我要继续享受/回味了！大家周末愉快/晚安～✨',
    ],
    connectorWords: ['还有', '而且', '然后', '另外', '再说', '对了'],
    descriptiveWords: ['绝绝子的', '超棒的', '太可了', '满满的', '治愈的', '开心的'],
  },
  email: {
    key: 'email',
    name: '商务邮件',
    openingTemplates: [
      '您好！',
      '尊敬的收件人：',
      '见信好！',
      '感谢您在百忙之中阅读此邮件。',
    ],
    transitionPhrases: [
      '关于此事，',
      '具体而言，',
      '需要说明的是，',
      '此外，',
      '同时，',
      '鉴于此，',
    ],
    closingTemplates: [
      '感谢您的关注与支持，如有任何疑问，请随时与我联系。期待您的回复。此致，敬礼！',
      '以上是我的说明，希望能得到您的理解和支持。如有需要进一步沟通的地方，请随时告知。祝工作顺利！',
      '再次感谢您的时间与耐心。期待能与您有进一步的交流与合作。顺颂商祺！',
    ],
    connectorWords: ['并且', '同时', '此外', '另外', '与此同时'],
    descriptiveWords: ['重要的', '具体的', '详细的', '明确的', '合理的', '有效的'],
  },
  essay: {
    key: 'essay',
    name: '散文随笔',
    openingTemplates: [
      '岁月静好，时光如梭，有些事总在不经意间浮上心头。',
      '窗外的阳光洒进来，落在桌面上，也洒在了我的思绪里。',
      '一个人走在熟悉的路上，脚下的每一步都像是在诉说着什么。',
      '夜深人静的时候，思绪总是特别清晰，那些平日里被忽略的感受，此刻都涌上心头。',
    ],
    transitionPhrases: [
      '忆往昔，',
      '恍惚间，',
      '蓦然回首，',
      '思及此，',
      '念及此处，',
      '渐渐地，',
    ],
    closingTemplates: [
      '就这样吧，让这些文字静静流淌，如同岁月长河中的一滴水，无声却自有其存在的意义。愿每一个读到这里的人，都能找到属于自己的那份宁静。',
      '风吹过，带走了什么，又留下了什么。或许答案并不重要，重要的是我们曾用心感受过这一切。',
      '合上思绪的闸门，把这些文字留在纸上，也留在心里。来日方长，我们慢慢品。',
    ],
    connectorWords: ['然而', '于是', '因而', '是故', '纵然', '纵使'],
    descriptiveWords: ['静谧的', '悠然的', '恬淡的', '绵长的', '清澈的', '温润的'],
  },
  report: {
    key: 'report',
    name: '工作报告',
    openingTemplates: [
      '现将相关情况汇报如下：',
      '针对此事项，进行了全面梳理和总结，具体如下：',
      '根据工作安排，现将有关情况报告如下：',
    ],
    transitionPhrases: [
      '具体来看，',
      '从数据上分析，',
      '值得注意的是，',
      '需要指出的是，',
      '下一步计划是，',
      '综合以上情况，',
    ],
    closingTemplates: [
      '以上是本次报告的全部内容，如有不妥之处，请领导和同事们批评指正。下一步，我们将继续推进相关工作，确保各项任务按时保质完成。',
      '综上所述，本次工作取得了阶段性成果，但仍存在一些需要改进的地方。我们将认真总结经验，持续优化工作流程，争取更好的成绩。',
      '特此报告，请审阅。',
    ],
    connectorWords: ['并且', '同时', '此外', '其次', '再者', '最后'],
    descriptiveWords: ['显著的', '有效的', '积极的', '明确的', '具体的', '客观的'],
  },
  story: {
    key: 'story',
    name: '故事叙述',
    openingTemplates: [
      '故事要从那天说起……',
      '我永远也忘不了那个日子，一切仿佛就发生在昨天。',
      '那是一个普通得不能再普通的日子，然而，一件不普通的事却悄然发生了。',
      '很久很久以前，在一个……',
    ],
    transitionPhrases: [
      '就在这时，',
      '突然，',
      '然而，意想不到的是，',
      '时间一天天过去，',
      '话说，',
      '且说，',
    ],
    closingTemplates: [
      '后来的后来，每当回想起这段往事，心中总会涌起一股暖流。原来，生命中那些看似偶然的相遇，都有着它独特的意义。',
      '故事到这里就告一段落了，但生活还在继续。谁知道明天又会发生什么呢？也许，下一个精彩的故事，正在等待着我们去书写。',
      '从那以后，我明白了一个道理——有些经历，无论过去多久，都会在我们的生命里留下深深的印记，成为我们前行的力量。',
    ],
    connectorWords: ['然后', '接着', '后来', '之后', '不久', '忽然'],
    descriptiveWords: ['神奇的', '惊险的', '温馨的', '感人的', '意外的', '难忘的'],
  },
  product: {
    key: 'product',
    name: '产品文案',
    openingTemplates: [
      '今天给大家种草一款真正好用的宝贝——',
      '在众多同类产品中，为什么它能脱颖而出？让我们一起来看看：',
      '你是否也在寻找一款能够真正解决问题的产品？',
      '种草预警！这款产品我真的要强烈推荐给所有人！',
    ],
    transitionPhrases: [
      '首先，它最大的亮点在于，',
      '更让人惊喜的是，',
      '除了这些，它还有一个隐藏优势：',
      '对比市面上的同类产品，',
      '使用了一段时间后，最大的感受是，',
    ],
    closingTemplates: [
      '总的来说，这是一款性价比超高、实用性极强的产品。如果你也有相关需求，真的可以闭眼入！用过之后，相信你会回来感谢我的推荐～',
      '如果你还在犹豫，不妨试试看。好产品自己会说话，相信它不会让你失望。心动不如行动，早买早享受！',
      '好产品值得被更多人知道。希望这份真诚的推荐，能帮你做出更明智的选择。毕竟，用对产品，生活品质真的会提升很多！',
    ],
    connectorWords: ['而且', '另外', '还有', '更重要的是', '除此之外'],
    descriptiveWords: ['惊艳的', '实用的', '高品质的', '贴心的', '超值的', '用心的'],
  },
  academic: {
    key: 'academic',
    name: '学术风格',
    openingTemplates: [
      '近年来，关于这一主题的研究日益受到学术界的广泛关注。',
      '随着社会的发展和技术的进步，该领域的重要性愈发凸显。',
      '本文旨在探讨……',
      '从学术研究的视角来看，',
    ],
    transitionPhrases: [
      '从理论层面分析，',
      '实证研究表明，',
      '相关文献指出，',
      '进一步而言，',
      '值得注意的是，',
      '基于以上分析，',
    ],
    closingTemplates: [
      '综上所述，本研究通过多维度的分析，揭示了该现象的内在规律。未来的研究可以在现有基础上，进一步拓展研究视角，深化对该问题的理解。',
      '综上，本文的研究结论具有一定的理论价值和实践意义。然而，由于研究条件所限，仍存在一些不足之处，有待后续研究加以完善。',
      '通过上述讨论，我们可以得出以下结论……这一发现不仅丰富了相关理论，也为实践提供了有益的参考。',
    ],
    connectorWords: ['此外', '同时', '其次', '再者', '进一步', '与此同时'],
    descriptiveWords: ['严谨的', '系统的', '深入的', '全面的', '客观的', '科学的'],
  },
};

const LENGTH_CONFIGS: Record<string, LengthConfig> = {
  short: {
    key: 'short',
    name: '简短',
    minSentences: 4,
    maxSentences: 6,
    paragraphs: 1,
  },
  medium: {
    key: 'medium',
    name: '中等',
    minSentences: 8,
    maxSentences: 12,
    paragraphs: 2,
  },
  long: {
    key: 'long',
    name: '详细',
    minSentences: 15,
    maxSentences: 22,
    paragraphs: 3,
  },
};

const TONE_CONFIGS: Record<string, ToneConfig> = {
  formal: {
    key: 'formal',
    name: '正式专业',
    modifiers: ['客观而言', '从专业角度', '根据实际情况'],
    emotionWords: ['专业', '严谨', '规范', '正式'],
  },
  casual: {
    key: 'casual',
    name: '轻松活泼',
    modifiers: ['你知道吗', '哈哈', '说真的'],
    emotionWords: ['开心', '有趣', '好玩', '愉快'],
  },
  warm: {
    key: 'warm',
    name: '温暖亲切',
    modifiers: ['亲爱的', '我想对你说', '希望你能感受到'],
    emotionWords: ['温暖', '感动', '幸福', '美好'],
  },
  humorous: {
    key: 'humorous',
    name: '幽默风趣',
    modifiers: ['笑死我了', '有被笑到', '咱就是说'],
    emotionWords: ['搞笑', '有趣', '好玩', '欢乐'],
  },
  neutral: {
    key: 'neutral',
    name: '客观中立',
    modifiers: ['客观来说', '事实上', '数据显示'],
    emotionWords: ['客观', '中立', '平衡', '理性'],
  },
  inspiring: {
    key: 'inspiring',
    name: '激励鼓舞',
    modifiers: ['相信自己', '你一定可以', '加油'],
    emotionWords: ['奋斗', '坚持', '梦想', '勇气'],
  },
};

const AUDIENCE_CONFIGS: Record<string, AudienceConfig> = {
  general: {
    key: 'general',
    name: '普通大众',
    addressingWords: ['大家', '朋友们', '各位'],
    levelWords: ['简单来说', '换句话说', '通俗地讲'],
  },
  professional: {
    key: 'professional',
    name: '职场人士',
    addressingWords: ['各位同事', '业内同仁'],
    levelWords: ['从专业角度', '在工作场景中', '实际操作中'],
  },
  student: {
    key: 'student',
    name: '学生群体',
    addressingWords: ['同学们', '学弟学妹们'],
    levelWords: ['对于学生来说', '在学习过程中', '大家可以想想'],
  },
  literary: {
    key: 'literary',
    name: '文艺青年',
    addressingWords: ['同好们', '热爱文学的朋友们'],
    levelWords: ['从文艺的角度', '诗意地说', '用心感受'],
  },
  tech: {
    key: 'tech',
    name: '科技爱好者',
    addressingWords: ['技术同好们', '各位极客'],
    levelWords: ['从技术角度', '实现原理是', '技术方案是'],
  },
  business: {
    key: 'business',
    name: '商务客户',
    addressingWords: ['尊敬的客户', '各位合作伙伴'],
    levelWords: ['从商业角度', '站在您的立场', '为了您的利益'],
  },
};

const EXPANSION_TOPICS = [
  '带来的感受和体验',
  '背后的故事和意义',
  '对生活的影响和改变',
  '相关的回忆和联想',
  '未来的展望和期待',
  '不同角度的思考',
  '具体的细节和场景',
  '从中获得的启发',
  '与他人的联系和互动',
  '内心的真实想法',
];

@Injectable()
export class AiTextExpanderService {
  private getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private expandCoreSentence(coreText: string, styleConfig: StyleConfig, toneConfig: ToneConfig, index: number): string {
    const topics = this.shuffleArray(EXPANSION_TOPICS);
    const topic = topics[index % topics.length];
    const descriptiveWord = this.getRandomItem(styleConfig.descriptiveWords);
    const connector = index > 0 ? this.getRandomItem(styleConfig.connectorWords) : '';
    const transition = this.getRandomItem(styleConfig.transitionPhrases);

    const expansionTemplates = [
      `${connector ? connector + '，' : ''}说到「${coreText}」这件事的${topic}，其实有很多${descriptiveWord}细节值得我们细细品味。${transition}这不仅仅是表面上看到的那样，它背后蕴含着更深层次的意义，等待着我们去发现和体会。`,
      `${connector ? connector + '，' : ''}关于${topic}，「${coreText}」给人留下了${descriptiveWord}印象。${transition}当我们静下心来认真感受，就会发现其中的美好和价值，这或许就是生活给予我们的馈赠。`,
      `${connector ? connector + '，' : ''}「${coreText}」所涉及的${topic}，往往能触动人们内心最柔软的地方。${transition}也许每个人的感受不尽相同，但那份真挚的情感却是相通的，它超越了言语，直达心底。`,
      `${transition}${topic}方面，「${coreText}」展现出了${descriptiveWord}一面。${connector ? connector + '，' : ''}它不是孤立存在的，而是与我们的生活紧密相连，在不经意间影响着我们的情绪和思考方式。`,
    ];

    return this.getRandomItem(expansionTemplates);
  }

  private generateParagraph(
    coreText: string,
    styleConfig: StyleConfig,
    toneConfig: ToneConfig,
    audienceConfig: AudienceConfig,
    sentenceCount: number,
    isFirst: boolean,
    isLast: boolean,
  ): string {
    const sentences: string[] = [];

    if (isFirst) {
      const opening = this.getRandomItem(styleConfig.openingTemplates);
      const addressing = this.getRandomItem(audienceConfig.addressingWords);
      const fullOpening = `${addressing}，${opening}「${coreText}」。`;
      sentences.push(fullOpening);
    }

    for (let i = 0; i < sentenceCount; i++) {
      const expansion = this.expandCoreSentence(coreText, styleConfig, toneConfig, i);
      sentences.push(expansion);
    }

    if (isLast) {
      const closing = this.getRandomItem(styleConfig.closingTemplates);
      sentences.push(closing);
    }

    return sentences.join('\n\n');
  }

  async expand(request: ExpandRequest): Promise<ExpandResponse> {
    const { text, style, length, tone, audience } = request;

    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.article;
    const lengthConfig = LENGTH_CONFIGS[length] || LENGTH_CONFIGS.medium;
    const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.casual;
    const audienceConfig = AUDIENCE_CONFIGS[audience] || AUDIENCE_CONFIGS.general;

    const trimmedText = text.trim();
    const coreText = trimmedText.replace(/[。！？.!?]$/, '');

    const paragraphs: string[] = [];
    const totalSentences = this.getRandomInt(lengthConfig.minSentences, lengthConfig.maxSentences);
    const sentencesPerParagraph = Math.ceil(totalSentences / lengthConfig.paragraphs);

    for (let p = 0; p < lengthConfig.paragraphs; p++) {
      const isFirst = p === 0;
      const isLast = p === lengthConfig.paragraphs - 1;
      let paraSentences = sentencesPerParagraph;

      if (isLast) {
        paraSentences = totalSentences - sentencesPerParagraph * (lengthConfig.paragraphs - 1);
      }

      const paragraph = this.generateParagraph(
        coreText,
        styleConfig,
        toneConfig,
        audienceConfig,
        Math.max(1, paraSentences - (isFirst ? 1 : 0) - (isLast ? 1 : 0)),
        isFirst,
        isLast,
      );
      paragraphs.push(paragraph);
    }

    const result = paragraphs.join('\n\n');
    const wordCount = result.replace(/\s/g, '').length;

    return {
      result,
      style: styleConfig.name,
      length: lengthConfig.name,
      wordCount,
    };
  }
}
