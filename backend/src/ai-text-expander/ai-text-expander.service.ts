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

interface LengthConfig {
  key: string;
  name: string;
  paragraphs: number;
  sentencesPerPara: number;
}

interface StyleExpansion {
  expansions: string[];
}

const LENGTH_CONFIGS: Record<string, LengthConfig> = {
  short: { key: 'short', name: '简短', paragraphs: 1, sentencesPerPara: 3 },
  medium: { key: 'medium', name: '中等', paragraphs: 2, sentencesPerPara: 4 },
  long: { key: 'long', name: '详细', paragraphs: 3, sentencesPerPara: 5 },
};

const TONE_MODIFIERS: Record<string, { prefixes: string[]; suffixes: string[]; interjections: string[]; emotionLevel: number }> = {
  formal: {
    prefixes: ['从客观角度而言，', '根据实际情况分析，', '就事论事地讲，', '综合各方面因素来看，'],
    suffixes: ['，这一点值得引起足够重视。', '，具有一定的参考价值。', '，需要进行更为深入的探讨。'],
    interjections: [],
    emotionLevel: 1,
  },
  casual: {
    prefixes: ['哈哈，你知道吗，', '说真的，', '讲真哦，', '害，说白了，', '嘿嘿，'],
    suffixes: ['，你懂的～', '，真的超有意思！', '，绝了！'],
    interjections: ['哈哈哈！', '哇塞！', '笑死！', '绝绝子！'],
    emotionLevel: 4,
  },
  warm: {
    prefixes: ['亲爱的，我想对你说，', '真心觉得，', '每每想到这里，都觉得，', '怀着一颗感恩的心，'],
    suffixes: ['，愿你也能感受到这份美好。', '，希望这份温暖也能传递给你。', '，愿我们都被这个世界温柔以待。'],
    interjections: ['好感动～', '太暖了！'],
    emotionLevel: 5,
  },
  humorous: {
    prefixes: ['笑死我了哈哈哈，', '咱就是说，', '有被笑到，', '救命，'],
    suffixes: ['，笑不活了！', '，我真的会谢！', '，这也太离谱了吧！'],
    interjections: ['哈哈哈哈！', '笑死！', '蚌埠住了！'],
    emotionLevel: 5,
  },
  neutral: {
    prefixes: ['客观来说，', '事实上，', '数据显示，', '从现有情况来看，'],
    suffixes: ['。', '，这是目前可以观察到的情况。', '，结论有待进一步验证。'],
    interjections: [],
    emotionLevel: 0,
  },
  inspiring: {
    prefixes: ['相信自己，', '请记住，', '永远不要忘记，', '勇敢地去追求吧，'],
    suffixes: ['，你一定可以的！', '，未来可期！', '，所有的努力都不会白费！'],
    interjections: ['加油！', '冲鸭！', '太棒了！'],
    emotionLevel: 5,
  },
};

const AUDIENCE_ADAPTATIONS: Record<string, { levelPhrases: string[]; contextSentences: string[] }> = {
  general: {
    levelPhrases: ['简单来说，', '换句话说，', '通俗地讲，', '大家都知道，'],
    contextSentences: [
      '相信这个话题对每个人来说都不陌生。',
      '这也是我们日常生活中经常会遇到的情况。',
      '不管是谁，或多或少都有过类似的经历。',
    ],
  },
  professional: {
    levelPhrases: ['从专业角度来看，', '在实际工作场景中，', '站在从业者的立场，', '结合职场经验来看，'],
    contextSentences: [
      '这在职场中是一个值得深入探讨的议题。',
      '相信各位业内同仁对此都有自己的心得体会。',
      '这对提高工作效率和职业发展都具有现实意义。',
    ],
  },
  student: {
    levelPhrases: ['对于同学们来说，', '在学习过程中，', '站在学生的角度，', '相信大家在校园生活中，'],
    contextSentences: [
      '这也是同学们在成长路上会面对的课题。',
      '对于正在求学的我们来说，这有着特别的意义。',
      '相信每一位同学都能从中获得启发。',
    ],
  },
  literary: {
    levelPhrases: ['从文艺的视角审视，', '诗意地栖居于这世间，', '用心去感受文字的温度，', '在岁月的长河中，'],
    contextSentences: [
      '这恰是文人墨客笔下永恒的主题。',
      '古往今来，不知多少人为之动情。',
      '这份情感，永远是文学作品中最动人的篇章。',
    ],
  },
  tech: {
    levelPhrases: ['从技术实现角度来看，', '深入分析其底层逻辑，', '从工程实践层面来讲，', '站在技术从业者的视角，'],
    contextSentences: [
      '这在技术圈也是一个讨论度很高的话题。',
      '相信各位极客朋友们对此都有独到的见解。',
      '从技术演进的角度来看，这一趋势值得关注。',
    ],
  },
  business: {
    levelPhrases: ['站在您的立场考虑，', '从商业价值的角度分析，', '为了更好地服务于您的需求，', '从合作伙伴的角度出发，'],
    contextSentences: [
      '这对双方的合作共赢具有重要意义。',
      '我们始终将客户的价值放在首位。',
      '期待能与您在这方面有更深入的交流。',
    ],
  },
};

const STYLE_EXPANSIONS: Record<string, {
  openings: string[];
  deepening: string[];
  examples: string[];
  feelings: string[];
  perspectives: string[];
  closings: string[];
}> = {
  article: {
    openings: [
      '在快节奏的现代生活中，「{text}」看似平常，实则蕴含着值得我们细细品味的深意。',
      '不知道你是否也留意过，「{text}」这件小事，正在悄悄影响着我们每一天的心情。',
      '最近和朋友们聊天，不约而同都提到了「{text}」这个话题，看来大家都深有感触。',
      '生活从不缺少美，而是缺少发现的眼睛——「{text}」就是最好的例证。',
      '说到「{text}」，脑海里立刻浮现出许多鲜活的画面，每一幅都值得被记录下来。',
    ],
    deepening: [
      '为什么这件事能引发如此多的共鸣？我想，是因为它触及了人们内心深处最柔软的地方。',
      '仔细想想，「{text}」的背后，其实折射出的是我们对美好生活的向往与追求。',
      '往深一层去看，这不仅仅是一个孤立事件，更是这个时代的一个缩影。',
      '它之所以让我们念念不忘，是因为其中承载着太多真实的情感和回忆。',
    ],
    examples: [
      '就拿我自己来说，每次遇到类似的场景，都会不自觉地停下脚步，多看两眼，多想一会儿。',
      '我有一位朋友就是最好的例子，她把「{text}」这件事做到了极致，生活也因此变得格外精彩。',
      '还记得上次……（此处省略一段具体的经历），从那以后我对这件事就有了全新的认识。',
      '生活中这样的例子比比皆是，只要你用心观察，就会发现它们无处不在。',
    ],
    feelings: [
      '那种感觉，就像冬日里的一缕暖阳，不浓烈，却足够温暖，足够让人记住很久。',
      '说不上是多么惊天动地的感受，但就是这种淡淡的、稳稳的幸福感，最是让人踏实。',
      '那一刻，心中涌起的是一种难以言喻的满足感，仿佛所有的烦恼都暂时被按下了暂停键。',
      '沉浸其中，你会发现时间好像都慢了下来，每一分每一秒都变得格外珍贵。',
    ],
    perspectives: [
      '换一个角度来看，「{text}」其实也是一种生活态度的体现——认真、专注、懂得珍惜。',
      '从另一个层面来说，这也反映了我们内心深处对仪式感的渴望和追求。',
      '或许，这件事真正教会我们的，是如何在平凡中看见不凡，在日常中发现惊喜。',
      '有人说，人生的幸福就藏在这些小事里，深以为然。',
    ],
    closings: [
      '好了，今天的分享就到这里。如果你也有关于「{text}」的故事，欢迎在评论区留言，让我们一起交流～',
      '愿我们都能保持这份对生活的热爱，把每一个平凡的日子都过得闪闪发光。',
      '最后，想把一句话送给大家：认真生活的人，永远值得被生活温柔以待。我们下次再见！',
      '感谢你耐心读完这篇文章，如果觉得有共鸣，别忘了点赞收藏，也欢迎转发给你在乎的那个人。',
    ],
  },
  social: {
    openings: [
      '姐妹们/兄弟们！今天必须来唠唠「{text}」这件事！',
      '救命！我真的要被「{text}」这件事整破防了🥹',
      '日常分享｜关于「{text}」的一些碎碎念～',
      '谁懂啊家人们！一提到「{text}」我就停不下来！',
      '今天也是被「{text}」狠狠拿捏的一天😭',
    ],
    deepening: [
      '咱就是说，「{text}」这件事真的太上头了！谁懂啊！',
      '讲真，一开始我也没当回事，结果后来越陷越深……',
      '不瞒你们说，我最近脑子里全是这个，根本停不下来！',
      '有一说一，这玩意儿真的有魔力，试过的人都懂！',
    ],
    examples: [
      '就说昨天吧，我又……（此处省略500字），真的太好笑了！',
      '我闺蜜更夸张，她直接……（此处省略剧情），我当场笑到打鸣！',
      '还记得第一次接触的时候，我还嗤之以鼻，结果现在……真香！',
      '给你们看看我拍的图/我的收藏（脑补画面），是不是超棒！',
    ],
    feelings: [
      '那种快乐谁懂啊！就像夏天咬下第一口冰西瓜的满足感！',
      '真的好治愈啊，一整天的疲惫都被扫空了！',
      '我直接原地螺旋升天式开心！太爱了！',
      '呜呜呜真的会被感动到，眼泪不值钱系列😭',
    ],
    perspectives: [
      '其实吧，人生苦短，喜欢的事就大胆去做，管别人说什么呢！',
      '我算是明白了，快乐最重要！其他的都是浮云～',
      '生活已经够难了，还不让人整点自己喜欢的了？',
      '再说了，人嘛，开心最重要，其他都靠边站！',
    ],
    closings: [
      '好啦今天就啰嗦到这里～你们有没有类似经历？评论区讲给我听！',
      '总而言之就是超级推荐！快冲！不好用来找我（不是）',
      'OK！我要继续享受了！大家晚安/周末愉快～记得点赞收藏哦❤️',
      '有同款的宝子举个手！让我看看我不是一个人！#日常分享 #生活记录 #好物推荐',
    ],
  },
  email: {
    openings: [
      '您好！现就「{text}」一事与您做进一步沟通。',
      '尊敬的合作伙伴：感谢您一直以来的支持与信任。关于「{text}」，现向您做如下说明。',
      '见信好！针对此前沟通中提到的「{text}」相关事宜，特此邮件与您详细交流。',
      '您好！首先感谢您在百忙之中阅读此邮件。现就「{text}」的具体情况汇报如下。',
    ],
    deepening: [
      '关于此事，我们进行了全面的梳理和评估，现将核心要点向您做简要说明。',
      '从目前的实际情况来看，这一事项具有以下几个方面的考量，在此与您逐一分享。',
      '需要特别说明的是，针对「{text}」，我们已进行了多轮内部讨论，形成了以下初步方案。',
      '具体而言，这一事项涉及多个层面，需要我们双方进行更为细致的沟通与对接。',
    ],
    examples: [
      '参考过往类似项目的经验，我们建议优先推进以下几个方面的工作。',
      '结合行业内的通行做法，我们认为可以按照以下思路来开展后续工作。',
      '以我们之前合作的某项目为例，当时采取的策略是……（省略具体内容），取得了预期的效果。',
      '从最佳实践的角度出发，我们整理了以下几点建议，供您参考。',
    ],
    feelings: [
      '我们高度重视此次合作机会，希望能与您携手推进，实现双方的互利共赢。',
      '我们对这一合作充满期待，相信通过双方的共同努力，一定能取得圆满成功。',
      '公司上下对这一项目都寄予厚望，我们将调配最优资源来保障其顺利推进。',
      '真诚地希望能够与您建立长期稳定的合作关系，共同开拓更广阔的市场。',
    ],
    perspectives: [
      '从长远发展的角度来看，这一合作对双方都具有重要的战略意义。',
      '综合各方面因素分析，我们认为目前是推进这一事项的最佳时机。',
      '站在行业发展的高度来审视，这一方向无疑具备广阔的前景和潜力。',
      '就投入产出比而言，这一项目的预期回报是相当可观的，值得我们全力以赴。',
    ],
    closings: [
      '以上是本次沟通的全部内容，如有任何疑问或需要进一步讨论的地方，请随时与我联系。期待您的回复。顺颂商祺！',
      '感谢您的耐心阅读，期待能收到您的宝贵意见。如需进一步交流，我随时恭候。祝工作顺利！',
      '再次感谢您的时间与关注。我们将密切跟进此事，并及时向您同步最新进展。期待与您的进一步合作。此致，敬礼！',
      '希望以上说明能够解答您的疑问。如您认为方案可行，我们可以尽快安排下一次会议进行详细讨论。期待您的回音！',
    ],
  },
  essay: {
    openings: [
      '岁月长河中，「{text}」如同散落在沙滩上的贝壳，平凡却闪着微光，等待着有心人俯身拾起。',
      '暮色四合，窗外的灯火次第亮起。独坐案前，忽然就想起了「{text}」这件事，思绪随之飘远。',
      '一个人走在熟悉的街道，脚下的落叶沙沙作响，不经意间，「{text}」的画面便浮现在脑海。',
      '有些事，无需刻意想起，却永远也不会忘记——「{text}」就是这样，静静地安放在记忆的某个角落。',
    ],
    deepening: [
      '时光荏苒，再回首，才发现那些当时只道是寻常的片段，如今想来竟是格外珍贵。',
      '原来，生命中真正重要的东西，往往都是这些看似微不足道的小事，串联起了我们全部的人生。',
      '细细咀嚼，「{text}」这两个字背后，是说不清道不尽的温柔与深意，值得用一生去回味。',
      '或许是岁月赋予了它别样的光泽，如今再谈起，心中涌动的是一种难以名状的情愫。',
    ],
    examples: [
      '记得那是一个寻常的午后，阳光正好，微风不燥，一切都像是被精心安排过一样。',
      '依稀记得当时的场景：……（省略具体描写），那画面，至今想起依然清晰如昨。',
      '那样的时刻，无需言语，一个眼神、一个动作，便胜过千言万语。',
      '后来，我走过很多路，遇见过很多人，却再也没有过那样的心境。',
    ],
    feelings: [
      '那份感觉，就像品一杯陈年的茶，初尝清淡，回味却无比悠长，唇齿留香，久久不散。',
      '心中某个柔软的角落被轻轻触碰，泛起阵阵涟漪，又缓缓归于平静，而那份暖意却长留心底。',
      '说不清是释然还是怀念，只是觉得，能够拥有这样一段回忆，已经是莫大的幸运。',
      '那一刻，所有的喧嚣都隐去了，只剩下内心的安宁，像秋日的湖水，澄澈而深邃。',
    ],
    perspectives: [
      '人生忽如寄，莫负茶、汤、好天气。若能把每一个平凡的瞬间都活出诗意，便已不负此生。',
      '或许，所谓的成长，就是一次次在回望中懂得，在懂得中珍惜，在珍惜中前行。',
      '生命中的每一段经历，都是命运的馈赠，哪怕只是「{text}」这样的小事，也自有其存在的意义。',
      '愿我们都能在岁月的打磨中，学会与自己和解，与生活温柔相拥。',
    ],
    closings: [
      '夜已深，就此搁笔。愿每一个读到这些文字的人，都能在平凡的生活中，找到属于自己的那份诗意与从容。',
      '风停了，雨歇了，而那些想说的话，似乎还远远没有说完。那就留待来日，慢慢说，慢慢品。',
      '合上本子，把这份心情小心收好。来日方长，我们还有很多时间，去经历，去感受，去记录。',
      '愿你走出半生，归来仍能为「{text}」这样的小事而心动。晚安，好梦。',
    ],
  },
  report: {
    openings: [
      '现就「{text}」相关情况进行系统梳理和全面总结，具体报告如下。',
      '根据工作部署，我们对「{text}」事项进行了深入调研和分析，现形成如下报告。',
      '为进一步推进工作落实，现将「{text}」的有关情况汇报如下，请予审议。',
      '针对前期工作中涉及的「{text}」问题，我们进行了专项研究，现做如下汇报。',
    ],
    deepening: [
      '从总体情况来看，该项工作目前进展顺利，取得了阶段性成果，但也存在一些不容忽视的问题。',
      '通过对相关数据的梳理和分析，可以看出以下几个方面的趋势和特点，需要引起高度关注。',
      '综合各方反馈信息，该事项的推进呈现出以下特征，在此做一简要归纳。',
      '具体而言，这一工作的开展可以从以下几个维度进行拆解和分析。',
    ],
    examples: [
      '以数据为例，第一季度相关指标同比提升了23%，环比增长15%，表现出良好的发展势头。',
      '对比同行业其他机构的做法，我们发现以下几个方面存在明显差异，值得认真研究和借鉴。',
      'A部门在这方面的做法具有代表性，其核心经验包括……（省略具体内容），值得推广。',
      '从近期的几个典型案例来看，……（省略案例描述），这为我们下一步的工作提供了有益参考。',
    ],
    feelings: [
      '我们对这一工作的顺利推进充满信心，也有决心在现有基础上取得更大突破。',
      '总的来说，全体团队成员对该项工作都投入了极大的热情，表现出了高度的责任心和专业素养。',
      '能够参与这一重要工作，团队每一位成员都深感责任重大，同时也倍感使命光荣。',
      '我们清醒地认识到，成绩的取得来之不易，需要倍加珍惜，持续巩固和扩大成果。',
    ],
    perspectives: [
      '从全局和战略的高度来看，这一工作的推进对于实现年度目标具有举足轻重的意义。',
      '站在长远发展的角度审视，当前的工作布局为后续的持续发展奠定了坚实基础。',
      '综合各方面条件分析，我们正处于推进该项工作的重要机遇期，必须牢牢把握。',
      '对标行业先进水平，我们仍存在一定差距，但同时也意味着还有较大的提升空间和潜力。',
    ],
    closings: [
      '以上是本次报告的全部内容，如有不妥之处，请各位领导和同事批评指正。下一步，我们将按照既定部署，扎实推进各项工作，确保各项目标任务按时保质完成。特此报告。',
      '综上所述，该项工作取得了积极进展，但仍需持续用力。我们将认真总结经验，分析不足，不断优化工作方法，争取更好的成绩。请各位领导审阅。',
      '下一步工作计划已初步制定，待本报告审议通过后即行启动实施。我们有信心、有决心圆满完成各项任务，不辜负组织的信任和期望。以上报告，请予审议。',
      '报告完毕，谢谢大家！欢迎各位提出宝贵意见和建议，我们将认真吸纳，不断改进工作。',
    ],
  },
  story: {
    openings: [
      '故事要从那天说起……「{text}」，不过是最平常的开头，谁也没有料到，后来会发生那么多事。',
      '我永远也忘不了那个日子，空气里弥漫着「{text}」的味道，一切都像是命运早已写好的剧本。',
      '那是一个再普通不过的日子，太阳照常升起，街道上人来人往，而「{text}」这件事，就那样毫无预兆地发生了。',
      '很久很久以前，在一个不起眼的地方，有一个关于「{text}」的故事，一直在悄悄流传着……',
    ],
    deepening: [
      '当时谁也没有想到，这件看似不起眼的小事，会像投入湖面的石子，激起一圈又一圈的涟漪。',
      '故事的发展总是出人意料，就当大家都以为一切已成定局的时候，事情却迎来了意想不到的转折。',
      '冥冥之中仿佛有一只无形的手，在悄然推动着一切，让每一个人物的命运都悄然发生了改变。',
      '事情的起因说起来很简单，但其中的曲折，怕是三天三夜也说不完。',
    ],
    examples: [
      '还记得那天清晨，……（省略具体场景描写），现在回想起来，那正是一切的开始。',
      '说起来也巧，如果那天没有……（省略偶然事件），后面的故事也许就不会发生了。',
      '当时在场的有这么几个人：……（人物介绍），每个人都有自己的心思，自己的盘算。',
      '有一个细节我至今记得清清楚楚：……（省略细节），现在想来，那竟是重要的伏笔。',
    ],
    feelings: [
      '那一刻，我整个人都僵住了，脑子里一片空白，过了好一会儿才反应过来到底发生了什么。',
      '要说当时的心情，真是五味杂陈，激动、紧张、欣喜、担忧……各种情绪搅在一起，说不出是什么滋味。',
      '我永远记得他/她当时说那句话的眼神，那么亮，那么坚定，像黑夜里的一颗星。',
      '那样的场景，那样的氛围，即使是铁石心肠的人，恐怕也会被触动吧。',
    ],
    perspectives: [
      '后来我常常想，如果当时做出了不同的选择，故事的结局会不会也不一样？',
      '也许，这就是命运的奇妙之处——你永远不知道下一颗巧克力是什么味道。',
      '经历过这一切我才明白，原来人生中每一次看似偶然的相遇，其实都是必然。',
      '故事或许有结束的时候，但它留给我们的思考和感动，却会一直延续下去。',
    ],
    closings: [
      '后来的后来，每当回想起这段往事，嘴角都会不自觉地上扬。原来，生命中那些不期而遇的温暖，才是最值得珍藏的宝藏。',
      '故事到这里就告一段落了，但生活还在继续。谁知道呢，也许下一个故事，正在下一个路口等着你我。',
      '从那以后，我变得不一样了。是「{text}」这件事，让我读懂了很多，也成长了很多。而这，就是最好的结局。',
      '岁月如梭，光阴似箭，唯有故事长留人心。愿你我，都能成为自己人生故事里的主角。',
    ],
  },
  product: {
    openings: [
      '今天必须给大家种草一款真心好用的东西——关于「{text}」，我真的有太多话想说！',
      '在试过了无数同类产品之后，终于让我找到了真正的心头好！今天就来好好聊聊「{text}」这件事。',
      '姐妹们/家人们！我真的不允许还有人不知道这个！关于「{text}」的正确打开方式，让我来告诉你！',
      '好物推荐预警！关于「{text}」，这可能是我今年最真诚的一次安利了！',
    ],
    deepening: [
      '为什么说它是真的好用？因为它真的解决了我长期以来的一个痛点，效果可以说是立竿见影。',
      '市面上同类产品那么多，为什么偏偏这一款让我如此上头？接下来我就从几个维度给大家详细分析一下。',
      '我也是做了很多功课、对比了N款之后，才最终选择了它。事实证明，我的选择没有错！',
      '真正的好东西，是经得起时间和使用考验的。这一点，它完全做到了。',
    ],
    examples: [
      '先说说我自己的使用感受：用了第一周就发现……（省略具体效果），真的太惊喜了！',
      '我当时是抱着试试看的心态入手的，没想到……（省略效果描述），直接把我圈粉了！',
      '给你们看一组对比图/数据（自行脑补），效果真的肉眼可见！谁用谁知道！',
      '推荐给了身边好几个朋友，她们用过之后都回来感谢我，说真的打开了新世界的大门！',
    ],
    feelings: [
      '那种终于找对了产品的感觉，就像在茫茫人海中遇到了对的人，感动到想哭！',
      '用了它之后，我只想说：以前的我都在干什么！为什么没有早点遇见它！',
      '每天使用的时候，心情都会变好，这种「花钱花得值」的感觉真的太爽了！',
      '我现在逢人就推荐，已经成功安利了不下十个人，就是这么有底气！',
    ],
    perspectives: [
      '说实话，现在市面上噱头产品太多了，真正用心做品质的越来越少。而这一款，是真的有在认真做事。',
      '我一直觉得，买东西不一定要贵，但一定要对。适合自己的，才是最好的。',
      '从性价比的角度来说，它真的做到了极致。同等价位下，你很难找到比它更好的选择。',
      '好的产品会说话，这就是为什么我愿意真心实意地为它打call。',
    ],
    closings: [
      '总结一下：闭眼入就对了！用过的姐妹都懂！如果觉得有用，别忘了点赞收藏，转给你需要的朋友～我们下次种草再见！',
      '好啦，今天的分享就到这里。有问题的小伙伴欢迎在评论区留言，我会一一回复的！冲就完事了！',
      '如果你也在寻找同类产品，真心建议你试试这一款。相信我，它不会让你失望的。购买链接我放评论区了哦～',
      '最后想说，能遇到一款真正合心意的产品真的不容易，且用且珍惜！感谢观看今天的分享，爱你们～',
    ],
  },
  academic: {
    openings: [
      '近年来，关于「{text}」这一主题的研究日益受到学术界的广泛关注，相关成果不断涌现。',
      '随着社会经济的快速发展和技术的持续进步，「{text}」领域的重要性愈发凸显，成为众多学者关注的焦点。',
      '本文旨在围绕「{text}」这一核心议题，从理论与实践两个层面展开系统的分析和探讨。',
      '从学术研究的发展脉络来看，「{text}」作为一个重要的研究方向，具有深厚的理论根基和广阔的应用前景。',
    ],
    deepening: [
      '从已有研究来看，学术界对于「{text}」的探讨主要集中在以下几个方面，本文将逐一进行梳理和评述。',
      '深入分析现有文献可以发现，尽管相关研究已取得丰硕成果，但在以下几个方面仍存在进一步探讨的空间。',
      '本研究的核心问题意识在于：在当前的时代背景下，如何重新理解和界定「{text}」的内涵与外延？',
      '通过对相关理论的系统梳理，可以构建出一个更为全面的分析框架，用以解释这一复杂的社会/自然现象。',
    ],
    examples: [
      '实证数据表明，在过去五年间，相关指标呈现出显著的上升趋势（详见图1和表2），这一现象值得深入研究。',
      '以某典型案例为例，通过对其进行深入的个案分析，可以清晰地观察到这一机制的具体运作过程。',
      '对比研究显示，A组与B组在该项指标上存在显著差异（p<0.05），这为我们的核心假设提供了有力支持。',
      '回顾学术史，早在XX年，著名学者XXX就已对这一现象进行了开创性的研究，提出了具有深远影响的理论框架。',
    ],
    feelings: [
      '本研究的开展，离不开前辈学者奠定的坚实基础，在此致以诚挚的谢意。',
      '我们深知，本研究仅为该领域的初步探索，仍存在诸多局限和不足，期待学界同仁不吝赐教。',
      '能够参与这一富有挑战性的研究工作，研究团队的每一位成员都深感荣幸和责任重大。',
      '我们坚信，随着研究的不断深入，这一领域必将取得更多具有突破性的理论成果。',
    ],
    perspectives: [
      '从学科交叉的视角来看，这一研究方向具有巨大的发展潜力，有望催生新的学术增长点。',
      '站在理论演进的高度审视，当前的研究范式正在经历一次深刻的转型，这需要学界同仁的共同努力。',
      '从方法论的角度反思，传统的研究路径已显现出一定的局限性，亟需引入新的研究工具和分析手段。',
      '放眼未来，该领域的研究将朝着更加精细化、系统化、实证化的方向不断发展。',
    ],
    closings: [
      '综上所述，本研究通过多维度的理论分析与实证检验，揭示了「{text}」的内在规律和作用机制。未来的研究可以在现有基础上，进一步拓展研究视角，深化对这一问题的理解。这也是我们后续工作的努力方向。',
      '综上，本文的研究结论具有一定的理论价值和实践意义。然而，由于研究方法和数据可得性的限制，仍存在一些不足之处，有待后续研究加以完善和修正。',
      '通过上述系统的分析和论证，本文得出以下主要结论……（省略具体结论）。这一发现不仅丰富了相关领域的理论积累，也为后续的实践应用提供了可资借鉴的参考。研究仍有诸多不足，恳请各位专家学者批评指正。',
      '行文至此，本研究暂告一段落。学术探索永无止境，我们将以本研究为起点，在这一方向上持续耕耘，期待能够产出更多具有原创性的学术成果。感谢各位的耐心阅读。',
    ],
  },
};

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

  private fillTemplate(template: string, text: string): string {
    return template.replace(/\{text\}/g, text);
  }

  private applyTone(sentence: string, toneModifiers: typeof TONE_MODIFIERS[string], isFirst: boolean, isLast: boolean): string {
    let result = sentence;

    if (toneModifiers.interjections.length > 0 && (isFirst || Math.random() < 0.2)) {
      result = this.getRandomItem(toneModifiers.interjections) + ' ' + result;
    }

    if (isFirst && toneModifiers.prefixes.length > 0 && Math.random() < 0.7) {
      result = this.getRandomItem(toneModifiers.prefixes) + result;
    }

    if (isLast && toneModifiers.suffixes.length > 0 && Math.random() < 0.6) {
      result = result.replace(/[。！？.!?]$/, '') + this.getRandomItem(toneModifiers.suffixes);
    }

    return result;
  }

  private applyAudienceContext(
    sentences: string[],
    audienceAdaptation: typeof AUDIENCE_ADAPTATIONS[string],
  ): string[] {
    const result = [...sentences];

    if (audienceAdaptation.levelPhrases.length > 0 && Math.random() < 0.6 && result.length > 2) {
      const insertIdx = this.getRandomInt(1, result.length - 1);
      const levelPhrase = this.getRandomItem(audienceAdaptation.levelPhrases);
      result[insertIdx] = levelPhrase + result[insertIdx].charAt(0).toLowerCase() + result[insertIdx].slice(1);
    }

    if (Math.random() < 0.5 && audienceAdaptation.contextSentences.length > 0) {
      const contextIdx = this.getRandomInt(1, Math.min(2, result.length - 1));
      result.splice(contextIdx, 0, this.getRandomItem(audienceAdaptation.contextSentences));
    }

    return result;
  }

  async expand(request: ExpandRequest): Promise<ExpandResponse> {
    const { text, style, length, tone, audience } = request;

    const styleKey = STYLE_EXPANSIONS[style] ? style : 'article';
    const lengthConfig = LENGTH_CONFIGS[length] || LENGTH_CONFIGS.medium;
    const toneConfig = TONE_MODIFIERS[tone] || TONE_MODIFIERS.casual;
    const audienceConfig = AUDIENCE_ADAPTATIONS[audience] || AUDIENCE_ADAPTATIONS.general;
    const styleExpansions = STYLE_EXPANSIONS[styleKey];

    const trimmedText = text.trim();
    const coreText = trimmedText.replace(/[。！？.!?]$/, '');

    const allParagraphs: string[] = [];

    for (let p = 0; p < lengthConfig.paragraphs; p++) {
      const isFirstPara = p === 0;
      const isLastPara = p === lengthConfig.paragraphs - 1;
      const sentences: string[] = [];
      const sentenceTypes = this.shuffleArray([
        'deepening',
        'examples',
        'feelings',
        'perspectives',
      ]);

      if (isFirstPara) {
        const opening = this.fillTemplate(this.getRandomItem(styleExpansions.openings), coreText);
        sentences.push(this.applyTone(opening, toneConfig, true, false));
      }

      const typesToUse = sentenceTypes.slice(0, lengthConfig.sentencesPerPara);
      typesToUse.forEach((type, idx) => {
        const template = this.getRandomItem(styleExpansions[type as keyof typeof styleExpansions]);
        const filled = this.fillTemplate(template, coreText);
        const isLastSent = isLastPara && idx === typesToUse.length - 1;
        sentences.push(this.applyTone(filled, toneConfig, false, isLastSent));
      });

      if (isLastPara) {
        const closing = this.fillTemplate(this.getRandomItem(styleExpansions.closings), coreText);
        sentences.push(this.applyTone(closing, toneConfig, false, true));
      }

      const adaptedSentences = this.applyAudienceContext(sentences, audienceConfig);
      allParagraphs.push(adaptedSentences.join('\n\n'));
    }

    const result = allParagraphs.join('\n\n');
    const wordCount = result.replace(/\s/g, '').length;

    const styleNameMap: Record<string, string> = {
      article: '公众号文章',
      social: '社交媒体',
      email: '商务邮件',
      essay: '散文随笔',
      report: '工作报告',
      story: '故事叙述',
      product: '产品文案',
      academic: '学术风格',
    };

    return {
      result,
      style: styleNameMap[styleKey] || '公众号文章',
      length: lengthConfig.name,
      wordCount,
    };
  }
}
