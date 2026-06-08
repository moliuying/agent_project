import { Injectable } from '@nestjs/common';

export interface ConversationMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  translation?: string;
  correction?: string;
  suggestions?: string[];
  usefulPhrases?: { phrase: string; meaning: string }[];
  timestamp: number;
}

export interface ConversationScene {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  systemPrompt: string;
  openingLines: string[];
  vocabulary: { word: string; meaning: string }[];
}

export interface ConversationState {
  sceneId: string;
  sceneName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  messages: ConversationMessage[];
  round: number;
  score?: number;
  totalWords?: number;
  learnedPhrases?: { phrase: string; meaning: string }[];
}

export interface ChatRequest {
  userMessage: string;
  currentState: ConversationState;
}

const SCENES: ConversationScene[] = [
  {
    id: 'daily_chat',
    name: '日常闲聊',
    nameEn: 'Daily Chat',
    description: '练习日常英语对话，话题包括天气、兴趣爱好、周末计划等',
    icon: 'ChatDotRound',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly English conversation partner. Chat casually about daily topics like weather, hobbies, food, and weekend plans. Keep your responses simple, natural, and engaging. Ask follow-up questions to keep the conversation going.',
    openingLines: [
      "Hi there! How's your day going so far?",
      "Hey! Nice to meet you. What have you been up to lately?",
      "Hello! Did you do anything fun this weekend?",
    ],
    vocabulary: [
      { word: 'How\'s it going?', meaning: '最近怎么样？' },
      { word: 'Not bad', meaning: '还不错' },
      { word: 'Pretty busy', meaning: '挺忙的' },
      { word: 'Chill out', meaning: '放松一下' },
      { word: 'Catch up', meaning: '叙旧，聊聊近况' },
    ],
  },
  {
    id: 'restaurant',
    name: '餐厅点餐',
    nameEn: 'Restaurant Ordering',
    description: '模拟在餐厅点餐的场景，练习点菜、询问菜品、结账等表达',
    icon: 'KnifeFork',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly waiter/waitress at a nice restaurant. Help the customer with ordering, answer questions about the menu, make recommendations, and handle the bill naturally.',
    openingLines: [
      "Good evening! Welcome to our restaurant. Do you have a reservation?",
      "Hi there! Here's the menu. Can I get you started with something to drink?",
      "Welcome! Table for how many, please?",
    ],
    vocabulary: [
      { word: 'I\'d like to order...', meaning: '我想点...' },
      { word: 'What do you recommend?', meaning: '你推荐什么？' },
      { word: 'Could I have the bill?', meaning: '可以给我账单吗？' },
      { word: 'Medium rare', meaning: '三分熟（牛排）' },
      { word: 'It\'s on me', meaning: '我请客' },
    ],
  },
  {
    id: 'airport',
    name: '机场出行',
    nameEn: 'Airport Travel',
    description: '模拟机场场景，练习办理登机、安检、转机、询问信息等对话',
    icon: 'Airplane',
    difficulty: 'intermediate',
    systemPrompt: 'You are an airport staff member helping a traveler. Handle check-in, security questions, boarding gate information, transfer assistance, and other airport-related inquiries naturally.',
    openingLines: [
      "Good morning! May I see your passport and ticket, please?",
      "Hello! Where are you flying to today?",
      "Welcome! Are you checking any bags today?",
    ],
    vocabulary: [
      { word: 'Check-in counter', meaning: '值机柜台' },
      { word: 'Boarding pass', meaning: '登机牌' },
      { word: 'Departure gate', meaning: '登机口' },
      { word: 'Connecting flight', meaning: '转机航班' },
      { word: 'Customs declaration', meaning: '海关申报' },
    ],
  },
  {
    id: 'job_interview',
    name: '求职面试',
    nameEn: 'Job Interview',
    description: '模拟英语面试场景，练习自我介绍、回答问题、表达职业规划',
    icon: 'Briefcase',
    difficulty: 'advanced',
    systemPrompt: 'You are a professional hiring manager conducting a job interview in English. Ask about the candidate\'s background, experience, strengths, career goals, and provide realistic interview questions.',
    openingLines: [
      "Thank you for coming in today. Could you start by telling me a little about yourself?",
      "Great to meet you. First of all, walk me through your resume.",
      "Welcome! Let's start with why you're interested in this position.",
    ],
    vocabulary: [
      { word: 'Tell me about yourself', meaning: '介绍一下你自己' },
      { word: 'Strengths and weaknesses', meaning: '优势和劣势' },
      { word: 'Career goals', meaning: '职业目标' },
      { word: 'Team player', meaning: '有团队精神的人' },
      { word: 'Work under pressure', meaning: '在压力下工作' },
    ],
  },
  {
    id: 'shopping',
    name: '购物逛街',
    nameEn: 'Shopping',
    description: '练习购物时的英语对话，包括询问价格、尺码、颜色、试穿等',
    icon: 'ShoppingBag',
    difficulty: 'beginner',
    systemPrompt: 'You are a helpful salesperson in a clothing store. Help customers find items, answer questions about sizes, colors, prices, and offer suggestions naturally.',
    openingLines: [
      "Hi! Welcome! Is there anything specific you're looking for today?",
      "Hello! Can I help you find something? We just got new arrivals.",
      "Good afternoon! Would you like me to show you anything?",
    ],
    vocabulary: [
      { word: 'Do you have this in...?', meaning: '这个有...的吗？' },
      { word: 'Can I try this on?', meaning: '我可以试穿吗？' },
      { word: 'What size are you?', meaning: '你穿什么尺码？' },
      { word: 'It fits perfectly', meaning: '太合身了' },
      { word: 'Any discount?', meaning: '有折扣吗？' },
    ],
  },
  {
    id: 'travel',
    name: '旅游问路',
    nameEn: 'Travel & Directions',
    description: '练习旅游问路、景点咨询、酒店入住等出行场景英语',
    icon: 'Location',
    difficulty: 'intermediate',
    systemPrompt: 'You are a helpful local giving directions and travel advice to a tourist. Help with directions, attractions, transportation, hotel questions, and other travel-related conversations.',
    openingLines: [
      "Hi there! Are you a tourist? Need any help finding your way around?",
      "Hello! Looking for something fun to do in the city? I'd be happy to help.",
      "Good day! How can I assist you with your travels?",
    ],
    vocabulary: [
      { word: 'How do I get to...?', meaning: '我怎么去...？' },
      { word: 'Go straight ahead', meaning: '一直往前走' },
      { word: 'Turn left/right', meaning: '向左/右转' },
      { word: 'It\'s within walking distance', meaning: '走路就能到' },
      { word: 'Must-see attraction', meaning: '必看景点' },
    ],
  },
];

const GRAMMAR_CORRECTIONS: Record<string, { corrected: string; explanation: string }> = {
  'i am': { corrected: 'I am', explanation: '人称代词 I 永远大写' },
  'i ': { corrected: 'I ', explanation: '人称代词 I 永远大写' },
  'don\'t have': { corrected: 'don\'t have', explanation: '正确用法' },
  'he don\'t': { corrected: 'he doesn\'t', explanation: '第三人称单数用 doesn\'t' },
  'she don\'t': { corrected: 'she doesn\'t', explanation: '第三人称单数用 doesn\'t' },
  'we was': { corrected: 'we were', explanation: 'we 的过去式用 were' },
  'they was': { corrected: 'they were', explanation: 'they 的过去式用 were' },
  'i have went': { corrected: 'I have gone', explanation: '现在完成时用 gone 而不是 went' },
  'more better': { corrected: 'better', explanation: 'better 本身就是比较级，不需要 more' },
  'very good': { corrected: 'very good', explanation: '正确，但也可以用 excellent, great' },
};

const AI_RESPONSE_TEMPLATES: Record<string, Record<string, string[]>> = {
  daily_chat: {
    weather: [
      "Yeah, the weather has been really nice lately! Do you prefer sunny days or do you like it when it rains a little?",
      "I know right? Perfect weather for going out. Do you have any outdoor activities planned?",
      "Tell me about it! I wish it could stay like this all year round. What's your favorite season?",
    ],
    greeting: [
      "I'm doing great, thanks for asking! How about you — anything interesting happening this week?",
      "Pretty good! Just keeping busy. What about yourself? Have you been up to anything fun?",
      "Not bad at all! Thanks for asking. So, what's new with you?",
    ],
    hobbies: [
      "That sounds amazing! I'd love to try that sometime. How did you first get into it?",
      "Oh cool! I really enjoy that too. What's the best thing about it for you?",
      "Interesting! Do you do that often, or just on weekends?",
    ],
    food: [
      "Oh, that's one of my favorites! Do you usually cook it at home or order takeout?",
      "Yum! I could eat that every day. What's your go-to restaurant for that?",
      "Great choice! What do you like most about it?",
    ],
    default: [
      "That's really interesting! Tell me more about that.",
      "I see what you mean. What made you think about that?",
      "Got it. So, what do you think about... actually, what else is going on in your life?",
      "Sounds like you've been keeping busy! How do you feel about it?",
      "That's a great point. I hadn't thought about it that way before.",
    ],
  },
  restaurant: {
    drink: [
      "Absolutely! We have soda, iced tea, lemonade, and some local craft beers. What sounds good to you?",
      "Sure thing! Today we have a special on fresh orange juice, or our homemade lemonade is quite popular.",
      "Of course! Would you like something cold, or are you more in the mood for coffee or tea?",
    ],
    recommendation: [
      "Oh, our chef's specialty is the grilled salmon with vegetables — it's absolutely fantastic! Or if you prefer something meatier, the steak is always a hit.",
      "Great question! If this is your first time here, I'd definitely recommend the pasta carbonara. It's one of our most popular dishes.",
      "Hmm, it depends what you're in the mood for. Our burgers are amazing, but the salads are also really fresh and tasty.",
    ],
    order: [
      "Excellent choice! Would you like any sides with that? We have fries, salad, or roasted vegetables.",
      "Perfect! And how would you like that cooked — medium, medium well, or well done?",
      "Got it! Can I get you anything else to go with that, or is that all for now?",
    ],
    bill: [
      "Certainly! I'll be right back with your bill. Thank you for dining with us!",
      "Sure thing! Would you like to pay with cash or card today?",
      "Absolutely! And how was everything — was the meal to your liking?",
    ],
    default: [
      "Of course! What else can I help you with?",
      "Absolutely! Is there anything else you'd like to know?",
      "I'd be happy to help! Let me see...",
    ],
  },
  airport: {
    checkin: [
      "Certainly! May I see your passport, please? And do you have any bags to check in?",
      "No problem at all. Can I see your booking confirmation? Are you checking any luggage today?",
      "Right away! Just let me see your travel documents. And would you prefer a window or aisle seat?",
    ],
    gate: [
      "Your flight is boarding from Gate 15, which is just down this hallway to your left. It's about a 5-minute walk.",
      "Let me check... yes, you're at Gate B22. Take the escalator up one level and follow the signs.",
      "Gate 8 is currently assigned, but I'd recommend checking the screens when you get through security — sometimes gates change last minute.",
    ],
    transfer: [
      "For your connecting flight, you'll need to go through the transfer desk on Level 2. It's well signposted from here.",
      "Good question! You have about an hour and a half, so you should be fine. Just follow the orange 'Connecting Flights' signs.",
      "Since this is an international transfer, you'll need to go through immigration first. Don't worry, there's plenty of time!",
    ],
    security: [
      "Just remember to take out your laptop and any liquids over 100ml. The security line should move pretty quickly right now.",
      "Make sure you have all electronics easily accessible, and don't forget to remove your belt and shoes.",
      "It shouldn't take too long at this time of day. Have your boarding pass ready to scan!",
    ],
    default: [
      "I'd be happy to help you with that. Let me take a look...",
      "Of course! Here's what you need to do...",
      "No problem! Is there anything else I can assist you with today?",
    ],
  },
  job_interview: {
    background: [
      "That's quite an interesting journey! What was the biggest challenge you faced during that time?",
      "I see. So looking back, which experience has shaped you most professionally?",
      "Thank you for sharing that. What drew you to this particular field in the first place?",
    ],
    strengths: [
      "That's a great strength to have. Can you give me an example of when you've demonstrated that in the workplace?",
      "Excellent. How do you think this strength would benefit our team specifically?",
      "Impressive! And what would you say is an area where you're still looking to improve?",
    ],
    experience: [
      "Fascinating! Tell me about a project you're particularly proud of from that role.",
      "I'd love to hear more about that. What was the biggest challenge and how did you overcome it?",
      "That sounds like valuable experience. How would you apply what you learned there to this position?",
    ],
    why_company: [
      "Great answer! What do you know about our company culture and how do you see yourself fitting in?",
      "I appreciate that. So, what are you looking for in your next role that you're not getting in your current position?",
      "Glad to hear that! Where do you see yourself in five years, professionally speaking?",
    ],
    questions: [
      "That's a great question! Let me tell you a bit about our team structure...",
      "I'm glad you asked. Our onboarding process typically involves...",
      "Good one! The culture here is really collaborative. We encourage team members to...",
    ],
    default: [
      "That's a thoughtful answer. Could you elaborate on that a bit more?",
      "I see. And how does that translate to your day-to-day work?",
      "Interesting perspective. Tell me, what would you say is your greatest professional achievement?",
    ],
  },
  shopping: {
    looking: [
      "Great! We have a whole section of that over here. What style were you thinking — more casual or something dressier?",
      "Absolutely! Are you looking for something specific, or just browsing to see what catches your eye?",
      "Sure thing! We just got a new collection in. Any particular color or style you prefer?",
    ],
    size: [
      "Let me check for you! What size do you usually wear? We have sizes from XS to XL in most styles.",
      "Of course! Here — we have it in S, M, L, and XL. Which one would you like to try?",
      "No problem at all! If you're not sure about your size, I'd recommend trying the medium — it tends to run a bit large.",
    ],
    tryon: [
      "Certainly! The fitting rooms are right over there. Let me know if you need a different size!",
      "Of course! I'll hang that in the room for you. Need me to grab any other sizes or colors while you try?",
      "Absolutely! Take your time. And just so you know, we have a 14-day return policy if it doesn't work out.",
    ],
    price: [
      "That one is $59.99, but we're running a promotion today — buy one, get the second 50% off!",
      "It's currently priced at $89, but members get an extra 10% discount. Would you like to sign up for free?",
      "Let me check... yes, that's on sale this week for $39, down from $68. Great value!",
    ],
    default: [
      "Of course! Let me know if you have any other questions.",
      "I'm here to help! Take your time looking around.",
      "No problem at all! Is there anything else I can show you?",
    ],
  },
  travel: {
    directions: [
      "Ah, that's a great spot! It's actually pretty close — just walk two blocks straight, then turn right at the big clock tower. You'll see it on your left.",
      "Let me think... the easiest way is to take the subway Line 2 for three stops and get off at Central Station. From there it's a 5-minute walk.",
      "Sure! It's about a 15-minute walk from here. Head down this street until you reach the park, then cross over and... actually, I'll draw you a quick map!",
    ],
    attractions: [
      "Oh, you have to visit the Old Town! It's absolutely beautiful and full of history. And if you have time, the night market is really fun — great food too.",
      "Must-sees? Definitely the museum, and then take a walk along the river. If you're into art, there's a fantastic gallery near the cathedral.",
      "That depends on what you like! If you enjoy nature, the botanical gardens are stunning. If you're into shopping, the downtown area is where it's at.",
    ],
    transport: [
      "The best way to get around is definitely the subway — it's fast and cheap. A day pass costs $5 and you can use it on buses too.",
      "Taxis are quite affordable here, but I'd recommend using the ride-sharing app for better prices. Or if the weather's nice, renting a bike is really fun!",
      "Getting around is pretty easy! Most tourist spots are walkable, but for longer distances the bus system is reliable and easy to use.",
    ],
    hotel: [
      "Finding your hotel? Let me check the address... oh, it's just around the corner! Walk straight for 200 meters and it's on your right. You can't miss it.",
      "That hotel is in a great area! You can either take a 5-minute taxi ride, or if you don't mind walking, it's about 15 minutes through the park.",
      "Good choice — I've heard that hotel is lovely! Here's how to get there...",
    ],
    default: [
      "Happy to help! Is there anything else you'd like to know about the city?",
      "Enjoy your stay! And if you get lost, just ask — everyone here is really friendly.",
      "No problem at all! Have a wonderful time exploring!",
    ],
  },
};

@Injectable()
export class EnglishConversationService {
  getScenes(): ConversationScene[] {
    return SCENES;
  }

  getSceneById(id: string): ConversationScene | undefined {
    return SCENES.find(s => s.id === id);
  }

  createNewConversation(sceneId: string): ConversationState {
    const scene = this.getSceneById(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    const openingLine = scene.openingLines[Math.floor(Math.random() * scene.openingLines.length)];

    return {
      sceneId: scene.id,
      sceneName: scene.name,
      difficulty: scene.difficulty,
      messages: [
        {
          id: 1,
          role: 'ai',
          content: openingLine,
          translation: this.translate(openingLine),
          usefulPhrases: this.extractPhrases(openingLine, scene),
          timestamp: Date.now(),
        },
      ],
      round: 1,
      totalWords: 0,
      learnedPhrases: [],
    };
  }

  async chat(request: ChatRequest): Promise<ConversationState> {
    const { userMessage, currentState } = request;

    if (!userMessage || !userMessage.trim()) {
      throw new Error('请输入消息');
    }

    const trimmedMessage = userMessage.trim();
    const scene = this.getSceneById(currentState.sceneId);

    const correction = this.checkGrammar(trimmedMessage);
    const suggestions = this.generateSuggestions(trimmedMessage, scene);

    const userMsg: ConversationMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedMessage,
      correction: correction ? correction.corrected : undefined,
      suggestions: suggestions,
      timestamp: Date.now(),
    };

    const aiResponse = this.generateAiResponse(trimmedMessage, currentState, scene);
    const aiMsg: ConversationMessage = {
      id: Date.now() + 1,
      role: 'ai',
      content: aiResponse,
      translation: this.translate(aiResponse),
      usefulPhrases: this.extractPhrases(aiResponse, scene),
      timestamp: Date.now(),
    };

    const newMessages = [...currentState.messages, userMsg, aiMsg];
    const newPhrases = [
      ...(currentState.learnedPhrases || []),
      ...(aiMsg.usefulPhrases || []),
    ].slice(-20);

    return {
      ...currentState,
      messages: newMessages,
      round: currentState.round + 1,
      totalWords: (currentState.totalWords || 0) + trimmedMessage.split(/\s+/).length,
      learnedPhrases: newPhrases,
    };
  }

  private checkGrammar(text: string): { corrected: string; explanation: string } | null {
    for (const [pattern, correction] of Object.entries(GRAMMAR_CORRECTIONS)) {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(text) && text.toLowerCase() !== correction.corrected.toLowerCase()) {
        const corrected = text.replace(regex, correction.corrected);
        if (corrected !== text) {
          return { corrected, explanation: correction.explanation };
        }
      }
    }

    if (/^(i |im |i'm )/i.test(text)) {
      const corrected = 'I' + text.substring(1);
      return { corrected, explanation: '人称代词 I 永远大写' };
    }

    if (!/[.!?]$/.test(text) && text.split(/\s+/).length > 3) {
      return { corrected: text + '.', explanation: '句子结尾需要标点符号' };
    }

    return null;
  }

  private generateSuggestions(userMessage: string, scene?: ConversationScene): string[] {
    const suggestions: string[] = [];
    const lower = userMessage.toLowerCase();

    if (scene?.vocabulary) {
      const related = scene.vocabulary
        .filter(v => !lower.includes(v.word.toLowerCase()))
        .slice(0, 3);
      related.forEach(v => suggestions.push(v.word));
    }

    if (lower.includes('?') || lower.includes('how') || lower.includes('what')) {
      suggestions.push("That's a great question! Let me tell you...");
    }

    if (lower.includes('thank')) {
      suggestions.push("You're welcome!");
      suggestions.push("No problem at all!");
      suggestions.push("Anytime!");
    }

    if (suggestions.length === 0) {
      suggestions.push("Could you tell me more about that?");
      suggestions.push("That's really interesting!");
      suggestions.push("I completely agree with you.");
    }

    return suggestions.slice(0, 3);
  }

  private generateAiResponse(userMessage: string, state: ConversationState, scene?: ConversationScene): string {
    const lower = userMessage.toLowerCase();
    const sceneId = scene?.id || 'daily_chat';
    const templates = AI_RESPONSE_TEMPLATES[sceneId] || AI_RESPONSE_TEMPLATES.daily_chat;

    let category = 'default';

    if (/weather|sunny|rain|cloudy|cold|hot|warm|cool|temperature/.test(lower)) category = 'weather';
    else if (/hi|hello|hey|how are you|how's it going|good (morning|afternoon|evening)/.test(lower)) category = 'greeting';
    else if (/like|enjoy|love|hobby|interest|favorite|free time|weekend/.test(lower)) category = 'hobbies';
    else if (/food|eat|restaurant|hungry|delicious|taste|dinner|lunch|breakfast|meal/.test(lower)) category = 'food';
    else if (/drink|water|juice|soda|coffee|tea|beer|wine/.test(lower)) category = 'drink';
    else if (/recommend|suggest|advice|what should|which one/.test(lower)) category = 'recommendation';
    else if (/order|get|have|want|would like|i'll take/.test(lower)) category = 'order';
    else if (/bill|check|pay|money|cash|card/.test(lower)) category = 'bill';
    else if (/check.?in|passport|ticket|luggage|bag/.test(lower)) category = 'checkin';
    else if (/gate|boarding|where is|terminal/.test(lower)) category = 'gate';
    else if (/transfer|connecting|next flight|layover/.test(lower)) category = 'transfer';
    else if (/security|screening|belt|shoes|laptop|liquid/.test(lower)) category = 'security';
    else if (/background|tell me about yourself|experience|work|before/.test(lower)) category = 'background';
    else if (/strength|weakness|good at|skill|ability/.test(lower)) category = 'strengths';
    else if (/project|achievement|accomplish|proud/.test(lower)) category = 'experience';
    else if (/why|your company|this position|role|apply/.test(lower)) category = 'why_company';
    else if (/question|ask you|wondering|curious/.test(lower)) category = 'questions';
    else if (/looking|find|browse|shopping|looking for/.test(lower)) category = 'looking';
    else if (/size|large|medium|small|xl|xs|fit/.test(lower)) category = 'size';
    else if (/try|try on|fit|fitting room/.test(lower)) category = 'tryon';
    else if (/price|cost|how much|expensive|cheap|discount|sale/.test(lower)) category = 'price';
    else if (/direction|where|how to get|map|address|far|walk|bus|subway/.test(lower)) category = 'directions';
    else if (/attraction|tourist|visit|place|see|sightseeing|must.?see/.test(lower)) category = 'attractions';
    else if (/transport|taxi|bus|subway|train|bike|rent|ride/.test(lower)) category = 'transport';
    else if (/hotel|stay|check.?in|check.?out|room|booked|reservation/.test(lower)) category = 'hotel';

    const responses = templates[category] || templates.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private translate(text: string): string {
    const translations: Record<string, string> = {
      "Hi there! How's your day going so far?": "嗨！你今天过得怎么样？",
      "Hey! Nice to meet you. What have you been up to lately?": "嘿！很高兴认识你。你最近在忙什么？",
      "Hello! Did you do anything fun this weekend?": "你好！这个周末你有做什么好玩的事吗？",
      "Good evening! Welcome to our restaurant. Do you have a reservation?": "晚上好！欢迎光临我们餐厅。您有预订吗？",
      "Hi there! Here's the menu. Can I get you started with something to drink?": "您好！这是菜单。您想先来点什么喝的吗？",
      "Welcome! Table for how many, please?": "欢迎光临！请问几位？",
      "Good morning! May I see your passport and ticket, please?": "早上好！请出示您的护照和机票好吗？",
      "Hello! Where are you flying to today?": "您好！您今天要飞往哪里？",
      "Welcome! Are you checking any bags today?": "欢迎！今天您有行李要托运吗？",
      "Thank you for coming in today. Could you start by telling me a little about yourself?": "感谢您今天来面试。可以先简单介绍一下自己吗？",
      "Great to meet you. First of all, walk me through your resume.": "很高兴见到你。首先，请简单介绍一下你的简历。",
      "Welcome! Let's start with why you're interested in this position.": "欢迎！我们先从你为什么对这个职位感兴趣开始吧。",
      "Hi! Welcome! Is there anything specific you're looking for today?": "您好！欢迎光临！今天有什么特别想找的吗？",
      "Hello! Can I help you find something? We just got new arrivals.": "您好！需要帮忙找点什么吗？我们刚到了新品。",
      "Good afternoon! Would you like me to show you anything?": "下午好！需要我给您推荐什么吗？",
      "Hi there! Are you a tourist? Need any help finding your way around?": "您好！您是游客吗？需要帮忙指路吗？",
      "Hello! Looking for something fun to do in the city? I'd be happy to help.": "您好！想在城里找点好玩的吗？我很乐意帮忙。",
      "Good day! How can I assist you with your travels?": "您好！有什么可以帮您的吗？",
    };

    return translations[text] || '';
  }

  private extractPhrases(text: string, scene?: ConversationScene): { phrase: string; meaning: string }[] {
    if (!scene?.vocabulary) return [];

    const phrases: { phrase: string; meaning: string }[] = [];
    const lowerText = text.toLowerCase();

    for (const item of scene.vocabulary) {
      if (lowerText.includes(item.word.toLowerCase())) {
        phrases.push(item);
      }
    }

    return phrases.slice(0, 3);
  }
}
