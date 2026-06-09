import { Injectable } from '@nestjs/common';

export interface ScenePhrase {
  english: string;
  chinese: string;
  context?: string;
}

export interface ScenePattern {
  pattern: string;
  example: string;
  translation: string;
  explanation: string;
}

export interface SceneTip {
  title: string;
  content: string;
}

export interface SceneEnglishResponse {
  sceneName: string;
  sceneNameEn: string;
  briefIntroduction: string;
  keyPhrases: ScenePhrase[];
  commonPatterns: ScenePattern[];
  tips: SceneTip[];
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string }[];
}

export interface SceneInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: string;
  description: string;
  keywords: string[];
}

const SCENES_DATA: Record<string, {
  info: SceneInfo;
  briefIntroduction: string;
  keyPhrases: ScenePhrase[];
  commonPatterns: ScenePattern[];
  tips: SceneTip[];
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string }[];
}> = {
  business_meeting: {
    info: {
      id: 'business_meeting',
      name: '和外国同事开会',
      nameEn: 'Business Meeting with Foreign Colleagues',
      icon: 'Briefcase',
      category: '职场',
      description: '国际商务会议、跨国团队会议沟通',
      keywords: ['会议', '开会', '商务', '同事', '团队', 'work', 'meeting', 'conference'],
    },
    briefIntroduction: '在国际商务会议中，清晰、专业、礼貌的表达至关重要。需要掌握会议开场、议题讨论、意见表达、议程推进、总结收尾等环节的常用表达。',
    keyPhrases: [
      { english: "Let's get the meeting started.", chinese: '我们开始开会吧。', context: '会议开场' },
      { english: "First on the agenda is...", chinese: '议程第一项是...', context: '介绍议题' },
      { english: "I'd like to share my thoughts on this.", chinese: '我想分享一下我对此的看法。', context: '发表意见' },
      { english: "Could you elaborate on that?", chinese: '你能详细说明一下吗？', context: '请求解释' },
      { english: "I see your point, but...", chinese: '我理解你的观点，但是...', context: '委婉反对' },
      { english: "Let's move on to the next item.", chinese: '我们进入下一项议题吧。', context: '推进议程' },
      { english: "Let's wrap this up.", chinese: '我们来总结一下吧。', context: '会议收尾' },
      { english: "Action items will be sent out after the meeting.", chinese: '行动项将在会后发送。', context: '分配任务' },
      { english: "Can we circle back to this later?", chinese: '我们稍后再回到这个问题上好吗？', context: '暂缓讨论' },
      { english: "Let's take a 5-minute break.", chinese: '我们休息5分钟吧。', context: '中场休息' },
    ],
    commonPatterns: [
      {
        pattern: "From my perspective, + [观点]",
        example: "From my perspective, we should prioritize the Q3 launch.",
        translation: "在我看来，我们应该优先考虑第三季度的发布。",
        explanation: "正式发表个人观点的常用句型，比 I think 更加专业。"
      },
      {
        pattern: "I'm afraid I don't quite follow. Could you + [请求]?",
        example: "I'm afraid I don't quite follow. Could you explain the data again?",
        translation: "恐怕我没太听懂，你能再解释一下这些数据吗？",
        explanation: "礼貌地表示没听懂并请求重复，避免直接说 I don't understand。"
      },
      {
        pattern: "Let's aim to + [目标] by + [时间].",
        example: "Let's aim to finalize the proposal by next Friday.",
        translation: "我们争取在下周五前敲定提案。",
        explanation: "设定明确目标和截止时间的常用表达。"
      },
      {
        pattern: "To sum up, we've agreed that + [总结].",
        example: "To sum up, we've agreed that the marketing budget will increase by 10%.",
        translation: "总结一下，我们已同意营销预算增加10%。",
        explanation: "会议总结时确认共识的标准句型。"
      },
    ],
    tips: [
      { title: '礼貌表达不同意见', content: '避免直接说 "You\'re wrong" 或 "I disagree"，使用 "I see your point, however..."、"Have we considered..."、"Another angle to think about is..." 等委婉表达。' },
      { title: '会议中的插话技巧', content: '想插话时可以说 "Sorry to interrupt, but..."、"Could I just add something here?"、"Quick question..."，而不是直接打断对方。' },
      { title: '确认共识很重要', content: '讨论完每个议题后，用 "So we all agree that..."、"Let me confirm—are we on the same page?" 来确认大家理解一致，避免后续误解。' },
      { title: '使用商务缩略语', content: '常见缩略语：ASAP (尽快)、ETA (预计到达时间)、FYI (供你参考)、Action Item (待办事项)、RSVP (请回复)、KPI (关键绩效指标)。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning everyone, thanks for joining. Let's get the meeting started.", chinese: '大家早上好，感谢参加。我们开始开会吧。' },
      { role: 'B', english: "First on the agenda is the Q3 product launch. Sarah, could you walk us through the timeline?", chinese: '议程第一项是第三季度产品发布。Sarah，你能给我们介绍一下时间线吗？' },
      { role: 'A', english: "Sure. From my perspective, we should aim to launch by mid-September.", chinese: '好的。在我看来，我们应该争取在9月中旬发布。' },
      { role: 'B', english: "I see your point, but the engineering team needs more time for testing.", chinese: '我理解你的观点，但工程团队需要更多测试时间。' },
      { role: 'A', english: "That's a fair point. Could we circle back to this after the engineering update?", chinese: '有道理。我们能否在工程团队更新后再回到这个议题？' },
      { role: 'B', english: "Absolutely. Let's move on to the next item—marketing budget.", chinese: '当然可以。我们进入下一项——营销预算。' },
    ],
  },
  airport_checkin: {
    info: {
      id: 'airport_checkin',
      name: '在机场值机',
      nameEn: 'Airport Check-in',
      icon: 'Airplane',
      category: '旅行',
      description: '机场值机、行李托运、座位选择等场景',
      keywords: ['机场', '值机', '登机', '行李', '托运', 'airport', 'checkin', 'flight', 'luggage'],
    },
    briefIntroduction: '机场值机是出国旅行的第一步，需要与值机人员清晰沟通目的地、行李数量、座位偏好等信息。',
    keyPhrases: [
      { english: "I'd like to check in, please.", chinese: '我想办理值机。', context: '开始办理' },
      { english: "Here's my passport and booking confirmation.", chinese: '这是我的护照和预订确认单。', context: '出示证件' },
      { english: "I have two bags to check in.", chinese: '我有两件行李要托运。', context: '托运行李' },
      { english: "Is this bag within the weight limit?", chinese: '这个行李在重量限制内吗？', context: '询问重量' },
      { english: "Can I have a window seat, please?", chinese: '请给我一个靠窗的座位好吗？', context: '选择座位' },
      { english: "I'd prefer an aisle seat.", chinese: '我想要靠过道的座位。', context: '选择座位' },
      { english: "Are there any exit row seats available?", chinese: '有没有紧急出口的座位？', context: '特殊座位' },
      { english: "What's my boarding gate?", chinese: '我的登机口是哪个？', context: '询问登机口' },
      { english: "What time is boarding?", chinese: '什么时候开始登机？', context: '登机时间' },
      { english: "Is my flight on time?", chinese: '我的航班准点吗？', context: '航班动态' },
    ],
    commonPatterns: [
      {
        pattern: "Could you please tell me where + [地点] is?",
        example: "Could you please tell me where Gate B12 is?",
        translation: "你能告诉我B12登机口在哪里吗？",
        explanation: "礼貌地询问地点信息。"
      },
      {
        pattern: "I'm connecting to + [航班号/目的地]. Is my luggage checked through?",
        example: "I'm connecting to Flight DL123 to New York. Is my luggage checked through?",
        translation: "我要转机搭乘DL123航班去纽约，我的行李是直挂的吗？",
        explanation: "转机旅客确认行李是否直挂目的地。"
      },
      {
        pattern: "Do I need to + [动作]?",
        example: "Do I need to collect my luggage and re-check it?",
        translation: "我需要提取行李并重新托运吗？",
        explanation: "确认是否需要做某事。"
      },
      {
        pattern: "Here's my + [物品].",
        example: "Here's my ID and e-ticket reference.",
        translation: "这是我的身份证和电子票号。",
        explanation: "向工作人员出示证件或票据的简洁表达。"
      },
    ],
    tips: [
      { title: '行李超重的应对', content: '如果行李超重，工作人员可能会说 "Your bag is over the weight limit"，你可以选择付费托运 ("How much is the excess baggage fee?") 或者取出部分物品到随身行李中。' },
      { title: '特殊座位的申请', content: '想要更多腿部空间可以问 "Are there any bulkhead seats available?"（隔板前排座位）或 "exit row seats"（紧急出口排），但后者需要能协助紧急撤离。' },
      { title: '转机时的关键问句', content: '转机务必问："Do I need to go through immigration and customs here?"、"Is my boarding pass still valid for the next flight?"、"Where is the transfer desk?"。' },
      { title: '值机相关词汇', content: 'carry-on baggage (随身行李)、checked baggage (托运行李)、baggage tag (行李牌)、boarding pass (登机牌)、jet bridge (廊桥)、tarmac (停机坪)。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning! I'd like to check in, please.", chinese: '早上好！我想办理值机。' },
      { role: 'B', english: "Good morning! May I see your passport and ticket, please?", chinese: '早上好！请出示您的护照和机票好吗？' },
      { role: 'A', english: "Certainly. Here's my passport. I have one suitcase to check in and a carry-on.", chinese: '当然可以。这是我的护照。我有一件行李箱要托运，还有一件随身行李。' },
      { role: 'B', english: "Where are you flying to today?", chinese: '您今天要飞往哪里？' },
      { role: 'A', english: "I'm flying to San Francisco, with a connection in Tokyo.", chinese: '我飞往旧金山，在东京转机。' },
      { role: 'B', english: "Would you prefer a window or aisle seat?", chinese: '您想要靠窗还是靠过道的座位？' },
      { role: 'A', english: "A window seat, please. And could you tell me if my luggage is checked through to my final destination?", chinese: '请给我靠窗座位。你能告诉我我的行李是直挂到最终目的地吗？' },
      { role: 'B', english: "Yes, your bags will be checked straight through. Your gate is C18, boarding starts at 10:45.", chinese: '是的，您的行李将直挂。您的登机口是C18，10:45开始登机。' },
    ],
  },
  tv_series_slang: {
    info: {
      id: 'tv_series_slang',
      name: '看美剧听不懂俚语',
      nameEn: 'Understanding TV Show Slang',
      icon: 'VideoPlay',
      category: '娱乐',
      description: '理解美剧中常见的俚语、口语和流行表达',
      keywords: ['美剧', '俚语', '口语', '英语', '电影', 'tv', 'slang', 'movie', 'drama'],
    },
    briefIntroduction: '美剧中充斥着大量俚语、缩写和非正式表达，这些是教科书不会教的内容。掌握这些地道表达能帮助你更好地理解剧情，也能让你的英语更自然。',
    keyPhrases: [
      { english: "What's up?", chinese: '怎么样？/ 最近好吗？', context: '日常打招呼，比 How are you 更随意' },
      { english: "No biggie.", chinese: '没什么大不了的。', context: '表示事情不重要' },
      { english: "I'm beat.", chinese: '我累死了。', context: '口语表达疲惫' },
      { english: "It's a piece of cake.", chinese: '小菜一碟。', context: '形容事情很容易' },
      { english: "Hang on a sec.", chinese: '稍等一下。', context: '让对方等一下' },
      { english: "You're kidding, right?", chinese: '你在开玩笑吧？', context: '表示难以置信' },
      { english: "I'm in.", chinese: '我加入/我同意。', context: '表示愿意参与' },
      { english: "Let's call it a day.", chinese: '今天就到这里吧。', context: '结束当天活动或工作' },
      { english: "Spill the tea!", chinese: '快爆料！', context: 'tea=gossip，让对方分享八卦' },
      { english: "That's a vibe.", chinese: '这氛围不错。', context: 'vibe=氛围/感觉，表示赞赏' },
    ],
    commonPatterns: [
      {
        pattern: "I feel you / I feel that.",
        example: "- This homework is so annoying. - I feel you.",
        translation: "——这作业太烦了。——我懂你的感受。",
        explanation: "表示理解和认同对方的感受，非常地道的口语表达。"
      },
      {
        pattern: "It is what it is.",
        example: "We lost the game. Oh well, it is what it is.",
        translation: "我们输了比赛。唉，事已至此，就这样吧。",
        explanation: "表示接受无法改变的现状，无奈但释然。"
      },
      {
        pattern: "Low-key / High-key + [形容词/动词]",
        example: "I low-key love this song. / I high-key want to go there.",
        translation: "我偷偷喜欢这首歌。/ 我超想去那里。",
        explanation: "low-key=低调/有点/暗自；high-key=高调/非常。年轻人常用的修饰词。"
      },
      {
        pattern: "Bet.",
        example: "- I'll finish this by tomorrow. - Bet.",
        translation: "——我明天前完成这个。——行，那就这么说定了。",
        explanation: "可以表示同意、确认、或者『那就走着瞧』的挑战语气，根据语境判断。"
      },
    ],
    tips: [
      { title: '常见俚语和缩写', content: 'GOAT (Greatest Of All Time 史上最佳)、SUS (suspicious 可疑的)、Cap (说谎)、No Cap (没骗你)、Slay (表现超棒)、Flex (炫耀)、Vibe (氛围/感觉)、Stan (狂热粉丝)。' },
      { title: '理解语境是关键', content: '同一个词在不同语境意思完全不同。例如 "sick" 可以是"生病的"也可以是"超酷的"；"bad" 在俚语中可能是"好的"意思。注意观察上下文。' },
      { title: '语气和重音', content: '口语表达很大程度依赖语气。例如 "Really?" 升调表示惊讶，降调表示怀疑。看剧时注意演员的语调和表情。' },
      { title: '积累建议', content: '建议选一部贴近生活的现代剧（如《老友记》《摩登家庭》）反复看，把不认识的俚语记下来，配合场景理解。不要一开始就看太文艺或太古老的剧。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Hey, did you watch the new episode last night?", chinese: '嘿，你昨晚看新一集了吗？' },
      { role: 'B', english: "Oh my god, yes! That ending was crazy. Low-key did not see that coming.", chinese: '我的天，看了！结局太疯狂了。真是没想到。' },
      { role: 'A', english: "Right? When Mike found out... I was shook. Spill the tea—what did you think?", chinese: '对吧？当Mike发现的时候……我震惊了。快说说你怎么看？' },
      { role: 'B', english: "I feel you. Honestly thought it was a dream at first. But it is what it is. Bet the next episode is even crazier.", chinese: '我懂你。说实话一开始我还以为是做梦。但事已至此。赌下一集更疯狂。' },
      { role: 'A', english: "No cap. Hey, wanna watch it together this weekend? My place?", chinese: '真的。嘿，这周末一起看不？去我家？' },
      { role: 'B', english: "I'm in! That sounds sick. Let's call it—7pm Saturday.", chinese: '我来！听起来超棒。就这么定了——周六晚上7点。' },
    ],
  },
  restaurant_ordering: {
    info: {
      id: 'restaurant_ordering',
      name: '餐厅点餐',
      nameEn: 'Restaurant Ordering',
      icon: 'KnifeFork',
      category: '生活',
      description: '国外餐厅点餐、询问菜品、特殊要求、结账',
      keywords: ['餐厅', '点餐', '吃饭', '菜单', '订餐', 'restaurant', 'food', 'menu', 'dinner'],
    },
    briefIntroduction: '在国外餐厅用餐，需要掌握从入座、看菜单、点餐、特殊要求到结账的全流程表达。礼貌和清晰是关键。',
    keyPhrases: [
      { english: "We'd like a table for two, please.", chinese: '我们想要一张两人桌。', context: '入座' },
      { english: "Do you have any reservations?", chinese: '你们有预订吗？', context: '服务员询问' },
      { english: "Could we see the menu, please?", chinese: '请给我们菜单好吗？', context: '要菜单' },
      { english: "What do you recommend?", chinese: '你推荐什么？', context: '询问推荐' },
      { english: "Is this dish spicy?", chinese: '这道菜辣吗？', context: '询问口味' },
      { english: "I'll have the grilled salmon, please.", chinese: '请给我来一份烤三文鱼。', context: '正式点餐' },
      { english: "I'm allergic to peanuts.", chinese: '我对花生过敏。', context: '食物过敏' },
      { english: "Could I get that without onions, please?", chinese: '那份能不放洋葱吗？', context: '特殊要求' },
      { english: "Check, please. / Can we have the bill?", chinese: '请结账。', context: '买单' },
      { english: "Could you pack this to go?", chinese: '能帮我打包带走吗？', context: '打包' },
    ],
    commonPatterns: [
      {
        pattern: "I'll go with + [菜品名称].",
        example: "I'll go with the chef's special.",
        translation: "我来一份主厨特色菜。",
        explanation: "点菜时的轻松说法，比 I'll have 更随意。"
      },
      {
        pattern: "How is the + [菜品] prepared?",
        example: "How is the steak prepared here?",
        translation: "你们这里的牛排是怎么做的？",
        explanation: "询问菜品的烹饪方式。"
      },
      {
        pattern: "Would you mind + [动词ing]?",
        example: "Would you mind bringing us some extra napkins?",
        translation: "能麻烦再给我们拿一些餐巾纸吗？",
        explanation: "非常礼貌地提出请求。"
      },
      {
        pattern: "That was delicious. Compliments to the chef.",
        example: "That was delicious. Compliments to the chef.",
        translation: "太好吃了。请向主厨转达赞美。",
        explanation: "对菜品表示满意和赞美的地道说法。"
      },
    ],
    tips: [
      { title: '牛排熟度的说法', content: 'rare（一分熟）、medium rare（三分熟）、medium（五分熟）、medium well（七分熟）、well done（全熟）。大多数西餐厅默认 medium rare。' },
      { title: '小费文化', content: '美国：15-20%；加拿大：15-20%；英国：10-15%；欧洲大陆：一般5-10%或 rounding up；日本/韩国：通常不需要。账单上写 "service included" 表示已含服务费。' },
      { title: '过敏和特殊饮食', content: '务必说清楚：vegetarian（素食）、vegan（纯素，不含蛋奶）、gluten-free（无麸质）、lactose intolerant（乳糖不耐受）、nut allergy（坚果过敏）。严重过敏可以说 "It\'s a severe allergy, could you double-check with the kitchen?"。' },
      { title: '常见菜单词汇', content: 'appetizer/starter（开胃菜）、main course/entrée（主菜）、side dish（配菜）、dessert（甜点）、beverage（饮料）、soup of the day（当日例汤）、today\'s special（今日特供）。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good evening! Do you have a reservation?", chinese: '晚上好！请问有预订吗？' },
      { role: 'B', english: "Yes, under the name Smith. A table for two, please.", chinese: '有的，名字是Smith。请给我们一张两人桌。' },
      { role: 'A', english: "Right this way. Here are your menus. Can I get you started with something to drink?", chinese: '这边请。这是菜单。先来点喝的吗？' },
      { role: 'B', english: "I'll have a glass of red wine, please. And do you have any non-alcoholic options?", chinese: '请给我一杯红酒。你们有无酒精饮品吗？' },
      { role: 'A', english: "Certainly. We have sparkling water, soft drinks, and fresh juices. Are you ready to order?", chinese: '当然有。我们有气泡水、软饮和鲜榨果汁。准备好点菜了吗？' },
      { role: 'B', english: "Yes. I'll go with the ribeye steak, medium rare. And my friend will have the grilled salmon. Could we get that with no salt, please?", chinese: '好了。我要肋眼牛排，三分熟。我朋友要烤三文鱼。那份能不放盐吗？' },
      { role: 'A', english: "Absolutely. Anything else?", chinese: '没问题。还要别的吗？' },
      { role: 'B', english: "Just a side of steamed vegetables, please. Thank you.", chinese: '再来一份蒸蔬菜就好。谢谢。' },
    ],
  },
  job_interview: {
    info: {
      id: 'job_interview',
      name: '求职面试',
      nameEn: 'Job Interview',
      icon: 'User',
      category: '职场',
      description: '英语面试自我介绍、回答问题、反问环节',
      keywords: ['面试', '求职', '工作', '招聘', 'interview', 'job', 'career', 'resume'],
    },
    briefIntroduction: '英语面试需要展现专业能力和沟通技巧。清晰的自我介绍、有条理的回答、恰当的反问都能加分。',
    keyPhrases: [
      { english: "Thank you for having me today.", chinese: '感谢您今天邀请我来面试。', context: '开场感谢' },
      { english: "I'd be happy to tell you about myself.", chinese: '我很乐意介绍一下我自己。', context: '自我介绍' },
      { english: "I have 5 years of experience in marketing.", chinese: '我有5年的市场营销经验。', context: '介绍经验' },
      { english: "My greatest strength is problem-solving.", chinese: '我最大的优势是解决问题的能力。', context: '回答优势' },
      { english: "I'm working on improving my public speaking skills.", chinese: '我正在努力提升公众演讲能力。', context: '回答劣势' },
      { english: "In my previous role, I led a team of 8 people.", chinese: '在上一份工作中，我带领了一个8人的团队。', context: '描述过往经历' },
      { english: "I'm particularly interested in this role because...", chinese: '我对这个职位特别感兴趣是因为...', context: '表达动机' },
      { english: "Where do you see the company in the next 5 years?", chinese: '您认为公司未来5年的发展方向是什么？', context: '反问面试官' },
      { english: "What are the next steps in the interview process?", chinese: '面试流程的下一步是什么？', context: '询问后续' },
      { english: "I look forward to hearing from you.", chinese: '期待您的回复。', context: '结束语' },
    ],
    commonPatterns: [
      {
        pattern: "Using the STAR method: Situation + Task + Action + Result",
        example: "In my previous job (Situation), I was tasked with improving customer retention (Task). I implemented a new feedback system (Action), which increased retention by 25% (Result).",
        translation: "在我之前的工作中（情境），我被指派提升客户留存率（任务）。我实施了一套新的反馈系统（行动），将留存率提高了25%（结果）。",
        explanation: "回答行为面试问题的黄金法则：用具体案例说明能力。"
      },
      {
        pattern: "I'm excited about the opportunity to + [动词].",
        example: "I'm excited about the opportunity to contribute to your team's growth.",
        translation: "我很期待能为团队的发展做出贡献。",
        explanation: "表达对职位的热情和期待。"
      },
      {
        pattern: "That's a great question. Let me think...",
        example: "That's a great question. Let me think about an example from my last project.",
        translation: "这个问题很好。让我想一想我上一个项目中的例子。",
        explanation: "需要思考时的过渡语，避免沉默尴尬，也展现你在认真思考。"
      },
      {
        pattern: "I believe my experience in + [领域] aligns well with this role.",
        example: "I believe my experience in project management aligns well with this role.",
        translation: "我相信我在项目管理方面的经验与这个职位非常匹配。",
        explanation: "说明自身经验与岗位要求的契合度。"
      },
    ],
    tips: [
      { title: '自我介绍的结构', content: '建议按以下顺序：1) 目前身份（"I\'m a software engineer with 4 years of experience..."）2) 核心技能和经验 3) 为什么对这个职位感兴趣。控制在1-2分钟内。' },
      { title: '回答"弱点"的技巧', content: '不要说"我最大的缺点就是太追求完美"这种陈词滥调。真诚说一个真实但不致命的弱点，并说明你正在如何改进："I used to struggle with time management, but I\'ve started using the Pomodoro Technique and it\'s helped a lot."' },
      { title: '反问面试官的问题', content: '面试最后通常会问 "Do you have any questions for us?"，千万别说 No。好问题："What does success look like in this role in the first year?"、"Can you tell me about the team I\'d be working with?"、"What\'s the company culture like?"。' },
      { title: '避免的表达', content: '避免过于口语化的俚语（like, kinda, gonna）、避免过于绝对（"I\'m the best at..."）、避免否定前雇主或同事（即使是真的）。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning. Thanks for coming in today. Could you start by telling us a little about yourself?", chinese: '早上好。感谢你今天来面试。可以先简单介绍一下你自己吗？' },
      { role: 'B', english: "Thank you for having me. I'm a product manager with 6 years of experience in the tech industry. In my previous role at XYZ Company, I led the launch of three successful mobile apps.", chinese: '感谢邀请。我是一名在科技行业有6年经验的产品经理。在之前的XYZ公司，我主导了三个成功的移动应用的发布。' },
      { role: 'A', english: "That's impressive. Can you tell us about a time you overcame a significant challenge?", chinese: '很厉害。能说说你克服重大挑战的一次经历吗？' },
      { role: 'B', english: "That's a great question. Let me think... In my last project, our team was falling behind schedule. I organized daily standups and re-prioritized tasks. We ended up launching on time and 10% under budget.", chinese: '这个问题很好。让我想想……在上一个项目中，我们团队进度落后了。我组织了每日站会并重新排定任务优先级。最终我们按时发布，还比预算节省了10%。' },
      { role: 'A', english: "Excellent. Why are you interested in this position?", chinese: '很好。你为什么对这个职位感兴趣？' },
      { role: 'B', english: "I've followed your company for a long time and I'm excited about the opportunity to work on products that reach millions of users. My experience in scaling products aligns well with what you're looking for.", chinese: '我关注贵公司很久了，我很期待能有机会为数百万用户做产品。我在产品规模化方面的经验与你们的需求很契合。' },
      { role: 'A', english: "Great. Do you have any questions for us?", chinese: '好的。你有什么想问我们的吗？' },
      { role: 'B', english: "Yes. What does success look like for this role in the first six months? And could you tell me about the team I'd be working with?", chinese: '有的。这个职位在前6个月怎样算成功？还有能介绍一下我将共事的团队吗？' },
    ],
  },
  shopping: {
    info: {
      id: 'shopping',
      name: '购物逛街',
      nameEn: 'Shopping',
      icon: 'ShoppingBag',
      category: '生活',
      description: '国外商场购物、询问尺码价格、试穿、打折',
      keywords: ['购物', '逛街', '买东西', '衣服', '商场', 'shopping', 'clothes', 'store', 'mall'],
    },
    briefIntroduction: '在国外购物需要掌握询问尺码、颜色、价格、折扣、退换货等常用表达。',
    keyPhrases: [
      { english: "I'm just looking around, thanks.", chinese: '我只是随便看看，谢谢。', context: '店员招呼时礼貌拒绝' },
      { english: "Can I help you find anything?", chinese: '需要帮忙找什么吗？', context: '店员询问' },
      { english: "Do you have this in a smaller size?", chinese: '这个有小一码的吗？', context: '询问尺码' },
      { english: "Does this come in other colors?", chinese: '这个有其他颜色吗？', context: '询问颜色' },
      { english: "Where are the fitting rooms?", chinese: '试衣间在哪里？', context: '找试衣间' },
      { english: "How does this look on me?", chinese: '我穿这个好看吗？', context: '询问意见' },
      { english: "Is this on sale?", chinese: '这个打折吗？', context: '询问促销' },
      { english: "Do you offer a student discount?", chinese: '你们有学生折扣吗？', context: '询问折扣' },
      { english: "I'll take this one.", chinese: '我要这件。', context: '决定购买' },
      { english: "What's your return policy?", chinese: '你们的退换货政策是什么？', context: '退换货' },
    ],
    commonPatterns: [
      {
        pattern: "I'm looking for + [物品].",
        example: "I'm looking for a casual dress for summer.",
        translation: "我在找夏天穿的休闲连衣裙。",
        explanation: "明确表达你想买什么。"
      },
      {
        pattern: "Do you have anything similar but + [不同点]?",
        example: "Do you have anything similar but less expensive?",
        translation: "你们有类似但便宜一点的吗？",
        explanation: "在已有款式基础上提出其他需求。"
      },
      {
        pattern: "It's a bit too + [形容词]. Do you have...?",
        example: "It's a bit too tight. Do you have a size M?",
        translation: "有点太紧了。你们有中号的吗？",
        explanation: "说明不合适并提出具体需求。"
      },
      {
        pattern: "I think I'll pass on this one. Thank you anyway.",
        example: "I think I'll pass on this one. Thank you anyway.",
        translation: "这件我就不买了。还是谢谢你。",
        explanation: "礼貌地拒绝购买，不买也保持礼貌。"
      },
    ],
    tips: [
      { title: '尺码对照', content: '美国女装：XS(0-2)、S(4-6)、M(8-10)、L(12-14)、XL(16-18)；男装：S、M、L、XL对应胸围和腰围。鞋码 US 7 = 欧码 38 = 中国 245。建议网上查好对照表。' },
      { title: '折扣季与砍价', content: '美国：Black Friday（感恩节后）、Cyber Monday、Boxing Day（节后）。大部分商店明码标价不砍价，跳蚤市场、小商铺可以试试 "Is there any discount on this?"、"Do you have a promotion going on?"。' },
      { title: '付款常用表达', content: '"Can I pay by credit card?"、"I\'d like to pay with Apple Pay."、"Could you split this into two payments?"、"Please put this on separate bills."（分开结账）。' },
      { title: '退换货须知', content: "问清楚 return policy：return window（退换期限，常见30天）、receipt required（是否需要小票）、store credit vs refund（是退到礼品卡还是原路退回）。保留好小票！" },
    ],
    sampleDialogue: [
      { role: 'A', english: "Hi there! Can I help you find anything today?", chinese: '你好！需要帮忙找点什么吗？' },
      { role: 'B', english: "Hi! I'm just looking around for now, thanks. But I might need help with sizes later.", chinese: '你好！我先随便看看，谢谢。不过等下可能需要你帮忙看看尺码。' },
      { role: 'A', english: "Sure thing, just let me know. Oh, and just so you know—we're having a 30% off sale on all summer items.", chinese: '好的，随时叫我。对了说一下，所有夏季商品都打7折哦。' },
      { role: 'B', english: "Oh, that's great! Actually, could I try this jacket on? Do you have it in a medium?", chinese: '哦，太好了！对了，我能试一下这件夹克吗？有中号吗？' },
      { role: 'A', english: "Let me check. Yes, here you go. The fitting rooms are right over there, by the wall.", chinese: '我看看。有的，给你。试衣间就在那边，靠墙的位置。' },
      { role: 'B', english: "Thanks. Hmm... it's a bit too big. Do you have anything similar but a size smaller?", chinese: '谢谢。嗯……有点太大了。你们有类似但小一号的吗？' },
      { role: 'A', english: "We have this style in a small. Would you like to try it?", chinese: '这款我们有小号。你想试试吗？' },
      { role: 'B', english: "Perfect! Yes, please. Also, what's your return policy just in case?", chinese: '太好了！麻烦你。另外，想问下你们的退换货政策是怎样的？以防万一。' },
    ],
  },
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business_meeting: ['会议', '开会', '商务', '同事', '团队', 'work', 'meeting', 'conference', 'office', '职场', '汇报'],
  airport_checkin: ['机场', '值机', '登机', '行李', '托运', 'airport', 'checkin', 'flight', 'luggage', '飞机', '航站楼', '登机口'],
  tv_series_slang: ['美剧', '俚语', '口语', '电影', 'tv', 'slang', 'movie', 'drama', '流行语', '追剧', '看剧', '娱乐'],
  restaurant_ordering: ['餐厅', '点餐', '吃饭', '菜单', '订餐', 'restaurant', 'food', 'menu', 'dinner', '吃饭', '点菜', '西餐'],
  job_interview: ['面试', '求职', '工作', '招聘', 'interview', 'job', 'career', 'resume', '找工作', '应聘'],
  shopping: ['购物', '逛街', '买东西', '衣服', '商场', 'shopping', 'clothes', 'store', 'mall', '买衣服', '商店'],
};

const DEFAULT_RESPONSE = {
  briefIntroduction: '这是一个常见的英语交流场景。以下是一些通用的实用表达和句式，帮助你在类似场景下更自信地沟通。',
  keyPhrases: [
    { english: "Excuse me, could you help me?", chinese: '打扰一下，能帮我吗？' },
    { english: "Could you repeat that, please?", chinese: '能重复一下吗？' },
    { english: "I'm sorry, I didn't quite catch that.", chinese: '抱歉，我没太听懂。' },
    { english: "How do you say this in English?", chinese: '这个用英语怎么说？' },
    { english: "Can you write that down for me?", chinese: '能帮我写下来吗？' },
    { english: "Thank you so much for your help.", chinese: '非常感谢你的帮助。' },
    { english: "I appreciate it.", chinese: '非常感谢。' },
    { english: "No problem at all.", chinese: '完全没问题。' },
    { english: "Could you speak a bit slower, please?", chinese: '能说慢一点吗？' },
    { english: "I'm still learning English.", chinese: '我还在学习英语。' },
  ],
  commonPatterns: [
    {
      pattern: "Could you please + [动词原形]?",
      example: "Could you please show me the way?",
      translation: "你能给我指路吗？",
      explanation: "最通用的礼貌请求句型，几乎可以用在任何需要帮助的场合。"
    },
    {
      pattern: "I would like to + [动词].",
      example: "I would like to ask a question.",
      translation: "我想问一个问题。",
      explanation: "比 I want to 更加正式和礼貌的表达。"
    },
    {
      pattern: "Do you know if/whether + [从句]?",
      example: "Do you know if there's a restroom nearby?",
      translation: "你知道附近有没有洗手间吗？",
      explanation: "礼貌地询问信息。"
    },
  ],
  tips: [
    { title: '遇到听不懂时', content: '别紧张，礼貌地请对方重复或放慢语速："Sorry, could you say that again more slowly?"、"Would you mind writing that down for me?" 大多数人都会很乐意帮忙。' },
    { title: '保持简单', content: '不用追求复杂语法和高级词汇。简单清晰的表达 + 手势和微笑，比勉强说复杂句子但出错效果更好。' },
    { title: '善用关键词', content: '即使说不出完整句子，说出关键词也能让对方理解。例如在机场只需要说 "Gate?" + 机票，对方就能明白你在找登机口。' },
    { title: '随身工具', content: '可以提前下载翻译App（如Google翻译），支持离线翻译和语音翻译，在关键时刻非常有用。' },
  ],
  sampleDialogue: [
    { role: 'A', english: "Excuse me, could you help me? I'm a bit lost.", chinese: '打扰一下，能帮我吗？我有点迷路了。' },
    { role: 'B', english: "Of course! Where are you trying to go?", chinese: '当然可以！你想去哪里？' },
    { role: 'A', english: "I'm looking for the subway station. Could you point me in the right direction?", chinese: '我在找地铁站。能告诉我怎么走吗？' },
    { role: 'B', english: "Sure! Go straight for two blocks, then turn left. You'll see it on your right.", chinese: '好的！直走两个街区，然后左转。你就能看到它在右手边。' },
    { role: 'A', english: "Thank you so much! I really appreciate it.", chinese: '非常感谢！太谢谢你了。' },
    { role: 'B', english: "No problem at all! Have a good day.", chinese: '不客气！祝你今天愉快。' },
  ],
};

@Injectable()
export class SceneEnglishService {
  getAllScenes(): SceneInfo[] {
    return Object.values(SCENES_DATA).map(s => s.info);
  }

  searchScenes(keyword: string): SceneInfo[] {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (!lowerKeyword) return this.getAllScenes();

    const scenes = Object.values(SCENES_DATA);
    const scored = scenes.map(scene => {
      let score = 0;
      const { info } = scene;

      if (info.id === lowerKeyword || info.id.includes(lowerKeyword)) score += 100;
      if (info.name.toLowerCase().includes(lowerKeyword)) score += 80;
      if (info.nameEn.toLowerCase().includes(lowerKeyword)) score += 60;
      if (info.description.toLowerCase().includes(lowerKeyword)) score += 40;

      const catKeywords = CATEGORY_KEYWORDS[info.id] || [];
      if (catKeywords.some(k => k.toLowerCase().includes(lowerKeyword))) score += 50;

      if (info.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) score += 50;

      return { info, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.info);
  }

  query(sceneDescription: string): SceneEnglishResponse {
    const trimmed = sceneDescription.trim();
    const lower = trimmed.toLowerCase();

    let matchedSceneId: string | null = null;
    let bestScore = 0;

    for (const [id, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matchedSceneId = id;
      }
    }

    for (const [id, scene] of Object.entries(SCENES_DATA)) {
      if (trimmed === scene.info.name || trimmed === scene.info.id) {
        matchedSceneId = id;
        bestScore = 999;
        break;
      }
    }

    if (matchedSceneId && bestScore > 0) {
      const scene = SCENES_DATA[matchedSceneId];
      return {
        sceneName: scene.info.name,
        sceneNameEn: scene.info.nameEn,
        briefIntroduction: scene.briefIntroduction,
        keyPhrases: scene.keyPhrases,
        commonPatterns: scene.commonPatterns,
        tips: scene.tips,
        sampleDialogue: scene.sampleDialogue,
      };
    }

    return {
      sceneName: '通用英语交流',
      sceneNameEn: 'General English Communication',
      briefIntroduction: DEFAULT_RESPONSE.briefIntroduction,
      keyPhrases: DEFAULT_RESPONSE.keyPhrases,
      commonPatterns: DEFAULT_RESPONSE.commonPatterns,
      tips: DEFAULT_RESPONSE.tips,
      sampleDialogue: DEFAULT_RESPONSE.sampleDialogue,
    };
  }

  getSceneById(id: string): SceneEnglishResponse | null {
    const scene = SCENES_DATA[id];
    if (!scene) return null;
    return {
      sceneName: scene.info.name,
      sceneNameEn: scene.info.nameEn,
      briefIntroduction: scene.briefIntroduction,
      keyPhrases: scene.keyPhrases,
      commonPatterns: scene.commonPatterns,
      tips: scene.tips,
      sampleDialogue: scene.sampleDialogue,
    };
  }
}
