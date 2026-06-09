import { Injectable } from '@nestjs/common';

export interface ScenePhrase {
  english: string;
  chinese: string;
  context?: string;
  whenToUse?: string;
  speaker?: string;
}

export interface ScenePhraseGroup {
  stage: string;
  stageEn: string;
  description: string;
  phrases: ScenePhrase[];
}

export interface ScenePattern {
  pattern: string;
  example: string;
  translation: string;
  explanation: string;
  whenToUse?: string;
}

export interface SceneTip {
  title: string;
  content: string;
}

export interface SceneCandidate {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
}

export interface SceneEnglishResponse {
  sceneName: string;
  sceneNameEn: string;
  briefIntroduction: string;
  matchedScore: number;
  isAmbiguous: boolean;
  candidateScenes?: SceneCandidate[];
  clarificationHint?: string;
  keyPhrases: ScenePhrase[];
  keyPhrasesGrouped?: ScenePhraseGroup[];
  commonPatterns: ScenePattern[];
  tips: SceneTip[];
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string; context?: string }[];
}

export interface SceneInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: string;
  description: string;
  keywords: string[];
  stages?: { stage: string; stageEn: string }[];
}

interface SceneData {
  info: SceneInfo;
  briefIntroduction: string;
  keyPhrases: ScenePhrase[];
  keyPhrasesGrouped: ScenePhraseGroup[];
  commonPatterns: ScenePattern[];
  tips: SceneTip[];
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string; context?: string }[];
}

const SCENES_DATA: Record<string, SceneData> = {
  business_meeting: {
    info: {
      id: 'business_meeting',
      name: '和外国同事开会',
      nameEn: 'Business Meeting with Foreign Colleagues',
      icon: 'Briefcase',
      category: '职场',
      description: '国际商务会议、跨国团队会议沟通',
      keywords: ['会议', '开会', '商务', '同事', '团队', 'work', 'meeting', 'conference', 'office', '职场', '汇报', '例会', '老板', 'manager', 'boss', '团队会议'],
      stages: [
        { stage: '开场破冰', stageEn: 'Opening & Icebreaker' },
        { stage: '介绍议题', stageEn: 'Introducing Topics' },
        { stage: '发表观点', stageEn: 'Expressing Opinions' },
        { stage: '提问与澄清', stageEn: 'Asking & Clarifying' },
        { stage: '表达不同意见', stageEn: 'Disagreeing Politely' },
        { stage: '应对临时加任务', stageEn: 'Handling Last-minute Tasks' },
        { stage: '推进与收尾', stageEn: 'Moving Forward & Closing' },
      ],
    },
    briefIntroduction: '国际商务会议流程化强，需要掌握从开场、讨论、决策到收尾的全环节表达。下方按会议流程阶段分组，找到你当前所处环节即可直接套用。',
    keyPhrasesGrouped: [
      {
        stage: '开场破冰',
        stageEn: 'Opening & Icebreaker',
        description: '会议刚开始，大家陆续就座时使用',
        phrases: [
          { english: "Good morning everyone, thanks for making the time.", chinese: '大家早上好，感谢抽时间参会。', whenToUse: '主持人开场第一句话', speaker: '主持人' },
          { english: "Let's get the meeting started.", chinese: '我们开始开会吧。', whenToUse: '参会人到齐，准备正式开始', speaker: '主持人' },
          { english: "How was everyone's weekend?", chinese: '大家周末过得怎么样？', whenToUse: '正式开始前的寒暄，拉近距离', speaker: '任何人' },
          { english: "Let's do a quick round of introductions.", chinese: '我们快速做个自我介绍吧。', whenToUse: '有新成员或跨部门参会时', speaker: '主持人' },
        ],
      },
      {
        stage: '介绍议题',
        stageEn: 'Introducing Topics',
        description: '引入要讨论的议题时使用',
        phrases: [
          { english: "First on the agenda is...", chinese: '议程第一项是...', whenToUse: '按议程依次介绍议题', speaker: '主持人' },
          { english: "Today we're here to discuss...", chinese: '今天我们来讨论...', whenToUse: '点明本次会议的核心目的', speaker: '主持人' },
          { english: "The main point I want to cover is...", chinese: '我想讲的重点是...', whenToUse: '轮到你发言，引出话题', speaker: '汇报人' },
          { english: "Let me walk you through the numbers.", chinese: '我来给大家过一下数据。', whenToUse: '展示数据或PPT时', speaker: '汇报人' },
        ],
      },
      {
        stage: '发表观点',
        stageEn: 'Expressing Opinions',
        description: '表达自己对议题的看法时使用',
        phrases: [
          { english: "I'd like to share my thoughts on this.", chinese: '我想分享一下我对此的看法。', whenToUse: '轮到自己发言，礼貌开场', speaker: '任何人' },
          { english: "From my perspective, + [观点]", chinese: '在我看来，+ [观点]', whenToUse: '正式表达观点，比 I think 更专业', speaker: '任何人' },
          { english: "Based on my experience...", chinese: '根据我的经验...', whenToUse: '用过往经历支撑自己的观点', speaker: '任何人' },
          { english: "I completely agree with that.", chinese: '我完全同意。', whenToUse: '明确表示赞同一方观点', speaker: '任何人' },
        ],
      },
      {
        stage: '提问与澄清',
        stageEn: 'Asking & Clarifying',
        description: '没听懂或想深入了解时使用',
        phrases: [
          { english: "Could you elaborate on that?", chinese: '你能详细说明一下吗？', whenToUse: '对方提到一个点，你想了解更多细节', speaker: '任何人' },
          { english: "I'm afraid I don't quite follow. Could you + [请求]?", chinese: '恐怕我没太听懂，你能...吗？', whenToUse: '没听懂，但不想显得失礼', speaker: '任何人' },
          { english: "Let me make sure I understand correctly—", chinese: '让我确认一下我的理解对不对——', whenToUse: '用自己的话复述，确认理解一致', speaker: '任何人' },
          { english: "Quick question—", chinese: '快速问一个问题——', whenToUse: '临时插一个简短问题', speaker: '任何人' },
        ],
      },
      {
        stage: '表达不同意见',
        stageEn: 'Disagreeing Politely',
        description: '委婉反对他人观点时使用',
        phrases: [
          { english: "I see your point, but...", chinese: '我理解你的观点，但是...', whenToUse: '先认可再提出不同意见，最常用句式', speaker: '任何人' },
          { english: "Have we considered...?", chinese: '我们有没有考虑过...？', whenToUse: '用提问的方式提出不同角度', speaker: '任何人' },
          { english: "I'm not sure I entirely agree with that.", chinese: '我不太确定完全同意这个说法。', whenToUse: '比较强硬但依然礼貌的反对', speaker: '任何人' },
          { english: "Another angle to think about is...", chinese: '另一个值得思考的角度是...', whenToUse: '不直接否定，而是提供新视角', speaker: '任何人' },
        ],
      },
      {
        stage: '应对临时加任务',
        stageEn: 'Handling Last-minute Tasks',
        description: '会议中老板或经理突然给你追加新任务时的回应',
        phrases: [
          { english: "Absolutely, I can take that on.", chinese: '没问题，我可以负责。', whenToUse: '任务不重、能接下时，干脆利落的正面回应', speaker: '你（下属）' },
          { english: "Happy to help. Let me just confirm the priority relative to my current work.", chinese: '没问题我来处理。不过先和您确认一下，这个和我手上的工作优先级怎么排？', whenToUse: '接受任务但要先理清优先级（避免被不断加活）', speaker: '你（下属）' },
          { english: "I'd be glad to help with this. Given my current workload, would it be possible to reprioritize X?", chinese: '我很乐意帮忙。不过考虑到我目前的工作量，能不能把 X 任务的优先级往后调？', whenToUse: '接受的同时委婉提出：需要调整现有任务优先级', speaker: '你（下属）' },
          { english: "I want to make sure I can deliver this well. Can we discuss the timeline?", chinese: '我想确保能把这件事做好。我们能聊一下时间要求吗？', whenToUse: '不急着答应，先确认 deadline 是否合理', speaker: '你（下属）' },
          { english: "I'm currently at capacity with [任务A] and [任务B]. Could we discuss how to best accommodate this?", chinese: '我目前手上[任务A]和[任务B]已经排满了。我们商量下怎么安排这个新任务好吗？', whenToUse: '实在接不下时，诚实说明并寻求解决方案（不是直接拒绝）', speaker: '你（下属）' },
          { english: "Let me check my current priorities and get back to you in 10 minutes.", chinese: '让我先理一下手上的优先级，10 分钟后给您回复。', whenToUse: '不想当场答应/拒绝，争取思考时间', speaker: '你（下属）' },
          { english: "Sure, I can handle this. When do you need this by?", chinese: '好的我来处理。需要什么时候完成？', whenToUse: '先答应，再确认具体时间要求', speaker: '你（下属）' },
        ],
      },
      {
        stage: '推进与收尾',
        stageEn: 'Moving Forward & Closing',
        description: '推进议程、总结和分配任务时使用',
        phrases: [
          { english: "Let's move on to the next item.", chinese: '我们进入下一项议题吧。', whenToUse: '当前议题讨论得差不多了', speaker: '主持人' },
          { english: "Can we circle back to this later?", chinese: '我们稍后再回到这个问题上好吗？', whenToUse: '当前议题陷入僵局，先搁置', speaker: '主持人/任何人' },
          { english: "Let's wrap this up.", chinese: '我们来总结一下吧。', whenToUse: '准备结束会议', speaker: '主持人' },
          { english: "So to sum up, we've agreed that + [总结].", chinese: '总结一下，我们已经同意 + [总结]', whenToUse: '会议最后确认共识', speaker: '主持人' },
          { english: "Action items will be sent out after the meeting.", chinese: '行动项将在会后发送。', whenToUse: '收尾时通知任务分配', speaker: '主持人' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "From my perspective, + [观点]",
        example: "From my perspective, we should prioritize the Q3 launch.",
        translation: "在我看来，我们应该优先考虑第三季度的发布。",
        explanation: "正式发表个人观点的常用句型，比 I think 更加专业。",
        whenToUse: "需要正式表达观点的任何场合",
      },
      {
        pattern: "I'm afraid I don't quite follow. Could you + [请求]?",
        example: "I'm afraid I don't quite follow. Could you explain the data again?",
        translation: "恐怕我没太听懂，你能再解释一下这些数据吗？",
        explanation: "礼貌地表示没听懂并请求重复，避免直接说 I don't understand。",
        whenToUse: "没听懂对方说的内容时",
      },
      {
        pattern: "Let's aim to + [目标] by + [时间].",
        example: "Let's aim to finalize the proposal by next Friday.",
        translation: "我们争取在下周五前敲定提案。",
        explanation: "设定明确目标和截止时间的常用表达。",
        whenToUse: "给团队分配任务并设定期限时",
      },
      {
        pattern: "To sum up, we've agreed that + [总结].",
        example: "To sum up, we've agreed that the marketing budget will increase by 10%.",
        translation: "总结一下，我们已同意营销预算增加10%。",
        explanation: "会议总结时确认共识的标准句型。",
        whenToUse: "议题讨论完毕或会议结束前做总结",
      },
    ],
    tips: [
      { title: '礼貌表达不同意见', content: '避免直接说 "You\'re wrong" 或 "I disagree"，使用 "I see your point, however..."、"Have we considered..."、"Another angle to think about is..." 等委婉表达。' },
      { title: '会议中的插话技巧', content: '想插话时可以说 "Sorry to interrupt, but..."、"Could I just add something here?"、"Quick question..."，而不是直接打断对方。' },
      { title: '确认共识很重要', content: '讨论完每个议题后，用 "So we all agree that..."、"Let me confirm—are we on the same page?" 来确认大家理解一致，避免后续误解。' },
      { title: '使用商务缩略语', content: '常见缩略语：ASAP (尽快)、ETA (预计到达时间)、FYI (供你参考)、Action Item (待办事项)、RSVP (请回复)、KPI (关键绩效指标)。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning everyone, thanks for joining. Let's get the meeting started.", chinese: '大家早上好，感谢参加。我们开始开会吧。', context: '【开场】主持人宣布会议开始' },
      { role: 'B', english: "First on the agenda is the Q3 product launch. Sarah, could you walk us through the timeline?", chinese: '议程第一项是第三季度产品发布。Sarah，你能给我们介绍一下时间线吗？', context: '【介绍议题】主持人引入话题' },
      { role: 'A', english: "Sure. From my perspective, we should aim to launch by mid-September.", chinese: '好的。在我看来，我们应该争取在9月中旬发布。', context: '【发表观点】汇报人提出建议' },
      { role: 'B', english: "I see your point, but the engineering team needs more time for testing.", chinese: '我理解你的观点，但工程团队需要更多测试时间。', context: '【表达不同意见】委婉反对' },
      { role: 'A', english: "That's a fair point. Could we circle back to this after the engineering update?", chinese: '有道理。我们能否在工程团队更新后再回到这个议题？', context: '【推进议程】提议搁置争议' },
      { role: 'B', english: "Absolutely. Let's move on to the next item—marketing budget.", chinese: '当然可以。我们进入下一项——营销预算。', context: '【推进议程】同意进入下一议题' },
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
      keywords: ['机场', '值机', '登机', '行李', '托运', 'airport', 'checkin', 'flight', 'luggage', '飞机', '航站楼', '登机口', '安检', '海关', '出境'],
      stages: [
        { stage: '办理值机', stageEn: 'At the Check-in Counter' },
        { stage: '行李托运', stageEn: 'Checking Baggage' },
        { stage: '选择座位', stageEn: 'Choosing Seats' },
        { stage: '转机相关', stageEn: 'Connecting Flights' },
        { stage: '登机口信息', stageEn: 'Gate & Boarding Info' },
      ],
    },
    briefIntroduction: '机场值机流程固定，从柜台沟通到行李托运、座位选择，下方按实际流程分组，找到你正在办理的环节直接套用。',
    keyPhrasesGrouped: [
      {
        stage: '办理值机',
        stageEn: 'At the Check-in Counter',
        description: '刚到值机柜台与工作人员对话时',
        phrases: [
          { english: "I'd like to check in, please.", chinese: '我想办理值机。', whenToUse: '柜台工作人员目光投向你时的第一句', speaker: '乘客' },
          { english: "Here's my passport and booking confirmation.", chinese: '这是我的护照和预订确认单。', whenToUse: '工作人员要证件时递过去时说', speaker: '乘客' },
          { english: "I'm flying to [目的地] today.", chinese: '我今天飞[目的地]。', whenToUse: '工作人员询问目的地时', speaker: '乘客' },
          { english: "I have an e-ticket under the name [姓名].", chinese: '我有一张电子票，名字是[姓名]。', whenToUse: '没打纸质票时', speaker: '乘客' },
        ],
      },
      {
        stage: '行李托运',
        stageEn: 'Checking Baggage',
        description: '关于行李托运的对话',
        phrases: [
          { english: "I have two bags to check in.", chinese: '我有两件行李要托运。', whenToUse: '告知托运行李数量', speaker: '乘客' },
          { english: "Is this bag within the weight limit?", chinese: '这个行李在重量限制内吗？', whenToUse: '担心超重时提前问', speaker: '乘客' },
          { english: "Does my carry-on meet the size requirement?", chinese: '我的随身行李符合尺寸要求吗？', whenToUse: '不确定行李箱能否带上飞机时', speaker: '乘客' },
          { english: "How much is the excess baggage fee?", chinese: '超重行李费多少钱？', whenToUse: '确实超重了，询问费用', speaker: '乘客' },
          { english: "I have a laptop/valuables in my carry-on.", chinese: '我随身行李里有电脑/贵重物品。', whenToUse: '安检时主动说明', speaker: '乘客' },
        ],
      },
      {
        stage: '选择座位',
        stageEn: 'Choosing Seats',
        description: '选座位时使用',
        phrases: [
          { english: "Can I have a window seat, please?", chinese: '请给我一个靠窗的座位好吗？', whenToUse: '明确表达座位偏好', speaker: '乘客' },
          { english: "I'd prefer an aisle seat.", chinese: '我想要靠过道的座位。', whenToUse: '想要靠过道（方便起身）', speaker: '乘客' },
          { english: "Are there any exit row seats available?", chinese: '有没有紧急出口的座位？', whenToUse: '想要腿部空间大的座位（需能协助撤离）', speaker: '乘客' },
          { english: "Could we have seats together, please?", chinese: '可以给我们挨在一起的座位吗？', whenToUse: '多人一起出行时', speaker: '乘客' },
        ],
      },
      {
        stage: '转机相关',
        stageEn: 'Connecting Flights',
        description: '有中转航班时特别重要',
        phrases: [
          { english: "I'm connecting to [航班号/目的地]. Is my luggage checked through?", chinese: '我要转机去[目的地]，我的行李是直挂的吗？', whenToUse: '值机时必须确认的关键问题', speaker: '乘客' },
          { english: "Do I need to collect my luggage and re-check it?", chinese: '我需要提取行李并重新托运吗？', whenToUse: '确认转机是否需要重新托运行李', speaker: '乘客' },
          { english: "Do I need to go through immigration and customs here?", chinese: '我需要在这里过入境和海关吗？', whenToUse: '国际转国际时确认是否要过境', speaker: '乘客' },
          { english: "Where is the transfer desk?", chinese: '转机柜台在哪里？', whenToUse: '需要在中转机场办理手续时', speaker: '乘客' },
          { english: "How long is my connection time?", chinese: '我的转机时间有多久？', whenToUse: '确认转机时间是否充裕', speaker: '乘客' },
        ],
      },
      {
        stage: '登机口信息',
        stageEn: 'Gate & Boarding Info',
        description: '询问登机相关信息',
        phrases: [
          { english: "What's my boarding gate?", chinese: '我的登机口是哪个？', whenToUse: '值机最后确认登机口', speaker: '乘客' },
          { english: "What time is boarding?", chinese: '什么时候开始登机？', whenToUse: '确认登机时间', speaker: '乘客' },
          { english: "Is my flight on time?", chinese: '我的航班准点吗？', whenToUse: '担心延误时', speaker: '乘客' },
          { english: "Could you please tell me where Gate [号] is?", chinese: '你能告诉我[号]登机口在哪里吗？', whenToUse: '进安检后找不到登机口时问工作人员', speaker: '乘客' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "Could you please tell me where + [地点] is?",
        example: "Could you please tell me where Gate B12 is?",
        translation: "你能告诉我B12登机口在哪里吗？",
        explanation: "礼貌地询问地点信息。",
        whenToUse: "在机场找不到任何地点时都能用",
      },
      {
        pattern: "I'm connecting to + [航班号/目的地]. Is my luggage checked through?",
        example: "I'm connecting to Flight DL123 to New York. Is my luggage checked through?",
        translation: "我要转机搭乘DL123航班去纽约，我的行李是直挂的吗？",
        explanation: "转机旅客确认行李是否直挂目的地。",
        whenToUse: "转机时值机必须问的问题",
      },
      {
        pattern: "Do I need to + [动作]?",
        example: "Do I need to collect my luggage and re-check it?",
        translation: "我需要提取行李并重新托运吗？",
        explanation: "确认是否需要做某事。",
        whenToUse: "不确定流程时用于确认",
      },
      {
        pattern: "Here's my + [物品].",
        example: "Here's my ID and e-ticket reference.",
        translation: "这是我的身份证和电子票号。",
        explanation: "向工作人员出示证件或票据的简洁表达。",
        whenToUse: "递上任何证件、票据时",
      },
    ],
    tips: [
      { title: '行李超重的应对', content: '如果行李超重，工作人员可能会说 "Your bag is over the weight limit"，你可以选择付费托运 ("How much is the excess baggage fee?") 或者取出部分物品到随身行李中。' },
      { title: '特殊座位的申请', content: '想要更多腿部空间可以问 "Are there any bulkhead seats available?"（隔板前排座位）或 "exit row seats"（紧急出口排），但后者需要能协助紧急撤离。' },
      { title: '转机时的关键问句', content: '转机务必问："Do I need to go through immigration and customs here?"、"Is my boarding pass still valid for the next flight?"、"Where is the transfer desk?"。' },
      { title: '值机相关词汇', content: 'carry-on baggage (随身行李)、checked baggage (托运行李)、baggage tag (行李牌)、boarding pass (登机牌)、jet bridge (廊桥)、tarmac (停机坪)。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning! I'd like to check in, please.", chinese: '早上好！我想办理值机。', context: '【办理值机】乘客开场' },
      { role: 'B', english: "Good morning! May I see your passport and ticket, please?", chinese: '早上好！请出示您的护照和机票好吗？', context: '【办理值机】工作人员要证件' },
      { role: 'A', english: "Certainly. Here's my passport. I have one suitcase to check in and a carry-on.", chinese: '当然可以。这是我的护照。我有一件行李箱要托运，还有一件随身行李。', context: '【行李托运】说明行李情况' },
      { role: 'B', english: "Where are you flying to today?", chinese: '您今天要飞往哪里？', context: '【办理值机】确认目的地' },
      { role: 'A', english: "I'm flying to San Francisco, with a connection in Tokyo.", chinese: '我飞往旧金山，在东京转机。', context: '【转机相关】说明转机' },
      { role: 'B', english: "Would you prefer a window or aisle seat?", chinese: '您想要靠窗还是靠过道的座位？', context: '【选择座位】询问偏好' },
      { role: 'A', english: "A window seat, please. And could you tell me if my luggage is checked through to my final destination?", chinese: '请给我靠窗座位。你能告诉我我的行李是直挂到最终目的地吗？', context: '【转机相关】确认行李直挂' },
      { role: 'B', english: "Yes, your bags will be checked straight through. Your gate is C18, boarding starts at 10:45.", chinese: '是的，您的行李将直挂。您的登机口是C18，10:45开始登机。', context: '【登机口信息】告知登机信息' },
    ],
  },
  office_daily: {
    info: {
      id: 'office_daily',
      name: '职场日常沟通',
      nameEn: 'Office Daily Communication',
      icon: 'ChatSquare',
      category: '职场',
      description: '被临时加任务、请假、提加薪、汇报进度、1对1沟通等高频职场时刻',
      keywords: [
        '老板', '临时', '任务', '加班', '请假', '加薪', '汇报', '进度', '1对1', '提薪',
        'boss', 'manager', 'task', 'overtime', 'extra work', 'last minute', 'leave', 'vacation',
        'raise', 'promotion', 'salary', 'PTO', 'day off', 'sick', 'one on one', '1:1',
        '额外', '加活', '被安排', '突然', '临时加', '请假条', '年假', '涨工资', '调岗',
      ],
      stages: [
        { stage: '被老板临时加任务', stageEn: 'Getting a Last-minute Task' },
        { stage: '委婉拒绝不合理需求', stageEn: 'Saying No Politely' },
        { stage: '请求请假/休假', stageEn: 'Requesting Time Off' },
        { stage: '汇报工作进度', stageEn: 'Reporting Progress' },
        { stage: '提出加薪/升职', stageEn: 'Asking for a Raise or Promotion' },
        { stage: '1对1与上级沟通', stageEn: '1:1 with Manager' },
      ],
    },
    briefIntroduction: '职场中最让人紧张的往往不是正式会议，而是那些猝不及防的时刻——老板突然走过来丢个新任务、该提加薪了张不开口、想请假又怕留下不好印象…下面按「具体时刻」分组，找到你正在应对的场景直接套用。',
    keyPhrasesGrouped: [
      {
        stage: '被老板临时加任务',
        stageEn: 'Getting a Last-minute Task',
        description: '老板或经理突然走过来/发消息，给你加一个之前没提过的任务。此时关键是：别急着答应也别急着拒绝，先确认优先级和时间要求。',
        phrases: [
          { english: "Absolutely, I can take that on.", chinese: '没问题，我来负责。', whenToUse: '任务不重，确实能接下时，干脆正面回应', speaker: '你（下属）' },
          { english: "Happy to help. Just to make sure I'm prioritizing correctly—should this come before X, or after?", chinese: '没问题我来处理。先确认下优先级——这件事比 X 任务先做还是后做？', whenToUse: '最推荐的句式：先表明愿意帮忙，然后要求确认优先级（避免以后被不断加活）', speaker: '你（下属）' },
          { english: "I'd be glad to help. Given my current workload, could we adjust the deadline for X to make room for this?", chinese: '我很乐意帮忙。不过考虑到目前的工作量，能不能把 X 任务的截止日期往后调？', whenToUse: '接受任务的同时，要求调整其他任务的时间，保护自己', speaker: '你（下属）' },
          { english: "I want to make sure I do this right. What's the timeline and expected outcome?", chinese: '我想确保把这件事做好。请问时间要求和预期产出是怎样的？', whenToUse: '不急着答应，先问清楚任务的具体要求和 deadline，看是否合理', speaker: '你（下属）' },
          { english: "I'm currently fully committed to [任务A] which is due Friday, and [任务B] for next week. What would you suggest I deprioritize to fit this in?", chinese: '我目前手上[周五要交的A任务]和[下周的B任务]已经排满了。您看我应该先把哪一件延后？', whenToUse: '确实手头太紧时，用「列出正在做的事 + 让老板拍板优先级」的方式（不是直接拒绝，是寻求解决方案）', speaker: '你（下属）' },
          { english: "Let me take a quick look at my current priorities and get back to you in 10 minutes.", chinese: '让我先理一下手上的优先级，10 分钟后给您回复。', whenToUse: '不想当场被迫答应/拒绝，给自己争取思考时间', speaker: '你（下属）' },
          { english: "Sure, I can handle this. Just to confirm—you need this by when exactly?", chinese: '好的我来处理。确认一下——具体需要什么时候完成？', whenToUse: '先答应，再确认具体 deadline（避免模糊的"尽快"）', speaker: '你（下属）' },
        ],
      },
      {
        stage: '委婉拒绝不合理需求',
        stageEn: 'Saying No Politely',
        description: '任务确实超出能力或负荷，需要礼貌拒绝的场合',
        phrases: [
          { english: "I appreciate you thinking of me for this. Unfortunately, I'm at full capacity right now.", chinese: '谢谢您想到我。不过我目前确实排满了。', whenToUse: '先表示感谢+婉拒', speaker: '你（下属）' },
          { english: "I want to make sure everything I deliver is high quality, so I'd rather not take on something I can't give proper attention to.", chinese: '我希望交付的每件事都是高质量的，所以不想接一件我没法好好投入的事。', whenToUse: '用「对质量负责」作为拒绝理由，非常得体', speaker: '你（下属）' },
          { english: "Would it be possible to revisit this request next week when [当前任务] is wrapped up?", chinese: '能不能等下周[当前任务]做完后我们再重新看这件事？', whenToUse: '不是永久拒绝，而是延迟', speaker: '你（下属）' },
          { english: "I'm not the best person for this because [原因]. Have you considered [推荐的人]?", chinese: '我不是做这件事最合适的人选，因为[原因]。您有没有考虑过[推荐的人]？', whenToUse: '拒绝的同时给出替代方案', speaker: '你（下属）' },
        ],
      },
      {
        stage: '请求请假/休假',
        stageEn: 'Requesting Time Off',
        description: '向上级请年假、病假、事假时的沟通',
        phrases: [
          { english: "I'd like to request [天数] days of PTO from [开始日期] to [结束日期].", chinese: '我想申请[天数]天年假，时间是[开始日期]到[结束日期]。', whenToUse: '正式申请请假的标准开头', speaker: '你（下属）' },
          { english: "I've already coordinated with [同事] to cover my work while I'm away.", chinese: '我已经和[同事]协调好了，我不在的时候他/她会帮我处理工作。', whenToUse: '说明你已经做好交接安排，让老板放心', speaker: '你（下属）' },
          { english: "I'll be reachable for urgent matters, but I'll try to fully disconnect.", chinese: '紧急的事可以联系到我，但我会尽量完全离线。', whenToUse: '说明自己的紧急响应安排', speaker: '你（下属）' },
          { english: "I'm not feeling well today, so I'll be working from home / taking a sick day.", chinese: '我今天不太舒服，所以在家办公/请一天病假。', whenToUse: '请病假', speaker: '你（下属）' },
        ],
      },
      {
        stage: '汇报工作进度',
        stageEn: 'Reporting Progress',
        description: '向老板汇报当前在做什么、进展如何',
        phrases: [
          { english: "A quick update on [项目名称]: we're on track for the Friday deadline.", chinese: '[项目名称]的最新进展：我们周五的 deadline 没有问题。', whenToUse: '简洁正面的进度汇报', speaker: '你（下属）' },
          { english: "We're making good progress, but we've hit a minor blocker with [问题].", chinese: '整体进展不错，不过我们在[问题]上遇到了一点小阻碍。', whenToUse: '汇报好消息的同时提前告知风险', speaker: '你（下属）' },
          { english: "Here's where we stand: [已完成的], and we're currently working on [进行中的].", chinese: '目前的情况是：[已完成的]，现在正在推进[进行中的]。', whenToUse: '结构化的进度汇报', speaker: '你（下属）' },
          { english: "I need your input on [某个决策点] before we can move forward.", chinese: '在推进之前，我需要您在[某个决策点]上给一些意见。', whenToUse: '遇到需要老板拍板的事时', speaker: '你（下属）' },
        ],
      },
      {
        stage: '提出加薪/升职',
        stageEn: 'Asking for a Raise or Promotion',
        description: '鼓起勇气和老板谈薪资或职位的时刻',
        phrases: [
          { english: "I'd like to schedule some time to discuss my career development and compensation.", chinese: '我想约个时间和您聊聊我的职业发展和薪资。', whenToUse: '发消息约 1:1 谈加薪/升职的开场，不要直接在消息里说具体数字', speaker: '你（下属）' },
          { english: "Over the past [时间段], I've [具体成就1] and [具体成就2]. I'd like to discuss how this aligns with my compensation.", chinese: '过去[时间段]，我完成了[具体成就1]和[具体成就2]。我想聊聊这些成绩和我的薪资是否匹配。', whenToUse: '正式谈话时，用「具体成就」铺垫，而不是说「我觉得我该涨了」', speaker: '你（下属）' },
          { english: "Based on the responsibilities I've taken on and the market rate, I was hoping we could discuss a salary adjustment to [数字] / in the range of [区间].", chinese: '基于我承担的职责和市场行情，我希望我们能讨论把薪资调到[数字] / [区间]。', whenToUse: '给出自己的期望数字或区间（要提前做市场调研）', speaker: '你（下属）' },
          { english: "I'd like to understand what I need to do to reach the next level in the next [时间段].", chinese: '我想了解一下，未来[时间段]我需要做到什么才能到下一个级别。', whenToUse: '如果当下没谈成，退而求其次：问清楚晋升路径', speaker: '你（下属）' },
        ],
      },
      {
        stage: '1对1与上级沟通',
        stageEn: '1:1 with Manager',
        description: '和老板定期 1:1 会议时的常用表达',
        phrases: [
          { english: "I wanted to get your thoughts on [某个问题/项目].", chinese: '我想听听您对[某个问题/项目]的看法。', whenToUse: '1:1 开场说要聊什么', speaker: '你（下属）' },
          { english: "What's your top priority right now? I want to make sure I'm aligned.", chinese: '您当前最关注的事情是什么？我想确保自己的方向和您一致。', whenToUse: '了解老板的优先级，非常加分的问题', speaker: '你（下属）' },
          { english: "Is there anything I should be doing differently?", chinese: '有没有什么地方我应该换个方式做？', whenToUse: '主动寻求反馈', speaker: '你（下属）' },
          { english: "I'm considering [某个计划], and I'd value your perspective.", chinese: '我在考虑[某个计划]，想听听您的意见。', whenToUse: '有想法但不确定，提前让老板知道', speaker: '你（下属）' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "Happy to help. Just to confirm—[确认的内容]?",
        example: "Happy to help. Just to confirm—should this come before the client report, or after?",
        translation: "没问题我来处理。确认一下——这件事比客户报告先做还是后做？",
        explanation: "接任务时的黄金句式：先表明态度积极，再礼貌地确认优先级或其他细节。",
        whenToUse: "老板临时加任务、同事找你帮忙，任何你想接受但需要先搞清楚条件的场合",
      },
      {
        pattern: "I'm currently fully committed to [当前任务]. What would you suggest I deprioritize?",
        example: "I'm currently fully committed to the product launch due Friday. What would you suggest I deprioritize?",
        translation: "我目前周五要交的产品发布项目已经排满了。您看我应该先把哪件事延后？",
        explanation: "不直接说「我太忙了做不了」，而是让对方帮你做优先级判断，既不拒绝也不硬扛。",
        whenToUse: "手头任务确实饱和，接不了更多活时",
      },
      {
        pattern: "Over the past [时间段], I've [具体成就]. I'd like to discuss how this aligns with [薪资/职位].",
        example: "Over the past year, I've led the X project which drove a 20% increase in retention, and I've been mentoring two junior team members.",
        translation: "过去一年，我主导了 X 项目，用户留存提升了 20%，同时也在带两位初级同事。",
        explanation: "谈加薪升职要用具体事实和数据铺垫，不要说「我觉得我该涨了」，而是让成绩替你说话。",
        whenToUse: "正式和老板谈加薪/升职时",
      },
      {
        pattern: "I'd like to request [天数] days of PTO from [开始日期] to [结束日期]. I've already coordinated with [同事] to cover my work.",
        example: "I'd like to request 5 days of PTO from June 10th to June 14th. I've already coordinated with Sarah to cover my client meetings.",
        translation: "我想申请 6 月 10 日到 14 日共 5 天年假。我已经和 Sarah 协调好帮我处理客户会议。",
        explanation: "请假时最重要的是让老板安心：你已经安排好了交接。",
        whenToUse: "正式申请休假时",
      },
    ],
    tips: [
      { title: '被临时加任务时别急着答应', content: '第一反应不要立刻说 "Yes"，先问清楚 deadline 和预期产出，再说 "Happy to help"。把「先答应再想办法」改成「先确认再接受」。' },
      { title: '拒绝不等于说 No', content: '不要直接说 "I can\'t do that"，而是：① 先表示感谢/理解 ② 说明当前负荷 ③ 提供替代方案（延迟/推荐其他人/减少范围）。' },
      { title: '谈加薪用数据说话', content: '不要说 "I need a raise" 或 "I\'ve been here long enough"，要说 "Over the past X months, I delivered [具体成就1], [具体成就2]..." 用事实和成果铺垫。' },
      { title: '请假提前安排交接', content: '请假不是请求批准，而是告知+展示安排：你和谁交接了、紧急事怎么联系、哪些事等你回来处理。老板只关心「你不在了谁来做」。' },
    ],
    sampleDialogue: [
      { role: 'B', english: "Hey, do you have a minute? I need someone to take a look at the client presentation before tomorrow morning.", chinese: '嘿，有空吗？明天早上之前我需要有人帮我过一下这个客户的演示稿。', context: '【被临时加任务】老板突然走过来丢活' },
      { role: 'A', english: "Happy to help. Just to confirm—this takes priority over the quarterly report I was working on today?", chinese: '没问题我来处理。先确认下——这件事比我今天在做的季度报告优先级高吗？', context: '【被临时加任务】先接再确认优先级（推荐做法）' },
      { role: 'B', english: "Yes, the client call is at 9am, so this is more urgent.", chinese: '对，客户会议是明早9点，这件事更急。', context: '【被临时加任务】老板确认优先级' },
      { role: 'A', english: "Got it. I'll switch to this now, and move the quarterly report to this afternoon.", chinese: '明白。我现在先做这个，季度报告挪到今天下午。', context: '【被临时加任务】确认并同步调整安排' },
      { role: 'B', english: "Perfect, thanks so much for being flexible.", chinese: '太好了，谢谢你灵活调整。', context: '【被临时加任务】对话结束' },
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
      keywords: ['美剧', '俚语', '口语', '电影', 'tv', 'slang', 'movie', 'drama', '流行语', '追剧', '看剧', '娱乐', 'native speaker', '地道'],
      stages: [
        { stage: '日常打招呼', stageEn: 'Everyday Greetings' },
        { stage: '表达情绪态度', stageEn: 'Expressing Emotions & Attitudes' },
        { stage: '年轻人流行语', stageEn: 'Youth / Gen Z Slang' },
        { stage: '社交互动', stageEn: 'Social Interactions' },
      ],
    },
    briefIntroduction: '美剧中的俚语按使用场景分类，下方标注了每个词的情绪色彩和使用对象，避免在正式场合说错。',
    keyPhrasesGrouped: [
      {
        stage: '日常打招呼',
        stageEn: 'Everyday Greetings',
        description: '朋友、熟人之间日常见面',
        phrases: [
          { english: "What's up?", chinese: '怎么样？/ 最近好吗？', whenToUse: '非常随意的打招呼，用于朋友、同辈之间，正式场合绝对不用', speaker: '年轻人/朋友之间' },
          { english: "Hey! Long time no see.", chinese: '嘿！好久不见。', whenToUse: '很久没见的朋友偶遇时', speaker: '任何人（非正式）' },
          { english: "How's it going?", chinese: '最近咋样？', whenToUse: "和 How are you 类似但更随意，不需要真的回答细节", speaker: '朋友/同事之间' },
          { english: "Yo!", chinese: '哟！', whenToUse: '非常街头的打招呼，特别熟的朋友之间', speaker: '年轻人' },
        ],
      },
      {
        stage: '表达情绪态度',
        stageEn: 'Expressing Emotions & Attitudes',
        description: '表达各种情绪时的地道说法',
        phrases: [
          { english: "I'm beat.", chinese: '我累死了。', whenToUse: '忙碌一天后表达极度疲惫', speaker: '任何人（非正式）' },
          { english: "No biggie.", chinese: '没什么大不了的。', whenToUse: '别人道歉或感谢时，表示没关系', speaker: '任何人（非正式）' },
          { english: "It's a piece of cake.", chinese: '小菜一碟。', whenToUse: '形容某事非常容易', speaker: '任何人（非正式）' },
          { english: "You're kidding, right?", chinese: '你在开玩笑吧？', whenToUse: '表示难以置信或震惊', speaker: '任何人' },
          { english: "I'm in.", chinese: '我加入/我同意。', whenToUse: '朋友提议活动时，表示愿意参加', speaker: '任何人' },
          { english: "Let's call it a day.", chinese: '今天就到这里吧。', whenToUse: '工作、学习或活动进行了一段时间后提议结束', speaker: '任何人' },
        ],
      },
      {
        stage: '年轻人流行语',
        stageEn: 'Youth / Gen Z Slang',
        description: 'Z世代年轻人常用，可能会让长辈困惑',
        phrases: [
          { english: "Spill the tea!", chinese: '快爆料！', whenToUse: '催促对方分享八卦 (tea = gossip)', speaker: '年轻女性之间最常见' },
          { english: "That's a vibe.", chinese: '这氛围不错。', whenToUse: 'vibe = 氛围/感觉，表示赞赏某个环境或音乐', speaker: '年轻人' },
          { english: "I low-key / high-key + [动词/形容词]", chinese: '我暗自/超 + [动词/形容词]', whenToUse: 'low-key = 低调地、有点；high-key = 高调地、非常', speaker: '年轻人' },
          { english: "Bet.", chinese: '行/说定了/那就走着瞧。', whenToUse: '根据语境不同：可以表示同意，也可以表示挑战', speaker: '年轻人' },
          { english: "No cap.", chinese: '没骗你/真的。', whenToUse: 'cap = 说谎，no cap = 我保证没撒谎', speaker: '年轻人' },
          { english: "That's sick.", chinese: '太酷了/太棒了。', whenToUse: 'sick 在俚语中是褒义词，等于 cool 或 awesome', speaker: '年轻人' },
        ],
      },
      {
        stage: '社交互动',
        stageEn: 'Social Interactions',
        description: '社交对话中的高频俚语',
        phrases: [
          { english: "Hang on a sec.", chinese: '稍等一下。', whenToUse: '让对方等一下，比 wait a minute 更随意', speaker: '任何人' },
          { english: "I feel you.", chinese: '我懂你的感受。', whenToUse: '表示深刻理解并认同对方的心情', speaker: '任何人（非正式）' },
          { english: "It is what it is.", chinese: '事已至此，就这样吧。', whenToUse: '表示无奈但接受无法改变的现实', speaker: '任何人' },
          { english: "Fair enough.", chinese: '有道理/好吧。', whenToUse: '对方的说法你不完全同意，但也无法反驳时', speaker: '任何人' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "I feel you / I feel that.",
        example: "- This homework is so annoying. - I feel you.",
        translation: "——这作业太烦了。——我懂你的感受。",
        explanation: "表示理解和认同对方的感受，非常地道的口语表达。",
        whenToUse: "朋友抱怨或倾诉时，表达共情",
      },
      {
        pattern: "It is what it is.",
        example: "We lost the game. Oh well, it is what it is.",
        translation: "我们输了比赛。唉，事已至此，就这样吧。",
        explanation: "表示接受无法改变的现状，无奈但释然。",
        whenToUse: "事情不顺但无法挽回时",
      },
      {
        pattern: "Low-key / High-key + [形容词/动词]",
        example: "I low-key love this song. / I high-key want to go there.",
        translation: "我偷偷喜欢这首歌。/ 我超想去那里。",
        explanation: "low-key=低调/有点/暗自；high-key=高调/非常。年轻人常用的修饰词。",
        whenToUse: "非正式场合，表达感受的程度",
      },
      {
        pattern: "Bet.",
        example: "- I'll finish this by tomorrow. - Bet.",
        translation: "——我明天前完成这个。——行，那就这么说定了。",
        explanation: "可以表示同意、确认、或者『那就走着瞧』的挑战语气，根据语境判断。",
        whenToUse: "朋友之间确认约定或挑战时",
      },
    ],
    tips: [
      { title: '常见俚语和缩写', content: 'GOAT (Greatest Of All Time 史上最佳)、SUS (suspicious 可疑的)、Cap (说谎)、No Cap (没骗你)、Slay (表现超棒)、Flex (炫耀)、Vibe (氛围/感觉)、Stan (狂热粉丝)。' },
      { title: '理解语境是关键', content: '同一个词在不同语境意思完全不同。例如 "sick" 可以是"生病的"也可以是"超酷的"；"bad" 在俚语中可能是"好的"意思。注意观察上下文。' },
      { title: '语气和重音', content: '口语表达很大程度依赖语气。例如 "Really?" 升调表示惊讶，降调表示怀疑。看剧时注意演员的语调和表情。' },
      { title: '俚语使用注意⚠️', content: '俚语只能用于非正式场合。面试、见客户、和长辈说话时请换回标准英语。不确定时，宁可说标准英语也不要用错俚语。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Hey, did you watch the new episode last night?", chinese: '嘿，你昨晚看新一集了吗？', context: '【打招呼】朋友见面聊天' },
      { role: 'B', english: "Oh my god, yes! That ending was crazy. Low-key did not see that coming.", chinese: '我的天，看了！结局太疯狂了。真是没想到。', context: '【年轻人流行语】low-key = 暗自' },
      { role: 'A', english: "Right? When Mike found out... I was shook. Spill the tea—what did you think?", chinese: '对吧？当Mike发现的时候……我震惊了。快说说你怎么看？', context: '【年轻人流行语】spill the tea = 爆料' },
      { role: 'B', english: "I feel you. Honestly thought it was a dream at first. But it is what it is. Bet the next episode is even crazier.", chinese: '我懂你。说实话一开始我还以为是做梦。但事已至此。赌下一集更疯狂。', context: '【社交互动】表达理解和无奈' },
      { role: 'A', english: "No cap. Hey, wanna watch it together this weekend? My place?", chinese: '真的。嘿，这周末一起看不？去我家？', context: '【年轻人流行语】no cap = 真的' },
      { role: 'B', english: "I'm in! That sounds sick. Let's call it—7pm Saturday.", chinese: '我来！听起来超棒。就这么定了——周六晚上7点。', context: '【年轻人流行语】sick = 超酷' },
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
      keywords: ['餐厅', '点餐', '吃饭', '菜单', '订餐', 'restaurant', 'food', 'menu', 'dinner', '吃饭', '点菜', '西餐', '用餐'],
      stages: [
        { stage: '入座', stageEn: 'Getting Seated' },
        { stage: '看菜单与咨询', stageEn: 'Consulting the Menu' },
        { stage: '点餐', stageEn: 'Placing the Order' },
        { stage: '用餐中', stageEn: 'During the Meal' },
        { stage: '结账与打包', stageEn: 'Paying & Taking Away' },
      ],
    },
    briefIntroduction: '餐厅用餐按入座→看菜单→点餐→用餐→结账的流程分组，找到你当前环节直接使用。',
    keyPhrasesGrouped: [
      {
        stage: '入座',
        stageEn: 'Getting Seated',
        description: '刚进餐厅与领位员沟通时',
        phrases: [
          { english: "We'd like a table for two, please.", chinese: '我们想要一张两人桌。', whenToUse: '进门后直接告诉领位员人数', speaker: '顾客' },
          { english: "Do you have any reservations?", chinese: '你们有预订吗？', whenToUse: '服务员通常会先问你', speaker: '服务员' },
          { english: "Yes, under the name [姓名].", chinese: '有的，名字是[姓名]。', whenToUse: '有预订时报上预订姓名', speaker: '顾客' },
          { english: "How long is the wait?", chinese: '要等多久？', whenToUse: '餐厅满座时询问等待时间', speaker: '顾客' },
          { english: "Could we get a booth, please?", chinese: '可以给我们一个卡座吗？', whenToUse: '有偏好的座位类型时', speaker: '顾客' },
        ],
      },
      {
        stage: '看菜单与咨询',
        stageEn: 'Consulting the Menu',
        description: '研究菜单、询问菜品时',
        phrases: [
          { english: "Could we see the menu, please?", chinese: '请给我们菜单好吗？', whenToUse: '坐下后菜单还没拿来时', speaker: '顾客' },
          { english: "What do you recommend?", chinese: '你推荐什么？', whenToUse: '不知道点什么，让服务员推荐招牌菜', speaker: '顾客' },
          { english: "Is this dish spicy?", chinese: '这道菜辣吗？', whenToUse: '对口味有要求时', speaker: '顾客' },
          { english: "How is the [菜品] prepared?", chinese: '这个[菜品]是怎么做的？', whenToUse: '想了解烹饪方式（煎/烤/煮等）', speaker: '顾客' },
          { english: "What are today's specials?", chinese: '今天的特供菜是什么？', whenToUse: '询问当日厨师推荐', speaker: '顾客' },
          { english: "Does this contain nuts/dairy/gluten?", chinese: '这个含坚果/乳制品/麸质吗？', whenToUse: '有过敏或忌口时必须问清楚', speaker: '顾客' },
        ],
      },
      {
        stage: '点餐',
        stageEn: 'Placing the Order',
        description: '正式点菜时',
        phrases: [
          { english: "I'll have the [菜品名称], please.", chinese: '请给我来一份[菜品名称]。', whenToUse: '最标准的点餐说法', speaker: '顾客' },
          { english: "I'll go with the [菜品名称].", chinese: '我就点[菜品名称]吧。', whenToUse: '更随意的点餐说法', speaker: '顾客' },
          { english: "I'm allergic to peanuts.", chinese: '我对花生过敏。', whenToUse: '有食物过敏时务必提前说明', speaker: '顾客' },
          { english: "Could I get that without onions, please?", chinese: '那份能不放洋葱吗？', whenToUse: '对菜品有特殊要求（不加某样东西）', speaker: '顾客' },
          { english: "For here or to go?", chinese: '在这儿吃还是带走？', whenToUse: '快餐店服务员会问', speaker: '服务员' },
          { english: "I'll have it medium rare, please.", chinese: '请做三分熟。', whenToUse: '点牛排时说明熟度（rare/medium rare/medium/medium well/well done）', speaker: '顾客' },
        ],
      },
      {
        stage: '用餐中',
        stageEn: 'During the Meal',
        description: '用餐过程中需要服务时',
        phrases: [
          { english: "Excuse me, could we get some more water?", chinese: '打扰一下，能再给我们加点水吗？', whenToUse: '需要加水或其他东西时', speaker: '顾客' },
          { english: "Would you mind bringing us some extra napkins?", chinese: '能麻烦再给我们拿一些餐巾纸吗？', whenToUse: '礼貌请求额外物品', speaker: '顾客' },
          { english: "This is delicious. Compliments to the chef.", chinese: '太好吃了。请向主厨转达赞美。', whenToUse: '对菜品非常满意时，很地道的说法', speaker: '顾客' },
          { english: "I'm sorry, but this isn't what I ordered.", chinese: '抱歉，这不是我点的菜。', whenToUse: '上错菜时', speaker: '顾客' },
        ],
      },
      {
        stage: '结账与打包',
        stageEn: 'Paying & Taking Away',
        description: '结束用餐准备离开时',
        phrases: [
          { english: "Check, please. / Can we have the bill?", chinese: '请结账。', whenToUse: '招呼服务员来买单（两种都常用）', speaker: '顾客' },
          { english: "Could we get separate checks?", chinese: '可以分开结账吗？', whenToUse: '和朋友吃饭各付各的', speaker: '顾客' },
          { english: "Do you accept credit cards?", chinese: '你们收信用卡吗？', whenToUse: '确认付款方式', speaker: '顾客' },
          { english: "Could you pack this to go?", chinese: '能帮我打包带走吗？', whenToUse: '吃不完要打包', speaker: '顾客' },
          { english: "What's your return policy?", chinese: '（如果是商店）退换货政策是什么？', whenToUse: '购物时', speaker: '顾客' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "I'll go with + [菜品名称].",
        example: "I'll go with the chef's special.",
        translation: "我来一份主厨特色菜。",
        explanation: "点菜时的轻松说法，比 I'll have 更随意。",
        whenToUse: "正式/非正式餐厅点餐都能用",
      },
      {
        pattern: "How is the + [菜品] prepared?",
        example: "How is the steak prepared here?",
        translation: "你们这里的牛排是怎么做的？",
        explanation: "询问菜品的烹饪方式。",
        whenToUse: "关心烹饪方法或口味时",
      },
      {
        pattern: "Would you mind + [动词ing]?",
        example: "Would you mind bringing us some extra napkins?",
        translation: "能麻烦再给我们拿一些餐巾纸吗？",
        explanation: "非常礼貌地提出请求。",
        whenToUse: "需要服务员帮忙时的最佳说法",
      },
      {
        pattern: "That was delicious. Compliments to the chef.",
        example: "That was delicious. Compliments to the chef.",
        translation: "太好吃了。请向主厨转达赞美。",
        explanation: "对菜品表示满意和赞美的地道说法。",
        whenToUse: "对菜品满意时说，会让服务员非常开心",
      },
    ],
    tips: [
      { title: '牛排熟度的说法', content: 'rare（一分熟）、medium rare（三分熟）、medium（五分熟）、medium well（七分熟）、well done（全熟）。大多数西餐厅默认 medium rare。' },
      { title: '小费文化', content: '美国：15-20%；加拿大：15-20%；英国：10-15%；欧洲大陆：一般5-10%或 rounding up；日本/韩国：通常不需要。账单上写 "service included" 表示已含服务费。' },
      { title: '过敏和特殊饮食', content: '务必说清楚：vegetarian（素食）、vegan（纯素，不含蛋奶）、gluten-free（无麸质）、lactose intolerant（乳糖不耐受）、nut allergy（坚果过敏）。严重过敏可以说 "It\'s a severe allergy, could you double-check with the kitchen?"。' },
      { title: '常见菜单词汇', content: 'appetizer/starter（开胃菜）、main course/entrée（主菜）、side dish（配菜）、dessert（甜点）、beverage（饮料）、soup of the day（当日例汤）、today\'s special（今日特供）。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good evening! Do you have a reservation?", chinese: '晚上好！请问有预订吗？', context: '【入座】服务员询问' },
      { role: 'B', english: "Yes, under the name Smith. A table for two, please.", chinese: '有的，名字是Smith。请给我们一张两人桌。', context: '【入座】顾客回答' },
      { role: 'A', english: "Right this way. Here are your menus. Can I get you started with something to drink?", chinese: '这边请。这是菜单。先来点喝的吗？', context: '【看菜单与咨询】引导入座并询问饮料' },
      { role: 'B', english: "I'll have a glass of red wine, please. And do you have any non-alcoholic options?", chinese: '请给我一杯红酒。你们有无酒精饮品吗？', context: '【点餐】点饮料' },
      { role: 'A', english: "Certainly. We have sparkling water, soft drinks, and fresh juices. Are you ready to order?", chinese: '当然有。我们有气泡水、软饮和鲜榨果汁。准备好点菜了吗？', context: '【点餐】询问是否可以点菜' },
      { role: 'B', english: "Yes. I'll go with the ribeye steak, medium rare. And my friend will have the grilled salmon. Could we get that with no salt, please?", chinese: '好了。我要肋眼牛排，三分熟。我朋友要烤三文鱼。那份能不放盐吗？', context: '【点餐】正式点菜，带特殊要求' },
      { role: 'A', english: "Absolutely. Anything else?", chinese: '没问题。还要别的吗？', context: '【点餐】确认' },
      { role: 'B', english: "Just a side of steamed vegetables, please. Thank you.", chinese: '再来一份蒸蔬菜就好。谢谢。', context: '【点餐】加配菜' },
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
      keywords: ['面试', '求职', '工作', '招聘', 'interview', 'job', 'career', 'resume', '找工作', '应聘', 'hr', 'offer'],
      stages: [
        { stage: '开场寒暄', stageEn: 'Opening & Small Talk' },
        { stage: '自我介绍', stageEn: 'Self-Introduction' },
        { stage: '回答经验能力问题', stageEn: 'Experience & Skills' },
        { stage: '回答优缺点等行为问题', stageEn: 'Behavioral Questions' },
        { stage: '表达动机与反问', stageEn: 'Motivation & Your Questions' },
        { stage: '结束收尾', stageEn: 'Closing' },
      ],
    },
    briefIntroduction: '面试流程固定，下方按面试环节分组，提前准备好每个环节的表达能显著提升表现。',
    keyPhrasesGrouped: [
      {
        stage: '开场寒暄',
        stageEn: 'Opening & Small Talk',
        description: '刚进公司，正式面试前的交流',
        phrases: [
          { english: "Thank you for having me today.", chinese: '感谢您今天邀请我来面试。', whenToUse: '见到面试官时的第一句话，握手时说', speaker: '应聘者' },
          { english: "It's a pleasure to meet you.", chinese: '很高兴见到您。', whenToUse: '和面试官打招呼', speaker: '应聘者' },
          { english: "Thanks for taking the time to meet with me.", chinese: '感谢您抽时间见我。', whenToUse: '表达礼貌', speaker: '应聘者' },
          { english: "Your office is really nice.", chinese: '你们办公室真不错。', whenToUse: '寒暄时可以适当赞美', speaker: '应聘者' },
        ],
      },
      {
        stage: '自我介绍',
        stageEn: 'Self-Introduction',
        description: '经典的 "Tell me about yourself" 环节',
        phrases: [
          { english: "I'd be happy to tell you about myself.", chinese: '我很乐意介绍一下我自己。', whenToUse: '面试官让你自我介绍时的开场', speaker: '应聘者' },
          { english: "I have [X] years of experience in [领域].", chinese: '我在[领域]有[X]年的经验。', whenToUse: '自我介绍的核心句之一', speaker: '应聘者' },
          { english: "Most recently, I've been working at [公司] as a [职位].", chinese: '最近我在[公司]担任[职位]。', whenToUse: '介绍最近的工作经历', speaker: '应聘者' },
          { english: "My background is mainly in [领域], but I also have experience in [另一领域].", chinese: '我的背景主要在[领域]，但我也有[另一领域]的经验。', whenToUse: '展示复合背景', speaker: '应聘者' },
        ],
      },
      {
        stage: '回答经验能力问题',
        stageEn: 'Experience & Skills',
        description: '询问过往经历和专业技能时',
        phrases: [
          { english: "In my previous role, I led a team of [X] people.", chinese: '在上一份工作中，我带领了一个[X]人的团队。', whenToUse: '展示管理经验', speaker: '应聘者' },
          { english: "My greatest strength is problem-solving.", chinese: '我最大的优势是解决问题的能力。', whenToUse: '回答"What are your strengths?"', speaker: '应聘者' },
          { english: "I'm particularly skilled at [技能], which I developed while [某段经历].", chinese: '我特别擅长[技能]，这是我在[某段经历]中培养的。', whenToUse: '把技能和具体经历结合', speaker: '应聘者' },
          { english: "One project I'm proud of is...", chinese: '我引以为豪的一个项目是...', whenToUse: '引入一个成功案例', speaker: '应聘者' },
        ],
      },
      {
        stage: '回答优缺点等行为问题',
        stageEn: 'Behavioral Questions',
        description: 'STAR法则回答行为面试题',
        phrases: [
          { english: "Let me think of an example from my last project.", chinese: '让我想一个上一个项目中的例子。', whenToUse: '需要回忆具体案例时，给自己思考时间', speaker: '应聘者' },
          { english: "That's a great question. Let me think...", chinese: '这个问题很好。让我想一想...', whenToUse: '需要时间组织回答时的过渡语', speaker: '应聘者' },
          { english: "I'm working on improving my public speaking skills.", chinese: '我正在努力提升公众演讲能力。', whenToUse: '回答弱点时，说一个真实但在改进中的弱点', speaker: '应聘者' },
          { english: "I used to struggle with [某弱点], but I've started [改进方法] and it's helped a lot.", chinese: '我过去在[某弱点]上有困难，但我已经开始[改进方法]，效果很好。', whenToUse: '弱点问题的最佳回答结构', speaker: '应聘者' },
        ],
      },
      {
        stage: '表达动机与反问',
        stageEn: 'Motivation & Your Questions',
        description: '"Why are you interested in this role?" 和你反问面试官',
        phrases: [
          { english: "I'm particularly interested in this role because...", chinese: '我对这个职位特别感兴趣是因为...', whenToUse: '回答为什么申请这个职位', speaker: '应聘者' },
          { english: "I believe my experience in [领域] aligns well with this role.", chinese: '我相信我在[领域]的经验与这个职位非常匹配。', whenToUse: '说明你和职位的契合度', speaker: '应聘者' },
          { english: "Where do you see the company in the next 5 years?", chinese: '您认为公司未来5年的发展方向是什么？', whenToUse: '高质量反问问题之一', speaker: '应聘者' },
          { english: "What does success look like in this role in the first year?", chinese: '这个职位第一年怎样算成功？', whenToUse: '非常专业的反问问题', speaker: '应聘者' },
          { english: "Can you tell me about the team I'd be working with?", chinese: '能介绍一下我将共事的团队吗？', whenToUse: '了解团队情况', speaker: '应聘者' },
        ],
      },
      {
        stage: '结束收尾',
        stageEn: 'Closing',
        description: '面试即将结束时',
        phrases: [
          { english: "What are the next steps in the interview process?", chinese: '面试流程的下一步是什么？', whenToUse: '面试结束前询问流程', speaker: '应聘者' },
          { english: "When can I expect to hear from you?", chinese: '我什么时候能收到回复？', whenToUse: '询问结果时间', speaker: '应聘者' },
          { english: "I look forward to hearing from you.", chinese: '期待您的回复。', whenToUse: '最后的告别语', speaker: '应聘者' },
          { english: "Thank you again for this opportunity. I really appreciate your time.", chinese: '再次感谢这个机会。非常感谢您的时间。', whenToUse: '真诚收尾，离开前说', speaker: '应聘者' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "Using the STAR method: Situation + Task + Action + Result",
        example: "In my previous job (Situation), I was tasked with improving customer retention (Task). I implemented a new feedback system (Action), which increased retention by 25% (Result).",
        translation: "在我之前的工作中（情境），我被指派提升客户留存率（任务）。我实施了一套新的反馈系统（行动），将留存率提高了25%（结果）。",
        explanation: "回答行为面试问题的黄金法则：用具体案例说明能力。",
        whenToUse: "回答 'Tell me about a time when...' 类问题时",
      },
      {
        pattern: "I'm excited about the opportunity to + [动词].",
        example: "I'm excited about the opportunity to contribute to your team's growth.",
        translation: "我很期待能为团队的发展做出贡献。",
        explanation: "表达对职位的热情和期待。",
        whenToUse: "回答 'Why do you want this job?' 时",
      },
      {
        pattern: "That's a great question. Let me think...",
        example: "That's a great question. Let me think about an example from my last project.",
        translation: "这个问题很好。让我想一想我上一个项目中的例子。",
        explanation: "需要思考时的过渡语，避免沉默尴尬，也展现你在认真思考。",
        whenToUse: "被问到需要组织答案的问题时",
      },
      {
        pattern: "I believe my experience in + [领域] aligns well with this role.",
        example: "I believe my experience in project management aligns well with this role.",
        translation: "我相信我在项目管理方面的经验与这个职位非常匹配。",
        explanation: "说明自身经验与岗位要求的契合度。",
        whenToUse: "总结为什么你是合适的候选人",
      },
    ],
    tips: [
      { title: '自我介绍的结构', content: '建议按以下顺序：1) 目前身份（"I\'m a software engineer with 4 years of experience..."）2) 核心技能和经验 3) 为什么对这个职位感兴趣。控制在1-2分钟内。' },
      { title: '回答"弱点"的技巧', content: '不要说"我最大的缺点就是太追求完美"这种陈词滥调。真诚说一个真实但不致命的弱点，并说明你正在如何改进："I used to struggle with time management, but I\'ve started using the Pomodoro Technique and it\'s helped a lot."' },
      { title: '反问面试官的问题', content: '面试最后通常会问 "Do you have any questions for us?"，千万别说 No。好问题："What does success look like in this role in the first year?"、"Can you tell me about the team I\'d be working with?"、"What\'s the company culture like?"。' },
      { title: '避免的表达', content: '避免过于口语化的俚语（like, kinda, gonna）、避免过于绝对（"I\'m the best at..."）、避免否定前雇主或同事（即使是真的）。' },
    ],
    sampleDialogue: [
      { role: 'A', english: "Good morning. Thanks for coming in today. Could you start by telling us a little about yourself?", chinese: '早上好。感谢你今天来面试。可以先简单介绍一下你自己吗？', context: '【自我介绍】面试官开场问题' },
      { role: 'B', english: "Thank you for having me. I'm a product manager with 6 years of experience in the tech industry. In my previous role at XYZ Company, I led the launch of three successful mobile apps.", chinese: '感谢邀请。我是一名在科技行业有6年经验的产品经理。在之前的XYZ公司，我主导了三个成功的移动应用的发布。', context: '【自我介绍】应聘者回答' },
      { role: 'A', english: "That's impressive. Can you tell us about a time you overcame a significant challenge?", chinese: '很厉害。能说说你克服重大挑战的一次经历吗？', context: '【行为问题】STAR法则适用问题' },
      { role: 'B', english: "That's a great question. Let me think... In my last project, our team was falling behind schedule. I organized daily standups and re-prioritized tasks. We ended up launching on time and 10% under budget.", chinese: '这个问题很好。让我想想……在上一个项目中，我们团队进度落后了。我组织了每日站会并重新排定任务优先级。最终我们按时发布，还比预算节省了10%。', context: '【行为问题】用STAR法则回答' },
      { role: 'A', english: "Excellent. Why are you interested in this position?", chinese: '很好。你为什么对这个职位感兴趣？', context: '【表达动机】经典问题' },
      { role: 'B', english: "I've followed your company for a long time and I'm excited about the opportunity to work on products that reach millions of users. My experience in scaling products aligns well with what you're looking for.", chinese: '我关注贵公司很久了，我很期待能有机会为数百万用户做产品。我在产品规模化方面的经验与你们的需求很契合。', context: '【表达动机】表达热情和匹配度' },
      { role: 'A', english: "Great. Do you have any questions for us?", chinese: '好的。你有什么想问我们的吗？', context: '【反问环节】面试官询问' },
      { role: 'B', english: "Yes. What does success look like for this role in the first six months? And could you tell me about the team I'd be working with?", chinese: '有的。这个职位在前6个月怎样算成功？还有能介绍一下我将共事的团队吗？', context: '【反问环节】高质量反问问题' },
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
      keywords: ['购物', '逛街', '买东西', '衣服', '商场', 'shopping', 'clothes', 'store', 'mall', '买衣服', '商店', 'outlet', '折扣'],
      stages: [
        { stage: '进店与闲逛', stageEn: 'Entering & Browsing' },
        { stage: '询问尺码颜色价格', stageEn: 'Asking About Products' },
        { stage: '试穿', stageEn: 'Trying On' },
        { stage: '询问折扣与付款', stageEn: 'Discounts & Payment' },
        { stage: '退换货', stageEn: 'Returns & Exchanges' },
      ],
    },
    briefIntroduction: '购物流程按进店→咨询→试穿→付款→退换货分组，特别是退换货政策一定要提前问清楚。',
    keyPhrasesGrouped: [
      {
        stage: '进店与闲逛',
        stageEn: 'Entering & Browsing',
        description: '刚进店，店员上来招呼时',
        phrases: [
          { english: "I'm just looking around, thanks.", chinese: '我只是随便看看，谢谢。', whenToUse: '店员招呼 "Can I help you?" 时的标准回答', speaker: '顾客' },
          { english: "I'm looking for a [物品].", chinese: '我在找一个[物品]。', whenToUse: '有明确想买的东西时', speaker: '顾客' },
          { english: "Can I help you find anything?", chinese: '需要帮忙找什么吗？', whenToUse: '店员通常会问的第一句话', speaker: '店员' },
          { english: "I'll let you know if I need anything.", chinese: '有需要我会叫你的。', whenToUse: '礼貌拒绝店员帮助，但不关上沟通的门', speaker: '顾客' },
        ],
      },
      {
        stage: '询问尺码颜色价格',
        stageEn: 'Asking About Products',
        description: '看中某样东西，想问具体信息时',
        phrases: [
          { english: "Do you have this in a smaller size?", chinese: '这个有小一码的吗？', whenToUse: '问不同尺码', speaker: '顾客' },
          { english: "Does this come in other colors?", chinese: '这个有其他颜色吗？', whenToUse: '问是否有其他颜色', speaker: '顾客' },
          { english: "How much is this?", chinese: '这个多少钱？', whenToUse: '没看到价格标签时', speaker: '顾客' },
          { english: "Do you have anything similar but + [不同点]?", chinese: '你们有类似但 + [不同点] 的吗？', whenToUse: '在已看的款式基础上提出其他需求（如更便宜/更正式等）', speaker: '顾客' },
          { english: "Is this real leather/genuine?", chinese: '这个是真皮/正品吗？', whenToUse: '怀疑材质或真伪时', speaker: '顾客' },
        ],
      },
      {
        stage: '试穿',
        stageEn: 'Trying On',
        description: '试穿衣服鞋子时',
        phrases: [
          { english: "Can I try this on?", chinese: '我能试一下吗？', whenToUse: '询问是否可以试穿', speaker: '顾客' },
          { english: "Where are the fitting rooms?", chinese: '试衣间在哪里？', whenToUse: '找试衣间', speaker: '顾客' },
          { english: "How does this look on me?", chinese: '我穿这个好看吗？', whenToUse: '问同伴或店员的意见', speaker: '顾客' },
          { english: "It's a bit too tight/loose. Do you have a size [M/L]?", chinese: '有点太紧/松了。你们有[M/L]码吗？', whenToUse: '尺码不合适时', speaker: '顾客' },
          { english: "This doesn't fit me very well.", chinese: '这个不太合身。', whenToUse: '委婉表示不合适', speaker: '顾客' },
        ],
      },
      {
        stage: '询问折扣与付款',
        stageEn: 'Discounts & Payment',
        description: '决定购买到付款的环节',
        phrases: [
          { english: "Is this on sale?", chinese: '这个打折吗？', whenToUse: '询问是否在促销', speaker: '顾客' },
          { english: "Do you offer a student discount?", chinese: '你们有学生折扣吗？', whenToUse: '有学生证时问', speaker: '顾客' },
          { english: "Are there any promotions going on right now?", chinese: '现在有什么促销活动吗？', whenToUse: '更广泛地问有没有优惠', speaker: '顾客' },
          { english: "I'll take this one.", chinese: '我要这件。', whenToUse: '决定购买时', speaker: '顾客' },
          { english: "Can I pay by credit card?", chinese: '我可以用信用卡付款吗？', whenToUse: '确认付款方式', speaker: '顾客' },
          { english: "Can I pay with Apple Pay/Alipay?", chinese: '我可以用 Apple Pay/支付宝 付款吗？', whenToUse: '问是否支持特定支付方式', speaker: '顾客' },
        ],
      },
      {
        stage: '退换货',
        stageEn: 'Returns & Exchanges',
        description: '询问退换货政策或办理退换时',
        phrases: [
          { english: "What's your return policy?", chinese: '你们的退换货政策是什么？', whenToUse: '购买前提前了解，或者购买后需要退换时', speaker: '顾客' },
          { english: "How many days do I have to return this?", chinese: '退换期限是多少天？', whenToUse: '确认退货期限', speaker: '顾客' },
          { english: "Do I need the receipt?", chinese: '需要小票吗？', whenToUse: '确认退货凭证', speaker: '顾客' },
          { english: "Can I exchange this for a different size?", chinese: '我可以换一个不同尺码吗？', whenToUse: '尺码不合适换货时', speaker: '顾客' },
          { english: "I'd like to return this, please.", chinese: '我想退货。', whenToUse: '正式办理退货', speaker: '顾客' },
        ],
      },
    ],
    keyPhrases: [],
    commonPatterns: [
      {
        pattern: "I'm looking for + [物品].",
        example: "I'm looking for a casual dress for summer.",
        translation: "我在找夏天穿的休闲连衣裙。",
        explanation: "明确表达你想买什么。",
        whenToUse: "进店后直接告诉店员你的需求",
      },
      {
        pattern: "Do you have anything similar but + [不同点]?",
        example: "Do you have anything similar but less expensive?",
        translation: "你们有类似但便宜一点的吗？",
        explanation: "在已有款式基础上提出其他需求。",
        whenToUse: "对看中的某样东西不完全满意时",
      },
      {
        pattern: "It's a bit too + [形容词]. Do you have...?",
        example: "It's a bit too tight. Do you have a size M?",
        translation: "有点太紧了。你们有中号的吗？",
        explanation: "说明不合适并提出具体需求。",
        whenToUse: "试穿后觉得不合适时",
      },
      {
        pattern: "I think I'll pass on this one. Thank you anyway.",
        example: "I think I'll pass on this one. Thank you anyway.",
        translation: "这件我就不买了。还是谢谢你。",
        explanation: "礼貌地拒绝购买，不买也保持礼貌。",
        whenToUse: "试穿或看完后决定不买时",
      },
    ],
    tips: [
      { title: '尺码对照', content: '美国女装：XS(0-2)、S(4-6)、M(8-10)、L(12-14)、XL(16-18)；男装：S、M、L、XL对应胸围和腰围。鞋码 US 7 = 欧码 38 = 中国 245。建议网上查好对照表。' },
      { title: '折扣季与砍价', content: '美国：Black Friday（感恩节后）、Cyber Monday、Boxing Day（节后）。大部分商店明码标价不砍价，跳蚤市场、小商铺可以试试 "Is there any discount on this?"、"Do you have a promotion going on?"。' },
      { title: '付款常用表达', content: '"Can I pay by credit card?"、"I\'d like to pay with Apple Pay."、"Could you split this into two payments?"、"Please put this on separate bills."（分开结账）。' },
      { title: '退换货须知', content: "问清楚 return policy：return window（退换期限，常见30天）、receipt required（是否需要小票）、store credit vs refund（是退到礼品卡还是原路退回）。保留好小票！" },
    ],
    sampleDialogue: [
      { role: 'A', english: "Hi there! Can I help you find anything today?", chinese: '你好！需要帮忙找点什么吗？', context: '【进店与闲逛】店员招呼' },
      { role: 'B', english: "Hi! I'm just looking around for now, thanks. But I might need help with sizes later.", chinese: '你好！我先随便看看，谢谢。不过等下可能需要你帮忙看看尺码。', context: '【进店与闲逛】礼貌拒绝' },
      { role: 'A', english: "Sure thing, just let me know. Oh, and just so you know—we're having a 30% off sale on all summer items.", chinese: '好的，随时叫我。对了说一下，所有夏季商品都打7折哦。', context: '【询问折扣与付款】店员告知促销' },
      { role: 'B', english: "Oh, that's great! Actually, could I try this jacket on? Do you have it in a medium?", chinese: '哦，太好了！对了，我能试一下这件夹克吗？有中号吗？', context: '【试穿】询问尺码和试穿' },
      { role: 'A', english: "Let me check. Yes, here you go. The fitting rooms are right over there, by the wall.", chinese: '我看看。有的，给你。试衣间就在那边，靠墙的位置。', context: '【试穿】店员指引' },
      { role: 'B', english: "Thanks. Hmm... it's a bit too big. Do you have anything similar but a size smaller?", chinese: '谢谢。嗯……有点太大了。你们有类似但小一号的吗？', context: '【询问尺码颜色价格】说明不合适' },
      { role: 'A', english: "We have this style in a small. Would you like to try it?", chinese: '这款我们有小号。你想试试吗？', context: '【询问尺码颜色价格】店员提供选择' },
      { role: 'B', english: "Perfect! Yes, please. Also, what's your return policy just in case?", chinese: '太好了！麻烦你。另外，想问下你们的退换货政策是怎样的？以防万一。', context: '【退换货】询问退换政策' },
    ],
  },
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business_meeting: ['会议', '开会', '商务', '同事', '团队', 'work', 'meeting', 'conference', 'office', '职场', '汇报', '例会', '老板', '客户', 'presentation', '讨论'],
  office_daily: ['老板', '临时', '任务', '加班', '请假', '加薪', '汇报', '进度', '1对1', '提薪', 'boss', 'manager', 'task', 'overtime', 'extra work', 'last minute', 'leave', 'vacation', 'raise', 'promotion', 'salary', 'PTO', 'day off', 'sick', 'one on one', '额外', '加活', '被安排', '突然', '临时加', '请假条', '年假', '涨工资', '调岗', '辞职', '离职'],
  airport_checkin: ['机场', '值机', '登机', '行李', '托运', 'airport', 'checkin', 'flight', 'luggage', '飞机', '航站楼', '登机口', '安检', '海关', '出境', '转机', '机票'],
  tv_series_slang: ['美剧', '俚语', '口语', '电影', 'tv', 'slang', 'movie', 'drama', '流行语', '追剧', '看剧', '娱乐', 'native speaker', '地道', 'native', '老外'],
  restaurant_ordering: ['餐厅', '点餐', '吃饭', '菜单', '订餐', 'restaurant', 'food', 'menu', 'dinner', '点菜', '西餐', '用餐', '吃饭', 'lunch', 'breakfast', 'brunch'],
  job_interview: ['面试', '求职', '工作', '招聘', 'interview', 'job', 'career', 'resume', '找工作', '应聘', 'hr', 'offer', '简历', '跳槽', 'offer'],
  shopping: ['购物', '逛街', '买东西', '衣服', '商场', 'shopping', 'clothes', 'store', 'mall', '买衣服', '商店', 'outlet', '折扣', '超市', 'grocery', '买鞋', '包包'],
};

const DEFAULT_RESPONSE: {
  briefIntroduction: string;
  keyPhrases: ScenePhrase[];
  keyPhrasesGrouped: ScenePhraseGroup[];
  commonPatterns: ScenePattern[];
  tips: SceneTip[];
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string; context?: string }[];
} = {
  briefIntroduction: '没能精准匹配到你的具体场景。下方提供了一些通用英语表达，也可以尝试补充更具体的信息（比如"被老板临时加任务怎么回应""请假 5 天怎么说""想提加薪怎么开口"）来获取更精准的内容。',
  keyPhrases: [
    { english: "Excuse me, could you help me?", chinese: '打扰一下，能帮我吗？', whenToUse: '任何需要寻求帮助的场合', speaker: '你' },
    { english: "Could you repeat that, please?", chinese: '能重复一下吗？', whenToUse: '没听清对方说的话', speaker: '你' },
    { english: "I'm sorry, I didn't quite catch that.", chinese: '抱歉，我没太听懂。', whenToUse: '没听懂，比 I don\'t understand 更礼貌', speaker: '你' },
    { english: "How do you say this in English?", chinese: '这个用英语怎么说？', whenToUse: '想问某个词或句子的英语说法', speaker: '你' },
    { english: "Can you write that down for me?", chinese: '能帮我写下来吗？', whenToUse: '怕记不住，让对方写下来', speaker: '你' },
    { english: "Thank you so much for your help.", chinese: '非常感谢你的帮助。', whenToUse: '对方帮完你之后', speaker: '你' },
    { english: "I appreciate it.", chinese: '非常感谢。', whenToUse: '更随意的感谢', speaker: '你' },
    { english: "No problem at all.", chinese: '完全没问题。', whenToUse: '回应别人的感谢', speaker: '任何人' },
    { english: "Could you speak a bit slower, please?", chinese: '能说慢一点吗？', whenToUse: '对方语速太快时', speaker: '你' },
    { english: "I'm still learning English.", chinese: '我还在学习英语。', whenToUse: '提前说明，让对方对你更有耐心', speaker: '你' },
  ],
  keyPhrasesGrouped: [
    {
      stage: '寻求帮助',
      stageEn: 'Asking for Help',
      description: '需要别人帮忙时',
      phrases: [
        { english: "Excuse me, could you help me?", chinese: '打扰一下，能帮我吗？', whenToUse: '任何需要寻求帮助的场合', speaker: '你' },
        { english: "Could you do me a favor?", chinese: '能帮我个忙吗？', whenToUse: '请别人帮具体的小忙', speaker: '你' },
      ],
    },
    {
      stage: '听不懂时',
      stageEn: 'When You Don\'t Understand',
      description: '沟通遇到障碍时',
      phrases: [
        { english: "Could you repeat that, please?", chinese: '能重复一下吗？', whenToUse: '没听清', speaker: '你' },
        { english: "I'm sorry, I didn't quite catch that.", chinese: '抱歉，我没太听懂。', whenToUse: '没听懂', speaker: '你' },
        { english: "Could you speak a bit slower, please?", chinese: '能说慢一点吗？', whenToUse: '对方语速太快', speaker: '你' },
        { english: "Can you write that down for me?", chinese: '能帮我写下来吗？', whenToUse: '怕记不住', speaker: '你' },
      ],
    },
    {
      stage: '感谢与回应',
      stageEn: 'Thanks & Responses',
      description: '表达感谢和回应感谢',
      phrases: [
        { english: "Thank you so much for your help.", chinese: '非常感谢你的帮助。', whenToUse: '对方帮完你之后', speaker: '你' },
        { english: "I appreciate it.", chinese: '非常感谢。', whenToUse: '更随意的感谢', speaker: '你' },
        { english: "No problem at all.", chinese: '完全没问题。', whenToUse: '回应别人的感谢', speaker: '任何人' },
        { english: "You're welcome.", chinese: '不客气。', whenToUse: '最标准的回应感谢', speaker: '任何人' },
      ],
    },
  ],
  commonPatterns: [
    {
      pattern: "Could you please + [动词原形]?",
      example: "Could you please show me the way?",
      translation: "你能给我指路吗？",
      explanation: "最通用的礼貌请求句型，几乎可以用在任何需要帮助的场合。",
      whenToUse: "任何需要请别人帮忙做某事时",
    },
    {
      pattern: "I would like to + [动词].",
      example: "I would like to ask a question.",
      translation: "我想问一个问题。",
      explanation: "比 I want to 更加正式和礼貌的表达。",
      whenToUse: "正式或半正式场合表达需求",
    },
    {
      pattern: "Do you know if/whether + [从句]?",
      example: "Do you know if there's a restroom nearby?",
      translation: "你知道附近有没有洗手间吗？",
      explanation: "礼貌地询问信息。",
      whenToUse: "打听不确定的信息时",
    },
  ],
  tips: [
    { title: '遇到听不懂时', content: '别紧张，礼貌地请对方重复或放慢语速："Sorry, could you say that again more slowly?"、"Would you mind writing that down for me?" 大多数人都会很乐意帮忙。' },
    { title: '保持简单', content: '不用追求复杂语法和高级词汇。简单清晰的表达 + 手势和微笑，比勉强说复杂句子但出错效果更好。' },
    { title: '善用关键词', content: '即使说不出完整句子，说出关键词也能让对方理解。例如在机场只需要说 "Gate?" + 机票，对方就能明白你在找登机口。' },
    { title: '随身工具', content: '可以提前下载翻译App（如Google翻译），支持离线翻译和语音翻译，在关键时刻非常有用。' },
  ],
  sampleDialogue: [
    { role: 'A', english: "Excuse me, could you help me? I'm a bit lost.", chinese: '打扰一下，能帮我吗？我有点迷路了。', context: '【寻求帮助】问路' },
    { role: 'B', english: "Of course! Where are you trying to go?", chinese: '当然可以！你想去哪里？', context: '【寻求帮助】对方回应' },
    { role: 'A', english: "I'm looking for the subway station. Could you point me in the right direction?", chinese: '我在找地铁站。能告诉我怎么走吗？', context: '【寻求帮助】说明需求' },
    { role: 'B', english: "Sure! Go straight for two blocks, then turn left. You'll see it on your right.", chinese: '好的！直走两个街区，然后左转。你就能看到它在右手边。', context: '【寻求帮助】对方指路' },
    { role: 'A', english: "Thank you so much! I really appreciate it.", chinese: '非常感谢！太谢谢你了。', context: '【感谢与回应】表达感谢' },
    { role: 'B', english: "No problem at all! Have a good day.", chinese: '不客气！祝你今天愉快。', context: '【感谢与回应】对方回应' },
  ],
};

const AMBIGUOUS_THRESHOLD = 1;
const GOOD_MATCH_THRESHOLD = 3;

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

  private getMatchReasons(description: string, sceneId: string): string[] {
    const reasons: string[] = [];
    const lower = description.toLowerCase();
    const keywords = CATEGORY_KEYWORDS[sceneId] || [];
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        reasons.push(kw);
        if (reasons.length >= 3) break;
      }
    }
    return reasons;
  }

  private buildCandidate(sceneId: string, score: number, description: string): SceneCandidate {
    const info = SCENES_DATA[sceneId].info;
    return {
      id: info.id,
      name: info.name,
      nameEn: info.nameEn,
      icon: info.icon,
      description: info.description,
      matchScore: score,
      matchReasons: this.getMatchReasons(description, sceneId),
    };
  }

  query(sceneDescription: string): SceneEnglishResponse {
    const trimmed = sceneDescription.trim();
    const lower = trimmed.toLowerCase();

    let matchedSceneId: string | null = null;
    let bestScore = 0;
    const allScores: { id: string; score: number }[] = [];

    for (const [id, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          score += 1;
        }
      }
      allScores.push({ id, score });
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

    allScores.sort((a, b) => b.score - a.score);

    const isAmbiguous = bestScore <= AMBIGUOUS_THRESHOLD;

    if (matchedSceneId && bestScore > AMBIGUOUS_THRESHOLD) {
      const scene = SCENES_DATA[matchedSceneId];
      const candidates = allScores
        .filter(s => s.id !== matchedSceneId && s.score > 0)
        .slice(0, 3)
        .map(s => this.buildCandidate(s.id, s.score, trimmed));

      return {
        sceneName: scene.info.name,
        sceneNameEn: scene.info.nameEn,
        briefIntroduction: scene.briefIntroduction,
        matchedScore: bestScore,
        isAmbiguous: false,
        candidateScenes: candidates.length > 0 ? candidates : undefined,
        keyPhrases: scene.keyPhrases,
        keyPhrasesGrouped: scene.keyPhrasesGrouped,
        commonPatterns: scene.commonPatterns,
        tips: scene.tips,
        sampleDialogue: scene.sampleDialogue,
      };
    }

    const candidateScenes = allScores
      .filter(s => s.score > 0)
      .slice(0, 5)
      .map(s => this.buildCandidate(s.id, s.score, trimmed));

    const clarificationHint = candidateScenes.length > 0
      ? '你是不是在找以上某个场景？点击卡片可直接查看，或补充更多细节（如"在机场的哪个环节？""会议中你是主持人还是参会者？"）以获得更精准的匹配。'
      : '可以尝试补充更多具体细节，例如：你在什么地点？对方是什么人？你想达成什么目的？（例如："在国外餐厅想点牛排，要五分熟"）';

    return {
      sceneName: '通用英语交流',
      sceneNameEn: 'General English Communication',
      briefIntroduction: DEFAULT_RESPONSE.briefIntroduction,
      matchedScore: bestScore,
      isAmbiguous: true,
      candidateScenes: candidateScenes.length > 0 ? candidateScenes : undefined,
      clarificationHint,
      keyPhrases: DEFAULT_RESPONSE.keyPhrases,
      keyPhrasesGrouped: DEFAULT_RESPONSE.keyPhrasesGrouped,
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
      matchedScore: 999,
      isAmbiguous: false,
      keyPhrases: scene.keyPhrases,
      keyPhrasesGrouped: scene.keyPhrasesGrouped,
      commonPatterns: scene.commonPatterns,
      tips: scene.tips,
      sampleDialogue: scene.sampleDialogue,
    };
  }
}