export interface DivinationAnswer {
  title: string
  content: string
  category: 'love' | 'career' | 'decision' | 'comfort' | 'growth' | 'wisdom'
  emoji: string
  tone: 'warm' | 'encouraging' | 'reflective' | 'hopeful' | 'mysterious'
}

export interface SpecialNumber {
  number: number
  title: string
  content: string
  emoji: string
  origin: string
}

export const specialNumbers: SpecialNumber[] = [
  {
    number: 1,
    title: '万物之始',
    content: '你选择了1，这是一切的起点。一元复始，万象更新。此刻的你正站在一个全新的起点上，无论是感情、事业还是生活，都充满了无限可能。不必害怕未知，因为第一步总是最难的，但你已经准备好了。相信自己的直觉，勇敢迈出那一步吧。',
    emoji: '🌱',
    origin: '《道德经》：道生一，一生二，二生三，三生万物'
  },
  {
    number: 7,
    title: '神秘之数',
    content: '数字7在东西方文化中都具有特殊意义。一周有七天，彩虹有七色，音阶有七音。选择7，暗示你内心正寻求某种答案或平衡。这个数字提醒你：有些事情需要时间沉淀，有些答案不会立刻显现。保持耐心，答案会在第七个瞬间浮现。',
    emoji: '🌈',
    origin: '东西方文化中的幸运数字，象征完美与神秘'
  },
  {
    number: 8,
    title: '财运亨通',
    content: '8谐音"发"，是中国传统文化中最受欢迎的数字之一。选择8，代表你对财富、成功或某种成果的渴望。但真正的"发"不仅是物质上的，更是内心的丰盈。保持开放的心态，机遇正在向你靠近。记住：厚德载物，财亦随之。',
    emoji: '💰',
    origin: '谐音"发"，象征财富与繁荣'
  },
  {
    number: 9,
    title: '长久圆满',
    content: '9是最大的个位数，谐音"久"，象征长久与圆满。选择9，说明你内心渴望某种关系或状态能够持久。但也要明白，月圆则缺，水满则溢。一切事物达到极致后都会迎来新的开始。珍惜当下，就是对"长久"最好的诠释。',
    emoji: '🌸',
    origin: '谐音"久"，古代帝王以九为尊'
  },
  {
    number: 52,
    title: '心意初萌',
    content: '52谐音"我爱"，是爱意的萌芽。选择这个数字，说明你心中正萌生某种情感——可能是对某个人的喜欢，也可能是对某件事的热爱。这份心意还很娇嫩，需要细心呵护。不必急于表达，让它自然生长，是花总会绽放。',
    emoji: '💗',
    origin: '网络数字谐音文化'
  },
  {
    number: 100,
    title: '满分期待',
    content: '100分是满分，选择100说明你对自己或某件事有着很高的期待。追求完美不是坏事，但也要学会接受不完美。人生不必处处满分，60分的及格线同样可以走出精彩的人生。对自己温柔一点，你已经做得很好了。',
    emoji: '💯',
    origin: '满分象征，代表完美与圆满'
  },
  {
    number: 131,
    title: '一心一意',
    content: '131谐音"一生一"，象征专一与执着。你是一个专注的人，一旦认定了某个人或某件事，就会全力以赴。这份坚持是宝贵的品质，但也要注意：有时候，适时放手也是一种智慧。方向比坚持更重要，记得偶尔抬头看看路。',
    emoji: '💝',
    origin: '数字谐音文化'
  },
  {
    number: 334,
    title: '三生三世',
    content: '334谐音"三生三世"，带有浪漫的宿命感。选择这个数字，说明你对缘分、因果或某种深层连接有着特殊的感知。有些人和事，似乎跨越了时间依然存在。珍惜今生的相遇，因为那可能是前世的约定，也是来世的伏笔。',
    emoji: '🌙',
    origin: '源自"三生三世十里桃花"的浪漫意象'
  },
  {
    number: 365,
    title: '日复一日',
    content: '365是一年的天数，代表时间的循环与积累。选择这个数字，说明你正在经历一个漫长的过程——可能是一段感情的培养，也可能是一项事业的耕耘。不要小看每一天的努力，365天的坚持足以让任何事情发生质变。今天的你，比昨天更进一步。',
    emoji: '📅',
    origin: '一年365天，时间的度量'
  },
  {
    number: 520,
    title: '我爱你',
    content: '520是最经典的告白数字。如果你正暗恋某个人，这是宇宙在给你勇气——去表白吧，成功的概率比你想象的高。如果你已有伴侣，这是一个温柔的提醒：别忘了对身边的人说声"我爱你"。爱，需要表达，也需要回应。愿你被爱，也敢爱。',
    emoji: '❤️',
    origin: '520谐音"我爱你"，网络情人节'
  },
  {
    number: 521,
    title: '我愿意',
    content: '521谐音"我愿意"，是520的回应。如果你在等待某个答案，这个数字暗示：答案很可能是肯定的。如果你在纠结是否答应某件事，问问自己的内心——真正的"愿意"不需要勉强，它是一种即使知道不完美也依然选择的坚定。',
    emoji: '💍',
    origin: '521谐音"我愿意"，520的呼应'
  },
  {
    number: 666,
    title: '顺风顺水',
    content: '666是"溜溜溜"的谐音，代表一切顺利。选择这个数字，说明你近期的运势正在上升。但也要记住，顺境时更需要保持谦逊和清醒。越是顺利，越要感恩，越要帮助他人。好运不是偶然，它是你之前所有努力的累积回报。',
    emoji: '🍀',
    origin: '666谐音"溜溜溜"，游戏文化延伸至日常生活'
  },
  {
    number: 777,
    title: '幸运眷顾',
    content: '777在西方是老虎机的大奖组合，象征极度幸运。同时三个7叠加强化了神秘色彩。你最近可能会有意想不到的好事发生——可能是某个机会，也可能是某个人的出现。但幸运只会眷顾有准备的人，保持敏锐的感知，不要让机会从指缝溜走。',
    emoji: '🎰',
    origin: '西方老虎机大奖数字，三重幸运'
  },
  {
    number: 888,
    title: '财源广进',
    content: '三个8叠加强化了"发"的能量。这是一个非常吉利的数字，预示着财富或资源的汇聚。但真正的财富不止是金钱——健康的身体、和睦的家庭、真挚的友谊，这些都是人生的财富。当你内心富足时，外在的财富自然会被吸引而来。',
    emoji: '🧧',
    origin: '888谐音"发发发"，三重财运'
  },
  {
    number: 999,
    title: '天长地久',
    content: '999是三个9，极致的"久"。选择这个数字，说明你对某种永恒有着深深的向往。但这个数字也提醒你：世间唯一不变的就是变化本身。与其追求外在的长久，不如修炼内心的笃定。当你的心安稳了，一切变化都只是风景。',
    emoji: '🕊️',
    origin: '999谐音"久久久"，三重长久'
  },
  {
    number: 1314,
    title: '一生一世',
    content: '1314是终极浪漫数字，谐音"一生一世"。如果你在问感情，这是最积极的信号——你们的缘分很深，值得珍惜和守护。但"一生一世"不是一句承诺，而是每一天的选择。它是柴米油盐中的坚守，是风雨来临时的携手。愿你找到那个愿意与你共度一生的人。',
    emoji: '💖',
    origin: '1314谐音"一生一世"，最经典的爱情数字'
  }
]

export const divinationPool: DivinationAnswer[] = [
  {
    title: '静待花开',
    content: '你现在的状态就像春天播下的种子，表面看似平静，土壤下却正在发生翻天覆地的变化。不要着急，每颗种子都有自己的发芽时间。继续浇水、继续相信，属于你的春天会来的。',
    category: 'comfort',
    emoji: '🌻',
    tone: 'warm'
  },
  {
    title: '勇敢转身',
    content: '有时候，坚持是一种美德；但有时候，放手才是真正的勇敢。如果你正在纠结是否要离开某个人、某份工作、某种状态，这个答案告诉你：是时候了。转身不是失败，而是为了遇见更好的自己。',
    category: 'decision',
    emoji: '🦋',
    tone: 'encouraging'
  },
  {
    title: '用心经营',
    content: '没有什么关系是理所当然的。爱情需要经营，友谊需要维护，亲情需要表达。如果你对某段关系感到迷茫，不要只是等待对方改变——先从自己做起，一个小小的主动，可能就是关系的转折点。',
    category: 'love',
    emoji: '🤝',
    tone: 'warm'
  },
  {
    title: '厚积薄发',
    content: '你可能觉得自己努力了很久却没有看到成果，但请相信：所有的付出都不会白费。竹子在前三年只长几厘米，但第四年开始每天长几十厘米。你现在正处于扎根的阶段，再坚持一下，爆发期就在前方。',
    category: 'career',
    emoji: '🎋',
    tone: 'encouraging'
  },
  {
    title: '听从内心',
    content: '你已经知道答案了，对吗？只是不敢承认而已。那个深夜里反复出现在你脑海中的想法，那个你一直想做却又不敢做的决定——那就是你真正想要的。别再用"理智"欺骗自己，人生太短，要为自己而活。',
    category: 'decision',
    emoji: '🗝️',
    tone: 'reflective'
  },
  {
    title: '缘分天定',
    content: '有些人注定只是过客，有些缘分强求不来。如果那个人已经离开，请相信：不是你不够好，而是他/她不是对的人。真正的缘分不需要你费力去追，它会自然地出现在你面前，让你觉得"原来就是这样"。',
    category: 'love',
    emoji: '🌠',
    tone: 'warm'
  },
  {
    title: '自我和解',
    content: '你对自己太苛刻了。总是看到自己的不足，却忽略了已经拥有的一切。接受自己的不完美，原谅过去的自己，允许自己偶尔的脆弱和失败。你不需要成为最好的那个，你只需要成为你自己。',
    category: 'growth',
    emoji: '🌿',
    tone: 'warm'
  },
  {
    title: '行动第一',
    content: '想太多是你最大的敌人。完美主义让你迟迟不敢开始，但完成比完美更重要。先做一个60分的版本，再慢慢迭代到80分、90分。站在岸上学不会游泳，跳进去，你自然会找到方向。',
    category: 'career',
    emoji: '🚀',
    tone: 'encouraging'
  },
  {
    title: '知足常乐',
    content: '你总是在追求更多、更好、更远，却忘了看看已经拥有的。健康的身体，温暖的家，还有那些默默爱着你的人——这些才是人生最珍贵的财富。学会感恩，你会发现，你已经拥有了别人梦寐以求的一切。',
    category: 'wisdom',
    emoji: '🍵',
    tone: 'reflective'
  },
  {
    title: '断舍离',
    content: '你的生活被太多东西塞满了——无用的物品、消耗你的人、无意义的社交。是时候来一场彻底的清理了。扔掉那些让你犹豫的东西，远离那些让你感到疲惫的人。人生需要留白，空出来的位置，才能装下更好的未来。',
    category: 'growth',
    emoji: '🍃',
    tone: 'hopeful'
  },
  {
    title: '先爱自己',
    content: '在爱别人之前，请先学会爱自己。你总是把别人的需求放在第一位，却忘了照顾自己的情绪。一个连自己都不爱的人，怎么可能真正地去爱别人？从今天开始，把自己放在优先级的第一位，这不叫自私，这叫自爱。',
    category: 'love',
    emoji: '🌷',
    tone: 'warm'
  },
  {
    title: '柳暗花明',
    content: '你现在可能正处于人生的低谷，觉得怎么也看不到希望。但你知道吗？谷底也是离反弹最近的地方。再撑一下，下一个转弯处，可能就是柳暗花明。没有哪个冬天不会过去，没有哪个春天不会到来。',
    category: 'comfort',
    emoji: '🌅',
    tone: 'hopeful'
  },
  {
    title: '道阻且长',
    content: '你选择的这条路注定不容易，但既然是自己选的，就要有走下去的勇气。成功从来不是一蹴而就的，它藏在每一个平凡日子的努力里。路上会有风雨，会有泥泞，但终点的风景，值得你所有的付出。',
    category: 'career',
    emoji: '⛰️',
    tone: 'encouraging'
  },
  {
    title: '难得糊涂',
    content: '有些事情不必太较真，有些话语不必太放在心上。水至清则无鱼，人至察则无徒。适当的"糊涂"是一种人生智慧，它能让你少很多烦恼。睁一只眼闭一只眼，人生反而更通透。',
    category: 'wisdom',
    emoji: '🙈',
    tone: 'reflective'
  },
  {
    title: '破茧成蝶',
    content: '你现在的痛苦就像毛毛虫在茧里挣扎，感觉窒息、看不到出路。但你要知道，这是蜕变的必经之路。每一个让你痛苦的瞬间，都是在为你长出翅膀积蓄力量。坚持住，很快你就能破茧而出，飞向更广阔的天空。',
    category: 'growth',
    emoji: '🦋',
    tone: 'hopeful'
  },
  {
    title: '当下即是',
    content: '你总在怀念过去，或者焦虑未来，却忘了唯一真实的只有现在。过去已经过去，未来还未来临。与其在回忆和担心中消耗自己，不如好好地活在当下。喝好眼前这杯茶，做好手上这件事，珍惜身边这个人。',
    category: 'wisdom',
    emoji: '☯️',
    tone: 'reflective'
  },
  {
    title: '双向奔赴',
    content: '真正的感情从来不是单方面的付出。如果你感觉这段关系里只有你在努力，那是时候停下来了。好的关系应该是双向奔赴，你走一步，对方也走一步。如果他/她一直在原地，那你也不必一个人跑完全程。',
    category: 'love',
    emoji: '💞',
    tone: 'reflective'
  },
  {
    title: '贵人相助',
    content: '你最近可能会遇到一个对你帮助很大的人——可能是职场上的导师，也可能是生活中的贵人。保持谦逊和开放，主动结识不同领域的人。贵人不会从天而降，但他/她可能就藏在你下一次主动打招呼里。',
    category: 'career',
    emoji: '👼',
    tone: 'hopeful'
  },
  {
    title: '独处时光',
    content: '你太久没有好好和自己相处了。试着给自己一些独处的时间，一个人散步，一个人吃饭，一个人看电影。在人群中的喧嚣会让你忘记自己真正想要什么，只有在独处时，你才能听到内心的声音。',
    category: 'growth',
    emoji: '🌙',
    tone: 'warm'
  },
  {
    title: '顺其自然',
    content: '有些事情你越用力，反而越抓不住。就像手里的沙子，握得越紧，漏得越快。学会顺其自然，该是你的终究是你的，不是你的强求也没用。放下控制欲，反而可能得到意想不到的结果。',
    category: 'wisdom',
    emoji: '🌊',
    tone: 'reflective'
  },
  {
    title: '失而复得',
    content: '你可能正在经历某种失去——失去一个人、失去一份工作、失去一个机会。但要相信，所有的失去都是为了给更好的腾位置。现在觉得天都要塌下来的事情，半年后回头看，可能只是人生中一个小小的转折点。',
    category: 'comfort',
    emoji: '🌈',
    tone: 'hopeful'
  },
  {
    title: '真诚待人',
    content: '套路或许能赢得一时，但真诚才能赢得长久。如果你在纠结要不要对某个人坦白，答案是肯定的。即使结果可能不完美，但至少你不会后悔。真诚的人也许会吃小亏，但永远不会输大的。',
    category: 'love',
    emoji: '💎',
    tone: 'warm'
  },
  {
    title: '韬光养晦',
    content: '现在不是出风头的时候。沉下心来，默默积累，等待一个合适的时机。锋芒毕露的人往往走不远，真正厉害的人，都懂得在适当的时候隐藏自己的光芒。等你准备好了，整个世界都会为你让路。',
    category: 'career',
    emoji: '🌑',
    tone: 'mysterious'
  },
  {
    title: '保持好奇',
    content: '是什么时候开始，你对这个世界不再好奇了？工作、生活、日常的琐碎磨平了你的棱角，也让你失去了探索的欲望。试着重新找回那个对一切都充满好奇的自己——学一件新东西，去一个没去过的地方，认识一个有趣的陌生人。',
    category: 'growth',
    emoji: '🔮',
    tone: 'mysterious'
  },
  {
    title: '家和万事兴',
    content: '近期你的重心应该放在家庭上。无论在外多忙多累，家永远是你的港湾。给家里打个电话，和父母吃顿饭，陪孩子玩一会儿。这些看似平凡的日常，其实是人生最坚实的根基。家和了，一切都会顺起来。',
    category: 'wisdom',
    emoji: '🏡',
    tone: 'warm'
  },
  {
    title: '勇敢说不',
    content: '你最大的问题是不懂得拒绝。总是勉强自己去做不想做的事，去见不想见的人。从今天开始，练习说"不"。拒绝不是得罪人，而是尊重自己的边界。当你学会了说不，你会发现，你的时间和精力突然变得充裕起来。',
    category: 'growth',
    emoji: '🛡️',
    tone: 'encouraging'
  },
  {
    title: '旧情难忘',
    content: '你心里还有一个放不下的人，对吗？那个人可能已经离开很久了，但你依然会在某个瞬间想起他/她。怀念不是错，但不要让过去影响现在。如果真的放不下，就勇敢去争取一次；如果争取不到，就彻底翻篇。人生要向前走，不能总回头。',
    category: 'love',
    emoji: '📮',
    tone: 'reflective'
  },
  {
    title: '财运将至',
    content: '你最近可能会有一笔意外之财——可能是项目奖金，可能是一个兼职机会，也可能是朋友突然还了很久之前的借款。但不要指望一夜暴富，真正的财富是细水长流的积累。合理规划你的财务，好运会接二连三地到来。',
    category: 'career',
    emoji: '💸',
    tone: 'hopeful'
  },
  {
    title: '拥抱变化',
    content: '你害怕改变，对吗？待在舒适区里虽然安全，但也意味着不会成长。变化可能会让你暂时感到不安，但它同时也带来新的可能。拥抱变化，接受不确定性，你会发现自己比想象中更强大、更有韧性。',
    category: 'growth',
    emoji: '🔄',
    tone: 'encouraging'
  },
  {
    title: '言多必失',
    content: '近期你要特别注意自己的言语。祸从口出，说者无意听者有心。在情绪激动的时候不要做决定，在气头上不要说狠话。如果不确定该不该说，那就不说。沉默有时候是最有力的表达，也是最聪明的选择。',
    category: 'wisdom',
    emoji: '🤫',
    tone: 'mysterious'
  },
  {
    title: '相由心生',
    content: '你的外在状态是内心的投射。如果你最近看起来很疲惫、很焦虑，那说明你的内心需要好好休息了。相由心生，境由心转。先调整好心态，外在的一切自然会跟着好起来。从今天开始，早睡一小时，微笑多一点。',
    category: 'comfort',
    emoji: '😊',
    tone: 'warm'
  },
  {
    title: '水到渠成',
    content: '不要急于求成，很多事情都需要时间的发酵。你只需要做好当下能做的，剩下的交给时间。当你做了足够的准备，机会自然会找上门来。不要焦虑结果，专注过程，该来的总会来。',
    category: 'career',
    emoji: '🌾',
    tone: 'hopeful'
  },
  {
    title: '物以类聚',
    content: '你身边的人决定了你的层次。审视一下你的朋友圈——那些让你感到舒服、给你正能量的人，要多交往；那些消耗你、打击你、充满负能量的人，要适当远离。你想成为什么样的人，就和什么样的人在一起。',
    category: 'wisdom',
    emoji: '👥',
    tone: 'reflective'
  },
  {
    title: '意外之喜',
    content: '接下来的一周，你会收到一个惊喜。可能是来自某个人的消息，可能是一个等待已久的好消息，也可能只是一顿特别好吃的饭。保持对生活的期待，美好往往发生在你没有刻意准备的时候。',
    category: 'comfort',
    emoji: '🎁',
    tone: 'mysterious'
  },
  {
    title: '三思而行',
    content: '你最近可能要做一个重要的决定，不要急，慢慢来。这个决定可能会影响你接下来很长一段时间的人生轨迹。多听不同的意见，多角度思考，但最终的决定要自己做。一旦做出决定，就不要后悔，坚定地走下去。',
    category: 'decision',
    emoji: '⚖️',
    tone: 'reflective'
  },
  {
    title: '初心勿忘',
    content: '走得太远，不要忘了为什么出发。你现在做的事情，还和当初的梦想一致吗？如果答案是否定的，是时候停下来思考一下了。人生没有白走的路，但有些弯路可以避免。回归初心，你会重新找到前行的动力。',
    category: 'growth',
    emoji: '🌠',
    tone: 'reflective'
  },
  {
    title: '宁缺毋滥',
    content: '不管是感情还是工作，都不要因为着急而将就。不合适的人，在一起只会互相消耗；不喜欢的工作，只会让你每天都在煎熬。宁可多等一等，也不要把自己随便交出去。好的东西值得等待，对的人值得相遇。',
    category: 'decision',
    emoji: '💫',
    tone: 'encouraging'
  },
  {
    title: '苦尽甘来',
    content: '你已经吃了很多苦了，对吗？但请再坚持一下，甜的日子就要来了。所有的磨难都是有意义的，它们让你变得更坚强、更成熟、更懂得珍惜。吃过苦的人，才更能品味甜的滋味。你的好日子，正在路上。',
    category: 'comfort',
    emoji: '🍯',
    tone: 'hopeful'
  },
  {
    title: '君子之交',
    content: '真正的朋友不需要天天见面、时时联系。即使很久不聊天，见面时依然可以谈笑风生；即使平时不刻意问候，有事时随叫随到。不要为了维持表面的关系而累了自己，懂你的人自然懂，不懂你的人不值得。',
    category: 'wisdom',
    emoji: '🍻',
    tone: 'warm'
  },
  {
    title: '机不可失',
    content: '有一个机会正在向你靠近，你可能已经察觉到了，但因为害怕失败而犹豫不决。不要让恐惧打败你，这个机会不会等你太久。最坏的结果不过是回到原点，但如果成功了呢？赌一把，你不会后悔的。',
    category: 'decision',
    emoji: '⚡',
    tone: 'encouraging'
  },
  {
    title: '如梦初醒',
    content: '你可能很快会对某件事、某个人有一个全新的认识。曾经想不通的事情，会在某个瞬间豁然开朗。这种顿悟的感觉就像从梦中醒来，虽然有点恍惚，但整个人会变得通透。保持开放的心态，让智慧自然流入。',
    category: 'wisdom',
    emoji: '💡',
    tone: 'mysterious'
  },
  {
    title: '安全感',
    content: '你一直在从别人身上寻找安全感，但其实真正的安全感只能自己给。经济独立、精神独立，你就不会害怕任何人的离开。从今天开始，专注于提升自己，而不是等待别人来爱你。当你成为自己的太阳，走到哪里都有光。',
    category: 'love',
    emoji: '☀️',
    tone: 'encouraging'
  },
  {
    title: '慢即是快',
    content: '你总在赶路，总觉得时间不够用。但人生不是一场速度比赛，而是一场体验之旅。放慢脚步，你会看到之前忽略的风景；静下心来，你会听到内心真正的声音。有时候，走得慢一点，反而能更早到达终点。',
    category: 'wisdom',
    emoji: '🐢',
    tone: 'reflective'
  },
  {
    title: '心诚则灵',
    content: '你许的愿望正在被听见。但许愿不是坐等奇迹，而是带着信念去行动。相信美好会发生，并且为之付出努力，宇宙才会回应你的期待。保持一颗虔诚的心，同时迈开双脚往前走，你想要的终会到来。',
    category: 'comfort',
    emoji: '🙏',
    tone: 'mysterious'
  },
  {
    title: '及时止损',
    content: '有些事情，坚持下去只会让你损失更多。不管是一段错误的感情，还是一个看不到希望的项目，及时止损是最高级的智慧。不要因为不甘心已经投入的成本，而搭上更多的时间和精力。沉没成本不是成本，未来才是。',
    category: 'decision',
    emoji: '✂️',
    tone: 'reflective'
  },
  {
    title: '意外重逢',
    content: '你可能会在不久的将来偶遇一个很久没见的人——可能是老朋友，可能是旧恋人，也可能是某个曾经对你很重要的人。这次重逢可能会带来一些新的故事，也可能只是点头之交，但无论如何，它都是一份值得期待的缘分。',
    category: 'love',
    emoji: '🚶‍♀️',
    tone: 'mysterious'
  },
  {
    title: '谦虚低调',
    content: '近期切忌张扬。即使取得了一些成绩，也不要四处炫耀。树大招风，人怕出名。保持谦虚和低调，默默做好自己的事。真正厉害的人，从不显山露水，但他们的光芒，所有人都能看见。',
    category: 'career',
    emoji: '🎭',
    tone: 'mysterious'
  },
  {
    title: '身心合一',
    content: '你的身体在发出警告了。最近是不是总觉得累？睡眠不好，食欲不振，情绪低落？这是身体在提醒你：该休息了。不要等病倒了才开始重视健康，身体是革命的本钱。今晚早点睡，明天起来跑跑步，比什么都管用。',
    category: 'comfort',
    emoji: '🧘',
    tone: 'warm'
  },
  {
    title: '顺其自然',
    content: '你现在最需要的是"允许"——允许自己悲伤，允许自己犯错，允许自己不完美。人生没有标准答案，也不需要每一步都走对。把自己从"应该"中解放出来，去做你"想做"的事。当你不再和自己较劲，很多问题自然就解决了。',
    category: 'growth',
    emoji: '🕊️',
    tone: 'warm'
  },
  {
    title: '贵人指路',
    content: '你现在遇到的困惑，其实有人可以帮你解答。不要闭门造车，主动去请教比你经验丰富的人。一句指点，可能让你少走很多弯路。但也要有自己的判断，别人的建议只是参考，最终的路还是要自己走。',
    category: 'career',
    emoji: '🧭',
    tone: 'hopeful'
  },
  {
    title: '如人饮水',
    content: '你的生活过得好不好，只有你自己知道。不要活在别人的眼光里，也不要用别人的标准来衡量自己。朋友圈里的精致生活都是演出来的，真实的日子是关起门来过的。如人饮水，冷暖自知，你开心就好。',
    category: 'wisdom',
    emoji: '🍶',
    tone: 'reflective'
  },
  {
    title: '好事多磨',
    content: '一件事如果太顺利，你反而要小心；如果经历了一些波折，那结果往往不会太差。好事多磨，磨的不是事，是人。经过这些磨折，你会更珍惜得到的一切，也更有能力守住这份美好。再等等，好饭不怕晚。',
    category: 'comfort',
    emoji: '🍲',
    tone: 'warm'
  },
  {
    title: '破而后立',
    content: '不打破旧的，就建不起新的。你现在可能正在经历某种"破坏"——旧的关系结束了，旧的模式失效了，旧的信仰崩塌了。但这不是坏事，因为只有腾出空间，新的、更好的东西才能进来。废墟之上，才能建起更坚固的城堡。',
    category: 'growth',
    emoji: '🏗️',
    tone: 'hopeful'
  },
  {
    title: '言出必行',
    content: '你最近答应过别人什么事吗？或者对自己许过什么承诺？说到就要做到，这是立身之本。一次失信，可能要花十次守信才能弥补。如果做不到，一开始就不要轻易承诺。诚信，是你最值钱的名片。',
    category: 'wisdom',
    emoji: '📜',
    tone: 'reflective'
  },
  {
    title: '心动信号',
    content: '有一个人正在默默关注你。可能你已经有所察觉，也可能你完全不知道。留意身边那个对你不一样的人——他/她可能会找各种借口出现在你面前，可能会记住你说过的每一句话。如果你也心动，就别错过。',
    category: 'love',
    emoji: '💓',
    tone: 'mysterious'
  },
  {
    title: '大器晚成',
    content: '不要因为同龄人都"成功"了而焦虑。每个人的时区不一样，有人早慧，有人晚成。姜子牙八十岁才出山，齐白石六十岁才成名。你现在的积累，都是在为未来的爆发做准备。属于你的光芒，可能来得晚一些，但一定更耀眼。',
    category: 'career',
    emoji: '🏆',
    tone: 'encouraging'
  },
  {
    title: '同频共振',
    content: '你是什么样的人，就会吸引什么样的人。与其去追一匹马，不如用追马的时间种草。等春天来了，自然会有一群马供你挑选。提升自己，比任何社交技巧都管用。当你成为光，自然会吸引向往光明的人。',
    category: 'love',
    emoji: '🎯',
    tone: 'encouraging'
  },
  {
    title: '知足不辱',
    content: '人的欲望是无限的，如果不懂得知足，永远都不会快乐。有了房子想要更大的，有了车子想要更贵的，有了钱想要更多的。学会珍惜已经拥有的，你会发现，你已经比大部分人都幸福了。知足，是一种高级的智慧。',
    category: 'wisdom',
    emoji: '🪷',
    tone: 'reflective'
  },
  {
    title: '否极泰来',
    content: '你已经走到了最艰难的时刻，接下来只会越来越好。就像太极图，阴到极致就是阳的开始。不要放弃，再坚持一下下，转机就在眼前。你已经扛过了最难的部分，接下来的路，会越走越轻松。',
    category: 'comfort',
    emoji: '☯️',
    tone: 'hopeful'
  },
  {
    title: '审时度势',
    content: '现在不是硬刚的时候。形势比人强，该低头的时候要低头，该退让的时候要退让。这不是软弱，而是智慧。看清局势，保存实力，等待最好的时机再出手。能屈能伸，才是真正的强者。',
    category: 'career',
    emoji: '🌪️',
    tone: 'mysterious'
  }
]

export const categoryLabels: Record<DivinationAnswer['category'], string> = {
  love: '情感',
  career: '事业',
  decision: '抉择',
  comfort: '慰藉',
  growth: '成长',
  wisdom: '智慧'
}

export const toneLabels: Record<DivinationAnswer['tone'], string> = {
  warm: '温暖治愈',
  encouraging: '激励奋进',
  reflective: '深度思考',
  hopeful: '充满希望',
  mysterious: '神秘启示'
}

export function getDivinationByNumber(num: number): {
  isSpecial: boolean
  answer: DivinationAnswer | SpecialNumber
} {
  const special = specialNumbers.find(s => s.number === num)
  if (special) {
    return {
      isSpecial: true,
      answer: special
    }
  }

  const digitalRoot = getDigitalRoot(num)
  const hash = simpleHash(num)
  const categoryIndex = hash % 6
  const categories: DivinationAnswer['category'][] = ['love', 'career', 'decision', 'comfort', 'growth', 'wisdom']
  const targetCategory = categories[categoryIndex]

  const categoryAnswers = divinationPool.filter(a => a.category === targetCategory)
  const fallbackAnswers = divinationPool.filter(a => a.category !== targetCategory)

  let pool = categoryAnswers.length > 0 ? categoryAnswers : fallbackAnswers

  const secondaryIndex = (digitalRoot + hash) % pool.length
  const answer = pool[secondaryIndex] || divinationPool[0]

  return {
    isSpecial: false,
    answer
  }
}

export function getDigitalRoot(num: number): number {
  if (num === 0) return 0
  let result = num
  while (result >= 10) {
    result = result
      .toString()
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0)
  }
  return result
}

function simpleHash(num: number): number {
  const str = num.toString()
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getNumberProperties(num: number) {
  const isEven = num % 2 === 0
  const isPrime = isPrimeNumber(num)
  const digitalRoot = getDigitalRoot(num)

  let meaning = ''
  if (isPrime) {
    meaning = '质数象征独特与独立，你是独一无二的存在'
  } else if (isEven) {
    meaning = '偶数象征平衡与和谐，你追求关系的稳定与圆满'
  } else {
    meaning = '奇数象征力量与突破，你有打破常规的勇气'
  }

  return {
    isEven,
    isPrime,
    digitalRoot,
    meaning
  }
}

function isPrimeNumber(num: number): boolean {
  if (num < 2) return false
  if (num === 2) return true
  if (num % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false
  }
  return true
}
