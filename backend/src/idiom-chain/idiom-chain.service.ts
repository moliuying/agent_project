import { Injectable } from '@nestjs/common';

export interface IdiomInfo {
  word: string;
  pinyin: string;
  meaning: string;
  example?: string;
}

export interface ChainMessage {
  id: number;
  role: 'user' | 'ai';
  word: string;
  pinyin?: string;
  meaning?: string;
  timestamp: number;
}

export type ErrorType = 'invalid_idiom' | 'already_used' | 'wrong_tail' | null;

export interface GameState {
  chain: ChainMessage[];
  currentTail: string;
  gameOver: boolean;
  winner?: 'user' | 'ai' | 'draw';
  message?: string;
  usedWords: string[];
  round: number;
  errorType?: ErrorType;
  errorDetail?: string;
}

const IDIOM_DATA: IdiomInfo[] = [
  { word: '一心一意', pinyin: 'yī xīn yī yì', meaning: '只有一个心眼儿，没有别的考虑。', example: '他一心一意地做好自己的工作。' },
  { word: '意气风发', pinyin: 'yì qì fēng fā', meaning: '形容精神振奋，气概豪迈。' },
  { word: '发愤图强', pinyin: 'fā fèn tú qiáng', meaning: '下定决心，努力谋求强盛或进步。' },
  { word: '强词夺理', pinyin: 'qiǎng cí duó lǐ', meaning: '指无理强辩，明明没有理硬说有理。' },
  { word: '理直气壮', pinyin: 'lǐ zhí qì zhuàng', meaning: '理由充分，因而说话做事有气势或心里无愧，无所畏惧。' },
  { word: '壮志凌云', pinyin: 'zhuàng zhì líng yún', meaning: '形容理想宏伟远大。' },
  { word: '云开雾散', pinyin: 'yún kāi wù sàn', meaning: '比喻疑虑、误会或困难等消除。' },
  { word: '散兵游勇', pinyin: 'sǎn bīng yóu yǒng', meaning: '指没有统帅的逃散的士兵，也比喻没有组织的集体队伍中的人。' },
  { word: '勇往直前', pinyin: 'yǒng wǎng zhí qián', meaning: '勇敢地一直向前进。' },
  { word: '前仆后继', pinyin: 'qián pū hòu jì', meaning: '前面的人倒下了，后面的人继续跟上去。形容英勇奋斗，不怕牺牲。' },
  { word: '继往开来', pinyin: 'jì wǎng kāi lái', meaning: '继承前人的事业，开辟未来的道路。' },
  { word: '来龙去脉', pinyin: 'lái lóng qù mài', meaning: '比喻人物的来历或事情的前因后果。' },
  { word: '脉脉含情', pinyin: 'mò mò hán qíng', meaning: '形容用眼神默默地表达情意。' },
  { word: '情投意合', pinyin: 'qíng tóu yì hé', meaning: '双方思想感情融洽，心意相合。' },
  { word: '合情合理', pinyin: 'hé qíng hé lǐ', meaning: '符合情理。' },
  { word: '理屈词穷', pinyin: 'lǐ qū cí qióng', meaning: '理由已被驳倒，无话可说。' },
  { word: '穷途末路', pinyin: 'qióng tú mò lù', meaning: '形容无路可走。' },
  { word: '路不拾遗', pinyin: 'lù bù shí yí', meaning: '东西掉在路上没有人捡走据为己有，形容社会风气很好。' },
  { word: '遗臭万年', pinyin: 'yí chòu wàn nián', meaning: '坏名声流传下去，永远被人唾骂。' },
  { word: '年富力强', pinyin: 'nián fù lì qiáng', meaning: '年纪轻，精力旺盛。' },
  { word: '强弩之末', pinyin: 'qiáng nǔ zhī mò', meaning: '比喻原来强大的力量已经衰竭。' },
  { word: '末路穷途', pinyin: 'mò lù qióng tú', meaning: '无路可走，比喻处境极端困难。' },
  { word: '途途是道', pinyin: 'tú tú shì dào', meaning: '指说话做事很有条理。' },
  { word: '道听途说', pinyin: 'dào tīng tú shuō', meaning: '从道路上听到，在道路上传说，指传闻的、没有根据的话。' },
  { word: '说三道四', pinyin: 'shuō sān dào sì', meaning: '随意说这说那，乱加议论。' },
  { word: '四面八方', pinyin: 'sì miàn bā fāng', meaning: '指各个方面或各个地方。' },
  { word: '方兴未艾', pinyin: 'fāng xīng wèi ài', meaning: '事物正在兴起、发展，一时不会终止。' },
  { word: '艾发衰容', pinyin: 'ài fà shuāi róng', meaning: '灰白色的头发，衰老的面容。' },
  { word: '容光焕发', pinyin: 'róng guāng huàn fā', meaning: '脸上放出光彩，形容身体健康或精神饱满。' },
  { word: '发人深省', pinyin: 'fā rén shēn xǐng', meaning: '启发人深刻思考而有所醒悟。' },
  { word: '省吃俭用', pinyin: 'shěng chī jiǎn yòng', meaning: '形容生活简朴，吃用节俭。' },
  { word: '用兵如神', pinyin: 'yòng bīng rú shén', meaning: '调兵遣将如同神人，形容善于指挥作战。' },
  { word: '神通广大', pinyin: 'shén tōng guǎng dà', meaning: '原指神仙法力无所不能，现比喻办法多，本领高强。' },
  { word: '大显身手', pinyin: 'dà xiǎn shēn shǒu', meaning: '充分地显示出本领和才能。' },
  { word: '手不释卷', pinyin: 'shǒu bù shì juàn', meaning: '手里的书舍不得放下，形容读书勤奋或看书入迷。' },
  { word: '卷土重来', pinyin: 'juǎn tǔ chóng lái', meaning: '比喻失败之后重新恢复势力。' },
  { word: '来者不拒', pinyin: 'lái zhě bù jù', meaning: '对有所求而来的人或送上门来的东西一概不拒绝。' },
  { word: '拒之门外', pinyin: 'jù zhī mén wài', meaning: '把人挡在门外，不让其进入，形容拒绝协商或共事。' },
  { word: '外强中干', pinyin: 'wài qiáng zhōng gān', meaning: '外表上好像很强大，实际上很空虚。' },
  { word: '干柴烈火', pinyin: 'gān chái liè huǒ', meaning: '比喻情欲正盛的男女。' },
  { word: '火树银花', pinyin: 'huǒ shù yín huā', meaning: '形容灿烂的灯火或烟火。' },
  { word: '花好月圆', pinyin: 'huā hǎo yuè yuán', meaning: '比喻美好圆满（多用于祝贺新婚）。' },
  { word: '圆满成功', pinyin: 'yuán mǎn chéng gōng', meaning: '完满地获得成功。' },
  { word: '功败垂成', pinyin: 'gōng bài chuí chéng', meaning: '快要成功的时候遭到失败（含惋惜意）。' },
  { word: '成竹在胸', pinyin: 'chéng zhú zài xiōng', meaning: '比喻做事之前已经有通盘的考虑。' },
  { word: '胸有成竹', pinyin: 'xiōng yǒu chéng zhú', meaning: '比喻做事之前已经有通盘的考虑。' },
  { word: '竹报平安', pinyin: 'zhú bào píng ān', meaning: '比喻平安家信。' },
  { word: '安居乐业', pinyin: 'ān jū lè yè', meaning: '安定地生活，愉快地劳动。' },
  { word: '业精于勤', pinyin: 'yè jīng yú qín', meaning: '学业的精深在于勤奋。' },
  { word: '勤能补拙', pinyin: 'qín néng bǔ zhuō', meaning: '勤奋能够弥补笨拙的不足。' },
  { word: '拙口笨舌', pinyin: 'zhuō kǒu bèn shé', meaning: '形容没有口才，不善言辞。' },
  { word: '舌战群儒', pinyin: 'shé zhàn qún rú', meaning: '指同很多人辩论，并驳倒对方。' },
  { word: '儒雅风流', pinyin: 'rú yǎ fēng liú', meaning: '指文雅潇洒。' },
  { word: '流连忘返', pinyin: 'liú lián wàng fǎn', meaning: '形容留恋景物或某种事物，不愿离去。' },
  { word: '返璞归真', pinyin: 'fǎn pú guī zhēn', meaning: '去掉外在的装饰，恢复原来的质朴状态。' },
  { word: '真相大白', pinyin: 'zhēn xiàng dà bái', meaning: '事情的真实情况彻底弄清楚了。' },
  { word: '白手起家', pinyin: 'bái shǒu qǐ jiā', meaning: '形容原来没有基础或条件很差而创立起一番事业。' },
  { word: '家喻户晓', pinyin: 'jiā yù hù xiǎo', meaning: '每家每户都知道。' },
  { word: '晓之以理', pinyin: 'xiǎo zhī yǐ lǐ', meaning: '用道理来开导说服人。' },
  { word: '理所当然', pinyin: 'lǐ suǒ dāng rán', meaning: '从道理上说应当这样。' },
  { word: '然荻读书', pinyin: 'rán dí dú shū', meaning: '形容勤学苦读。' },
  { word: '书声琅琅', pinyin: 'shū shēng láng láng', meaning: '形容读书声音响亮。' },
  { word: '琅琅上口', pinyin: 'láng láng shàng kǒu', meaning: '指诵读熟练、顺口，也指文辞通俗，便于口诵。' },
  { word: '口若悬河', pinyin: 'kǒu ruò xuán hé', meaning: '说话像瀑布流泻一样滔滔不绝，形容能言善辩。' },
  { word: '河清海晏', pinyin: 'hé qīng hǎi yàn', meaning: '黄河的水清了，大海也平静了，形容天下太平。' },
  { word: '晏然自若', pinyin: 'yàn rán zì ruò', meaning: '形容在紧张状态下沉静如常。' },
  { word: '若无其事', pinyin: 'ruò wú qí shì', meaning: '好像没有那么回事似的，形容不动声色或漠不关心。' },
  { word: '事半功倍', pinyin: 'shì bàn gōng bèi', meaning: '形容花费的气力小，收到的成效大。' },
  { word: '倍道兼行', pinyin: 'bèi dào jiān xíng', meaning: '一天走两天的路程，形容加速急行。' },
  { word: '行云流水', pinyin: 'xíng yún liú shuǐ', meaning: '飘浮的云，流动的水，形容诗文、书画、歌唱等自然流畅。' },
  { word: '水落石出', pinyin: 'shuǐ luò shí chū', meaning: '比喻真相大白。' },
  { word: '出类拔萃', pinyin: 'chū lèi bá cuì', meaning: '形容超出同类。' },
  { word: '萃萃学子', pinyin: 'shēn shēn xué zǐ', meaning: '众多学生。' },
  { word: '子虚乌有', pinyin: 'zǐ xū wū yǒu', meaning: '指虚构的或不真实的事情。' },
  { word: '有口皆碑', pinyin: 'yǒu kǒu jiē bēi', meaning: '形容人人称赞。' },
  { word: '碑帖书法', pinyin: 'bēi tiè shū fǎ', meaning: '以碑刻和帖为范本的书法艺术。' },
  { word: '法不阿贵', pinyin: 'fǎ bù ē guì', meaning: '法律不偏袒地位高贵的人。' },
  { word: '贵人多忘', pinyin: 'guì rén duō wàng', meaning: '原指地位高的人对人或事容易忘怀，后多用于讥讽人健忘。' },
  { word: '忘乎所以', pinyin: 'wàng hū suǒ yǐ', meaning: '由于过度兴奋或骄傲自满而忘记了言行应该把握的分寸。' },
  { word: '以德报怨', pinyin: 'yǐ dé bào yuàn', meaning: '用恩惠回报与别人之间的仇恨。' },
  { word: '怨天尤人', pinyin: 'yuàn tiān yóu rén', meaning: '形容对不如意的事情一味归咎于客观。' },
  { word: '人杰地灵', pinyin: 'rén jié dì líng', meaning: '指杰出的人物出生或到过的地方，便成为名胜地区。' },
  { word: '灵机一动', pinyin: 'líng jī yī dòng', meaning: '急忙中转了一下念头（多指临时想出了一个办法）。' },
  { word: '动人心弦', pinyin: 'dòng rén xīn xián', meaning: '激动人心；非常动人。' },
  { word: '弦外之音', pinyin: 'xián wài zhī yīn', meaning: '比喻言外之意，即在话里间接透露而没有明说的意思。' },
  { word: '音容笑貌', pinyin: 'yīn róng xiào mào', meaning: '指人的声音、容貌和神情（多用于对死者的怀念）。' },
  { word: '貌合神离', pinyin: 'mào hé shén lí', meaning: '表面上关系很密切而实际上怀着两条心。' },
  { word: '离乡背井', pinyin: 'lí xiāng bèi jǐng', meaning: '离开了故乡，在外地生活（多指不得已的）。' },
  { word: '井井有条', pinyin: 'jǐng jǐng yǒu tiáo', meaning: '形容条理分明，整齐有序。' },
  { word: '条分缕析', pinyin: 'tiáo fēn lǚ xī', meaning: '形容分析得细密而有条理。' },
  { word: '析微察异', pinyin: 'xī wēi chá yì', meaning: '指细微观察，辨察差异。' },
  { word: '异口同声', pinyin: 'yì kǒu tóng shēng', meaning: '形容很多人说同样的话。' },
  { word: '声东击西', pinyin: 'shēng dōng jī xī', meaning: '为了迷惑敌人，表面上宣扬要攻打这一边，其实是攻打另一边。' },
  { word: '西风残照', pinyin: 'xī fēng cán zhào', meaning: '秋天的风，落日的光，比喻衰败没落的景象。' },
  { word: '照本宣科', pinyin: 'zhào běn xuān kē', meaning: '照着本子读，形容死板守旧，缺乏创造精神。' },
  { word: '科班出身', pinyin: 'kē bān chū shēn', meaning: '比喻具有受过正规教育或训练的资格。' },
  { word: '身先士卒', pinyin: 'shēn xiān shì zú', meaning: '作战时将帅亲自带头，冲在士兵前面，现多用来比喻领导带头走在群众前面。' },
  { word: '卒岁穷年', pinyin: 'zú suì qióng nián', meaning: '指整年。' },
  { word: '年年有余', pinyin: 'nián nián yǒu yú', meaning: '每年都有剩余，代表生活富足。' },
  { word: '余音绕梁', pinyin: 'yú yīn rào liáng', meaning: '形容歌声或音乐优美，余音回旋不绝。' },
  { word: '梁上君子', pinyin: 'liáng shàng jūn zǐ', meaning: '躲在梁上的君子，窃贼的代称。' },
  { word: '子丑寅卯', pinyin: 'zǐ chǒu yín mǎo', meaning: '四个地支，多指事理。' },
  { word: '卯榫相合', pinyin: 'mǎo sǔn xiāng hé', meaning: '榫头和卯眼相合，比喻事物配合紧密。' },
  { word: '合二为一', pinyin: 'hé èr wéi yī', meaning: '把两个事物合并为一个整体。' },
  { word: '一针见血', pinyin: 'yī zhēn jiàn xuè', meaning: '比喻话说得简短而能切中要害。' },
  { word: '血流成河', pinyin: 'xuè liú chéng hé', meaning: '形容伤亡极大。' },
  { word: '河东狮吼', pinyin: 'hé dōng shī hǒu', meaning: '比喻嫉妒而又厉害的妇人，也用来嘲笑怕老婆的男子。' },
  { word: '吼三喝四', pinyin: 'hǒu sān hè sì', meaning: '大声吆喝。' },
  { word: '四面八方', pinyin: 'sì miàn bā fāng', meaning: '指各个方向或各个地方。' },
  { word: '长治久安', pinyin: 'cháng zhì jiǔ ān', meaning: '指社会秩序长期安定太平。' },
  { word: '安然无恙', pinyin: 'ān rán wú yàng', meaning: '原指人平安没有疾病，后泛指平平安安没有受到任何损伤。' },
  { word: '恙病缠身', pinyin: 'yàng bìng chán shēn', meaning: '指疾病缠身。' },
  { word: '身体力行', pinyin: 'shēn tǐ lì xíng', meaning: '亲身体验，努力实行。' },
  { word: '行云流水', pinyin: 'xíng yún liú shuǐ', meaning: '形容文章自然不受约束，就像漂浮着的云和流动着的水一样。' },
  { word: '水到渠成', pinyin: 'shuǐ dào qú chéng', meaning: '水流到的地方自然成渠，比喻条件成熟，事情自然成功。' },
  { word: '成仁取义', pinyin: 'chéng rén qǔ yì', meaning: '指为正义事业而牺牲生命。' },
  { word: '义薄云天', pinyin: 'yì bó yún tiān', meaning: '正义之气直上高空，形容为正义而斗争的精神极其崇高。' },
  { word: '天长地久', pinyin: 'tiān cháng dì jiǔ', meaning: '跟天和地存在的时间那样长，形容永久不变（多指爱情）。' },
  { word: '久负盛名', pinyin: 'jiǔ fù shèng míng', meaning: '长时期地享有好的名声。' },
  { word: '名副其实', pinyin: 'míng fù qí shí', meaning: '名称或名声与实际相符合。' },
  { word: '实事求是', pinyin: 'shí shì qiú shì', meaning: '从实际对象出发，探求事物的内部联系及其发展的规律性，认识事物的本质。' },
  { word: '是非曲直', pinyin: 'shì fēi qǔ zhí', meaning: '正确和错误，对和不对。' },
  { word: '直言不讳', pinyin: 'zhí yán bù huì', meaning: '直截了当地说出来，没有丝毫顾忌。' },
  { word: '讳莫如深', pinyin: 'huì mò rú shēn', meaning: '紧紧隐瞒。' },
  { word: '深入浅出', pinyin: 'shēn rù qiǎn chū', meaning: '指讲话或文章的内容深刻，语言文字却浅显易懂。' },
  { word: '出人头地', pinyin: 'chū rén tóu dì', meaning: '指高人一等，超出一般人。' },
  { word: '地大物博', pinyin: 'dì dà wù bó', meaning: '土地广大，物产丰富。' },
  { word: '博古通今', pinyin: 'bó gǔ tōng jīn', meaning: '对古代和现代的事情都知道得很多。' },
  { word: '今非昔比', pinyin: 'jīn fēi xī bǐ', meaning: '现在不是过去所能比得上的，形容变化很大。' },
  { word: '比翼双飞', pinyin: 'bǐ yì shuāng fēi', meaning: '比喻夫妻恩爱，朝夕相伴，也比喻互相帮助，共同前进。' },
  { word: '飞黄腾达', pinyin: 'fēi huáng téng dá', meaning: '骏马奔腾升空，比喻人骤然得志，官职、地位升得很快。' },
  { word: '达官贵人', pinyin: 'dá guān guì rén', meaning: '指地位高的官吏和显赫的人物。' },
  { word: '人山人海', pinyin: 'rén shān rén hǎi', meaning: '聚集的人极多。' },
  { word: '海阔天空', pinyin: 'hǎi kuò tiān kōng', meaning: '形容大自然的广阔，也比喻想象或说话毫无拘束，漫无边际。' },
  { word: '空前绝后', pinyin: 'kōng qián jué hòu', meaning: '以前没有过，以后也不会有，多用来形容非凡的成就或盛况。' },
  { word: '后顾之忧', pinyin: 'hòu gù zhī yōu', meaning: '需要回过头来照顾的忧虑，指来自后方的或家里的忧虑。' },
  { word: '忧心忡忡', pinyin: 'yōu xīn chōng chōng', meaning: '形容忧愁不安的样子。' },
  { word: '忡忡不安', pinyin: 'chōng chōng bù ān', meaning: '形容心事重重，非常忧愁。' },
  { word: '安居乐业', pinyin: 'ān jū lè yè', meaning: '安定地生活，愉快地工作。' },
  { word: '业精于勤', pinyin: 'yè jīng yú qín', meaning: '学业方面的精深造诣来源于勤奋好学。' },
  { word: '勤学好问', pinyin: 'qín xué hào wèn', meaning: '勤奋学习，不懂的就问，比喻善于学习。' },
  { word: '问心无愧', pinyin: 'wèn xīn wú kuì', meaning: '反躬自问，没有对不起人的地方。' },
  { word: '愧不敢当', pinyin: 'kuì bù gǎn dāng', meaning: '感到惭愧，承当不起。' },
  { word: '当机立断', pinyin: 'dāng jī lì duàn', meaning: '抓住时机，立刻决断。' },
  { word: '断章取义', pinyin: 'duàn zhāng qǔ yì', meaning: '不顾全篇文章或谈话的内容，而只根据自己的需要孤立地取其中一段或一句的意思。' },
  { word: '义无反顾', pinyin: 'yì wú fǎn gù', meaning: '在道义上只有勇往直前，绝对不能退缩回头。' },
  { word: '顾全大局', pinyin: 'gù quán dà jú', meaning: '指从整体的利益着想，使不遭受损害。' },
  { word: '局促不安', pinyin: 'jú cù bù ān', meaning: '形容举止拘束，心中不安。' },
  { word: '安居乐业', pinyin: 'ān jū lè yè', meaning: '安定地生活，愉快地劳动。' },
  { word: '业峻鸿绩', pinyin: 'yè jùn hóng jì', meaning: '功业高，成绩大。' },
  { word: '绩学之士', pinyin: 'jì xué zhī shì', meaning: '指学问渊博的人；学者。' },
  { word: '士别三日', pinyin: 'shì bié sān rì', meaning: '指别人已有进步，当另眼相看。' },
  { word: '日新月异', pinyin: 'rì xīn yuè yì', meaning: '每天每月都有新的变化，形容进步、发展很快。' },
  { word: '异想天开', pinyin: 'yì xiǎng tiān kāi', meaning: '形容想法离奇，不切实际。' },
  { word: '开门见山', pinyin: 'kāi mén jiàn shān', meaning: '比喻说话写文章一开头就直入本题。' },
  { word: '山清水秀', pinyin: 'shān qīng shuǐ xiù', meaning: '形容山水风景优美。' },
  { word: '秀外慧中', pinyin: 'xiù wài huì zhōng', meaning: '容貌清秀，内心聪慧（多指女子）。' },
  { word: '中流砥柱', pinyin: 'zhōng liú dǐ zhù', meaning: '比喻坚强的、能起支柱作用的人或集体，就像立在黄河激流中的砥柱山一样。' },
  { word: '柱石之坚', pinyin: 'zhù shí zhī jiān', meaning: '像柱子和石头一样坚固，比喻国家重臣或中坚力量。' },
  { word: '坚不可摧', pinyin: 'jiān bù kě cuī', meaning: '非常坚固，摧毁不了。' },
  { word: '摧枯拉朽', pinyin: 'cuī kū lā xiǔ', meaning: '摧折枯草朽木，比喻迅速摧毁腐朽势力。' },
  { word: '朽木不雕', pinyin: 'xiǔ mù bù diāo', meaning: '比喻人不上进，无法成材。' },
  { word: '雕梁画栋', pinyin: 'diāo liáng huà dòng', meaning: '指房屋的华丽的彩绘装饰，常用来形容建筑物富丽堂皇。' },
  { word: '栋梁之才', pinyin: 'dòng liáng zhī cái', meaning: '比喻能担当国家重任的人才。' },
  { word: '才高八斗', pinyin: 'cái gāo bā dǒu', meaning: '形容文才非常高。' },
  { word: '斗志昂扬', pinyin: 'dòu zhì áng yáng', meaning: '战斗的意志非常高昂。' },
  { word: '扬眉吐气', pinyin: 'yáng méi tǔ qì', meaning: '形容摆脱了长期受压抑的状态后高兴痛快的样子。' },
  { word: '气壮山河', pinyin: 'qì zhuàng shān hé', meaning: '形容气概像高山大河那样雄伟豪迈。' },
  { word: '河清海晏', pinyin: 'hé qīng hǎi yàn', meaning: '黄河水清了，大海没有浪了，比喻天下太平。' },
  { word: '晏安鸩毒', pinyin: 'yàn ān zhèn dú', meaning: '指贪图享乐等于喝毒酒自杀。' },
  { word: '毒手尊前', pinyin: 'dú shǒu zūn qián', meaning: '指在尊长面前下毒手。' },
  { word: '前程万里', pinyin: 'qián chéng wàn lǐ', meaning: '前途很远，也很光明，比喻前途远大。' },
  { word: '里应外合', pinyin: 'lǐ yìng wài hé', meaning: '外面攻打，里面接应。' },
  { word: '合浦珠还', pinyin: 'hé pǔ zhū huán', meaning: '比喻人去而复回或物失而复得。' },
  { word: '还我河山', pinyin: 'huán wǒ hé shān', meaning: '表示决心从侵略者手中夺回本属于自己的国土。' },
  { word: '山高水长', pinyin: 'shān gāo shuǐ cháng', meaning: '像山一样高耸，如水一般长流，原比喻人的风范或声誉像高山一样永远存在，后比喻恩德深厚。' },
  { word: '长驱直入', pinyin: 'cháng qū zhí rù', meaning: '（军队）长距离地、毫无阻挡地向前挺进。' },
  { word: '入木三分', pinyin: 'rù mù sān fēn', meaning: '形容书法笔力刚劲有力，也比喻对文章或事物见解深刻、透彻。' },
  { word: '分秒必争', pinyin: 'fēn miǎo bì zhēng', meaning: '一分一秒也一定要争取，形容抓紧时间。' },
  { word: '争先恐后', pinyin: 'zhēng xiān kǒng hòu', meaning: '争着向前，唯恐落后。' },
  { word: '后来居上', pinyin: 'hòu lái jū shàng', meaning: '后起的超过了先前的。' },
  { word: '上行下效', pinyin: 'shàng xíng xià xiào', meaning: '上面或上辈的人怎样做，下面或下辈的人就学着怎样做。' },
  { word: '效犬马劳', pinyin: 'xiào quǎn mǎ láo', meaning: '愿像犬马那样为君主奔走效力，心甘情愿受人驱使，为人效劳。' },
  { word: '劳苦功高', pinyin: 'láo kǔ gōng gāo', meaning: '做事勤苦，功劳很大。' },
  { word: '高瞻远瞩', pinyin: 'gāo zhān yuǎn zhǔ', meaning: '站得高，看得远，比喻眼光远大。' },
  { word: '瞩目而视', pinyin: 'zhǔ mù ér shì', meaning: '注视。' },
  { word: '视而不见', pinyin: 'shì ér bù jiàn', meaning: '尽管睁着眼睛看，却什么也没有看见，指不重视或不注意。' },
  { word: '见多识广', pinyin: 'jiàn duō shí guǎng', meaning: '见过的多，知道的广，形容阅历深，经验多。' },
  { word: '广开言路', pinyin: 'guǎng kāi yán lù', meaning: '尽量给下属和群众创造发表意见的条件。' },
  { word: '路不拾遗', pinyin: 'lù bù shí yí', meaning: '东西掉在路上没有人捡走据为己有，形容社会风气很好。' },
  { word: '遗风余韵', pinyin: 'yí fēng yú yùn', meaning: '前人遗留下来的风教和韵致。' },
  { word: '韵致非凡', pinyin: 'yùn zhì fēi fán', meaning: '风度韵味不同于一般。' },
  { word: '凡夫俗子', pinyin: 'fán fū sú zǐ', meaning: '泛指平庸的人。' },
  { word: '子虚乌有', pinyin: 'zǐ xū wū yǒu', meaning: '指假设的、不存在的、不真实的事情。' },
  { word: '有备无患', pinyin: 'yǒu bèi wú huàn', meaning: '事先有准备，就可以避免祸患。' },
  { word: '患得患失', pinyin: 'huàn dé huàn shī', meaning: '指对于个人的利害得失斤斤计较。' },
  { word: '失之交臂', pinyin: 'shī zhī jiāo bì', meaning: '形容当面错过，失掉好机会。' },
  { word: '臂有四肘', pinyin: 'bì yǒu sì zhǒu', meaning: '比喻不凡的相貌。' },
  { word: '肘腋之患', pinyin: 'zhǒu yè zhī huàn', meaning: '发生在身旁的祸患。' },
  { word: '患难与共', pinyin: 'huàn nàn yǔ gòng', meaning: '在不利处境中，共同承受困难或灾祸。' },
  { word: '共商国是', pinyin: 'gòng shāng guó shì', meaning: '共同商量国家的政策和方针。' },
  { word: '是非分明', pinyin: 'shì fēi fēn míng', meaning: '正确与错误非常分明。' },
  { word: '明察秋毫', pinyin: 'míng chá qiū háo', meaning: '比喻为人非常精明，任何小问题都看得很清楚。' },
  { word: '毫不犹豫', pinyin: 'háo bù yóu yù', meaning: '一点也不迟疑，形容态度坚决。' },
  { word: '豫备不虞', pinyin: 'yù bèi bù yú', meaning: '事先准备，以防不测。' },
  { word: '虞我诈你', pinyin: 'yú wǒ zhà nǐ', meaning: '互相猜疑，互相欺骗。' },
  { word: '你追我赶', pinyin: 'nǐ zhuī wǒ gǎn', meaning: '形容竞赛激烈，大家都不甘落后。' },
  { word: '赶尽杀绝', pinyin: 'gǎn jìn shā jué', meaning: '消灭净尽，泛指对人狠毒，不留余地。' },
  { word: '绝处逢生', pinyin: 'jué chù féng shēng', meaning: '陷入绝境的时候又有了生路。' },
  { word: '生龙活虎', pinyin: 'shēng lóng huó hǔ', meaning: '形容很有生气和活力。' },
  { word: '虎背熊腰', pinyin: 'hǔ bèi xióng yāo', meaning: '形容人的身体魁梧强壮。' },
  { word: '腰缠万贯', pinyin: 'yāo chán wàn guàn', meaning: '形容人极富有。' },
  { word: '贯穿古今', pinyin: 'guàn chuān gǔ jīn', meaning: '贯通古代和现代。' },
  { word: '今是昨非', pinyin: 'jīn shì zuó fēi', meaning: '现在是对的，过去是错的，指认识过去的错误。' },
  { word: '非同小可', pinyin: 'fēi tóng xiǎo kě', meaning: '形容事情重要或情况严重，不能轻视。' },
  { word: '可歌可泣', pinyin: 'kě gē kě qì', meaning: '值得歌颂，使人感动得流泪，指悲壮的事迹使人非常感动。' },
  { word: '泣不成声', pinyin: 'qì bù chéng shēng', meaning: '哭得喉咙哽住，出不来声音，形容极度悲伤。' },
  { word: '声情并茂', pinyin: 'shēng qíng bìng mào', meaning: '（演唱、朗诵等）声音优美，感情丰富。' },
  { word: '茂林修竹', pinyin: 'mào lín xiū zhú', meaning: '指茂密高大的树林竹林。' },
  { word: '竹篮打水', pinyin: 'zhú lán dǎ shuǐ', meaning: '比喻白费气力，劳而无功。' },
  { word: '水中捞月', pinyin: 'shuǐ zhōng lāo yuè', meaning: '到水中去捞月亮，比喻去做根本做不到的事情，只能白费气力。' },
  { word: '月明星稀', pinyin: 'yuè míng xīng xī', meaning: '月亮明亮时，星星就显得稀疏了。' },
  { word: '稀奇古怪', pinyin: 'xī qí gǔ guài', meaning: '指很少见，很奇异，不同一般。' },
  { word: '怪诞不经', pinyin: 'guài dàn bù jīng', meaning: '荒唐离奇，不合常理。' },
  { word: '经久不息', pinyin: 'jīng jiǔ bù xī', meaning: '经过很长时间停不下来。' },
  { word: '息息相关', pinyin: 'xī xī xiāng guān', meaning: '呼吸相关联，形容关系密切。' },
  { word: '关怀备至', pinyin: 'guān huái bèi zhì', meaning: '关心得无微不至。' },
  { word: '至高无上', pinyin: 'zhì gāo wú shàng', meaning: '最高；没有更高的。' },
  { word: '上善若水', pinyin: 'shàng shàn ruò shuǐ', meaning: '最高的善像水一样，水善于帮助万物而不与万物相争。' },
  { word: '水泄不通', pinyin: 'shuǐ xiè bù tōng', meaning: '连水都流不出去，形容十分拥挤或包围得非常严密。' },
  { word: '通情达理', pinyin: 'tōng qíng dá lǐ', meaning: '懂得道理，说话做事合情合理。' },
  { word: '理直气壮', pinyin: 'lǐ zhí qì zhuàng', meaning: '理由充分，因而说话做事有气势或心里无愧，无所畏惧。' },
  { word: '壮志未酬', pinyin: 'zhuàng zhì wèi chóu', meaning: '伟大的志向没有实现。' },
  { word: '酬功给效', pinyin: 'chóu gōng gěi xiào', meaning: '赏赐有功劳者以效其命。' },
  { word: '效死输忠', pinyin: 'xiào sǐ shū zhōng', meaning: '指竭尽忠诚。' },
  { word: '忠贞不渝', pinyin: 'zhōng zhēn bù yú', meaning: '忠诚坚定，永不改变。' },
  { word: '渝盟负约', pinyin: 'yú méng fù yuē', meaning: '违背和抛弃盟约。' },
  { word: '约法三章', pinyin: 'yuē fǎ sān zhāng', meaning: '指订立简单的条款，以资遵守。' },
  { word: '章台杨柳', pinyin: 'zhāng tái yáng liǔ', meaning: '比喻窈窕美丽的女子。' },
  { word: '柳暗花明', pinyin: 'liǔ àn huā míng', meaning: '比喻在困境中出现转机，看到希望。' },
  { word: '明目张胆', pinyin: 'míng mù zhāng dǎn', meaning: '形容公开地、无所顾忌地做坏事。' },
  { word: '胆大包天', pinyin: 'dǎn dà bāo tiān', meaning: '形容胆量极大（多用于贬义）。' },
  { word: '天长地久', pinyin: 'tiān cháng dì jiǔ', meaning: '形容永久不变。' },
  { word: '久别重逢', pinyin: 'jiǔ bié chóng féng', meaning: '指朋友或亲人在长久分别之后再次见面。' },
  { word: '逢凶化吉', pinyin: 'féng xiōng huà jí', meaning: '遇到凶险，最终转化为平安吉祥。' },
  { word: '吉祥如意', pinyin: 'jí xiáng rú yì', meaning: '吉利祥瑞，称心如意。' },
  { word: '意气用事', pinyin: 'yì qì yòng shì', meaning: '只凭感情办事，缺乏理智。' },
  { word: '事在人为', pinyin: 'shì zài rén wéi', meaning: '事情在于人去做，指在一定的条件下，事情能否做成要看人的主观努力如何。' },
  { word: '为所欲为', pinyin: 'wéi suǒ yù wéi', meaning: '想干什么就干什么；任意行事（含贬义）。' },
  { word: '为民除害', pinyin: 'wèi mín chú hài', meaning: '替老百姓铲除祸害。' },
  { word: '害群之马', pinyin: 'hài qún zhī mǎ', meaning: '比喻危害集体的人。' },
  { word: '马到成功', pinyin: 'mǎ dào chéng gōng', meaning: '战马一到就取胜，形容事情顺利，很快取得成果。' },
  { word: '功成名就', pinyin: 'gōng chéng míng jiù', meaning: '功业建立了，名声也有了。' },
  { word: '就地取材', pinyin: 'jiù dì qǔ cái', meaning: '在本地选取需要的材料。' },
  { word: '材疏志大', pinyin: 'cái shū zhì dà', meaning: '指志向虽大但才能不足。' },
  { word: '大器晚成', pinyin: 'dà qì wǎn chéng', meaning: '指能担当大事的人物要经过长期的锻炼，所以成就比较晚。' },
  { word: '成群结队', pinyin: 'chéng qún jié duì', meaning: '结成一群群、一队队，形容很多。' },
  { word: '队伍整齐', pinyin: 'duì wu zhěng qí', meaning: '队伍有秩序，不杂乱。' },
  { word: '齐头并进', pinyin: 'qí tóu bìng jìn', meaning: '不分先后地一齐前进或同时进行。' },
  { word: '进退两难', pinyin: 'jìn tuì liǎng nán', meaning: '前进和后退都难，比喻事情无法决定，因而难以行动。' },
  { word: '难能可贵', pinyin: 'nán néng kě guì', meaning: '难做的事居然能做到，值得珍视。' },
  { word: '贵人相助', pinyin: 'guì rén xiāng zhù', meaning: '有地位或有能力的人帮助自己。' },
  { word: '助人为乐', pinyin: 'zhù rén wéi lè', meaning: '把帮助别人当作快乐。' },
  { word: '乐此不疲', pinyin: 'lè cǐ bù pí', meaning: '因喜欢做某件事而不知疲倦，形容对某事特别爱好而沉浸其中。' },
  { word: '疲惫不堪', pinyin: 'pí bèi bù kān', meaning: '形容非常疲乏。' },
  { word: '堪当重任', pinyin: 'kān dāng zhòng rèn', meaning: '能担当重要任务。' },
  { word: '任劳任怨', pinyin: 'rèn láo rèn yuàn', meaning: '做事不辞劳苦，不怕别人埋怨。' },
  { word: '怨声载道', pinyin: 'yuàn shēng zài dào', meaning: '怨恨的声音充满道路，形容人民群众普遍强烈不满。' },
  { word: '道貌岸然', pinyin: 'dào mào àn rán', meaning: '神态庄严，外貌一本正经的样子，用以讽刺故作正经、表里不一的伪君子。' },
  { word: '然荻读书', pinyin: 'rán dí dú shū', meaning: '用荻草照明读书，形容勤学苦读。' },
  { word: '书香门第', pinyin: 'shū xiāng mén dì', meaning: '指上辈有读书人的人家。' },
  { word: '第一把手', pinyin: 'dì yī bǎ shǒu', meaning: '指领导班子中居于首位的负责人。' },
  { word: '手到擒来', pinyin: 'shǒu dào qín lái', meaning: '手一到就把敌人捉拿过来，形容做事很有把握或毫不费力就能成功。' },
  { word: '来者不善', pinyin: 'lái zhě bù shàn', meaning: '来的人不怀好意。' },
  { word: '善始善终', pinyin: 'shàn shǐ shàn zhōng', meaning: '事情从开头到结束都做得很好。' },
  { word: '终而复始', pinyin: 'zhōng ér fù shǐ', meaning: '不断地循环往复。' },
  { word: '始终如一', pinyin: 'shǐ zhōng rú yī', meaning: '自始至终都一样。' },
  { word: '一鸣惊人', pinyin: 'yī míng jīng rén', meaning: '比喻平时没有特殊的表现，一干就有惊人的成绩。' },
  { word: '人山人海', pinyin: 'rén shān rén hǎi', meaning: '聚集的人极多。' },
  { word: '海纳百川', pinyin: 'hǎi nà bǎi chuān', meaning: '大海容得下成百上千条江河之水，比喻包容的东西广泛，数量巨大。' },
  { word: '川流不息', pinyin: 'chuān liú bù xī', meaning: '（行人、车马等）像水流一样连续不断。' },
  { word: '息息相关', pinyin: 'xī xī xiāng guān', meaning: '呼吸相关联，形容关系密切。' },
  { word: '关怀备至', pinyin: 'guān huái bèi zhì', meaning: '关心得无微不至。' },
  { word: '至高无上', pinyin: 'zhì gāo wú shàng', meaning: '最高；没有更高的。' },
  { word: '上窜下跳', pinyin: 'shàng cuàn xià tiào', meaning: '比喻人到处活动，多方串连（多含贬义）。' },
  { word: '跳梁小丑', pinyin: 'tiào liáng xiǎo chǒu', meaning: '比喻猖狂捣乱而成不了大气候的坏人。' },
  { word: '丑态百出', pinyin: 'chǒu tài bǎi chū', meaning: '各种丑恶的样子都表现出来了。' },
  { word: '出其不意', pinyin: 'chū qí bù yì', meaning: '趁对方没有意料到就采取行动。' },
  { word: '意味深长', pinyin: 'yì wèi shēn cháng', meaning: '含意深远，耐人寻味。' },
  { word: '长话短说', pinyin: 'cháng huà duǎn shuō', meaning: '把要用很多话才能说完的事用简短的话说完。' },
  { word: '说一不二', pinyin: 'shuō yī bù èr', meaning: '形容说话算数，说怎么样就怎么样。' },
  { word: '二龙戏珠', pinyin: 'èr lóng xì zhū', meaning: '两条龙相对，戏玩着一颗宝珠，古代中国神话故事。' },
  { word: '珠光宝气', pinyin: 'zhū guāng bǎo qì', meaning: '形容服饰、陈设等非常华丽。' },
  { word: '气吞山河', pinyin: 'qì tūn shān hé', meaning: '气势可以吞掉高山和大河，形容气魄很大。' },
  { word: '河汾门下', pinyin: 'hé fén mén xià', meaning: '比喻名师门下，人才济济或人才辈出。' },
  { word: '下笔成章', pinyin: 'xià bǐ chéng zhāng', meaning: '一动笔就写成文章，形容文思敏捷。' },
  { word: '章句之徒', pinyin: 'zhāng jù zhī tú', meaning: '指不能通达大义而拘泥于辨析章句的儒生。' },
  { word: '徒劳无功', pinyin: 'tú láo wú gōng', meaning: '白费力气，没有成就或好处。' },
  { word: '功德无量', pinyin: 'gōng dé wú liàng', meaning: '指功劳恩德非常大，现多用来称赞人的功劳、恩德或做大有益于别人的事情。' },
  { word: '量力而行', pinyin: 'liàng lì ér xíng', meaning: '衡量自己的能力或力量的大小去行事。' },
  { word: '行云流水', pinyin: 'xíng yún liú shuǐ', meaning: '形容文章自然不受约束，就像漂浮着的云和流动着的水一样。' },
  { word: '水滴石穿', pinyin: 'shuǐ dī shí chuān', meaning: '水不断下滴，可以穿透石头，比喻力量虽小，只要坚持不懈，事情就能成功。' },
  { word: '穿针引线', pinyin: 'chuān zhēn yǐn xiàn', meaning: '比喻从中联系、拉拢。' },
  { word: '线断风筝', pinyin: 'xiàn duàn fēng zhēng', meaning: '比喻失去联系的人或物。' },
  { word: '争分夺秒', pinyin: 'zhēng fēn duó miǎo', meaning: '不放过一分一秒，形容对时间抓得很紧。' },
  { word: '秒秒珍惜', pinyin: 'miǎo miǎo zhēn xī', meaning: '形容非常珍惜时间。' },
  { word: '惜墨如金', pinyin: 'xī mò rú jīn', meaning: '指写字、作画、作文态度严谨，力求精炼。' },
  { word: '金碧辉煌', pinyin: 'jīn bì huī huáng', meaning: '形容建筑物等异常华丽，光彩夺目。' },
  { word: '煌煌大观', pinyin: 'huáng huáng dà guān', meaning: '形容景象雄伟壮观。' },
  { word: '观望不前', pinyin: 'guān wàng bù qián', meaning: '怀着犹豫不定的心情，观察事物的发展，暂不前进。' },
  { word: '前途无量', pinyin: 'qián tú wú liàng', meaning: '指一个人的前途没有限量。' },
  { word: '量入为出', pinyin: 'liàng rù wéi chū', meaning: '根据收入的多少来定支出的限度。' },
  { word: '出尔反尔', pinyin: 'chū ěr fǎn ěr', meaning: '原意是你怎么做，就会得到怎样的后果，今指说了又翻悔或说了不照着做，表示言行前后自相矛盾，反复无常。' },
  { word: '尔虞我诈', pinyin: 'ěr yú wǒ zhà', meaning: '彼此猜疑，互相欺骗。' },
  { word: '诈败佯输', pinyin: 'zhà bài yáng shū', meaning: '假装失败，引人上当。' },
  { word: '输肝沥胆', pinyin: 'shū gān lì dǎn', meaning: '比喻对人忠诚，开诚相见，同"披肝沥胆"。' },
  { word: '胆战心惊', pinyin: 'dǎn zhàn xīn jīng', meaning: '形容非常害怕。' },
  { word: '惊天动地', pinyin: 'jīng tiān dòng dì', meaning: '形容声音特别响亮；形容声势浩大或事业伟大。' },
  { word: '地动山摇', pinyin: 'dì dòng shān yáo', meaning: '地被震动，山也摇摆，形容声势浩大。' },
  { word: '摇旗呐喊', pinyin: 'yáo qí nà hǎn', meaning: '古代打仗的时候，后面的人摇着旗子呐喊，给前面作战的人助威，现比喻替别人助长声势。' },
  { word: '喊冤叫屈', pinyin: 'hǎn yuān jiào qū', meaning: '为遭受冤屈而喊叫。' },
  { word: '屈指可数', pinyin: 'qū zhǐ kě shǔ', meaning: '形容数目很少，扳着手指头就能数过来。' },
  { word: '数一数二', pinyin: 'shǔ yī shǔ èr', meaning: '形容突出。' },
  { word: '二话不说', pinyin: 'èr huà bù shuō', meaning: '不说任何别的话，指立即行动。' },
  { word: '说长道短', pinyin: 'shuō cháng dào duǎn', meaning: '评论别人的好坏是非。' },
  { word: '短兵相接', pinyin: 'duǎn bīng xiāng jiē', meaning: '双方用刀剑等短兵器进行搏斗，比喻面对面地进行针锋相对的斗争。' },
  { word: '接二连三', pinyin: 'jiē èr lián sān', meaning: '一个接着一个，形容接连不断。' },
  { word: '三心二意', pinyin: 'sān xīn èr yì', meaning: '形容犹豫不决或意志不坚定，不专心。' },
  { word: '意气风发', pinyin: 'yì qì fēng fā', meaning: '形容精神振奋，气概豪迈。' },
  { word: '发奋图强', pinyin: 'fā fèn tú qiáng', meaning: '下定决心，努力谋求强盛。' },
  { word: '强词夺理', pinyin: 'qiǎng cí duó lǐ', meaning: '指无理强辩，明明没有理硬说有理。' },
  { word: '理直气壮', pinyin: 'lǐ zhí qì zhuàng', meaning: '理由充分，因而说话做事有气势或心里无愧，无所畏惧。' },
  { word: '壮志凌云', pinyin: 'zhuàng zhì líng yún', meaning: '形容理想宏伟远大。' },
  { word: '云蒸霞蔚', pinyin: 'yún zhēng xiá wèi', meaning: '云气升腾，彩霞弥漫，多形容景物灿烂绚丽。' },
  { word: '蔚然成风', pinyin: 'wèi rán chéng fēng', meaning: '形容一种事物逐渐发展、盛行，形成风气。' },
  { word: '风和日丽', pinyin: 'fēng hé rì lì', meaning: '天气晴朗暖和（多用于春天）。' },
  { word: '丽日蓝天', pinyin: 'lì rì lán tiān', meaning: '明亮的太阳，蓝色的天空，形容天气很好。' },
  { word: '天翻地覆', pinyin: 'tiān fān dì fù', meaning: '形容变化极大；形容闹得很凶。' },
  { word: '覆水难收', pinyin: 'fù shuǐ nán shōu', meaning: '倒在地上的水无法再收回，比喻已成事实的事难以挽回。' },
  { word: '收回成命', pinyin: 'shōu huí chéng mìng', meaning: '取消已公布的命令或决定。' },
  { word: '命中注定', pinyin: 'mìng zhōng zhù dìng', meaning: '迷信的人认为人的一切遭遇都是命运预先决定的，人力无法挽回。' },
  { word: '定国安邦', pinyin: 'dìng guó ān bāng', meaning: '治理和保卫国家，使国家安定稳固。' },
  { word: '邦国殄瘁', pinyin: 'bāng guó tiǎn cuì', meaning: '国家病困，陷于绝境。' },
  { word: '瘁心竭力', pinyin: 'cuì xīn jié lì', meaning: '用尽心思，使出全力。' },
  { word: '力挽狂澜', pinyin: 'lì wǎn kuáng lán', meaning: '比喻尽力挽回危险的局势。' },
  { word: '澜倒波随', pinyin: 'lán dǎo bō suí', meaning: '比喻言行无标准，随波逐流。' },
  { word: '随机应变', pinyin: 'suí jī yìng biàn', meaning: '跟着情况的变化，掌握时机，灵活应付。' },
  { word: '变本加厉', pinyin: 'biàn běn jiā lì', meaning: '变得比原来更加严重。' },
  { word: '厉兵秣马', pinyin: 'lì bīng mò mǎ', meaning: '磨好兵器，喂好马，形容准备战斗。' },
  { word: '马到成功', pinyin: 'mǎ dào chéng gōng', meaning: '战马一到就取胜，形容事情顺利，很快取得成果。' },
  { word: '功亏一篑', pinyin: 'gōng kuī yī kuì', meaning: '堆九仞高的土山，只差一筐土而不能完成，比喻一件大事只差最后一点人力物力而不能成功（含惋惜意）。' },
  { word: '篑土成山', pinyin: 'kuì tǔ chéng shān', meaning: '一筐筐土堆积起来可以成山，比喻积小成大。' },
  { word: '山穷水尽', pinyin: 'shān qióng shuǐ jìn', meaning: '山和水都到了尽头，前面再没有路可走了，比喻陷入绝境。' },
  { word: '尽心竭力', pinyin: 'jìn xīn jié lì', meaning: '用尽心思，使出全力。' },
  { word: '力不从心', pinyin: 'lì bù cóng xīn', meaning: '心里想做，可是能力或力量够不上。' },
  { word: '心花怒放', pinyin: 'xīn huā nù fàng', meaning: '形容高兴极了。' },
  { word: '放虎归山', pinyin: 'fàng hǔ guī shān', meaning: '比喻放走敌人，留下祸根。' },
  { word: '山盟海誓', pinyin: 'shān méng hǎi shì', meaning: '男女相爱时所立的誓言和盟约，表示爱情要像山和海一样永恒不变。' },
  { word: '誓不两立', pinyin: 'shì bù liǎng lì', meaning: '发誓不跟仇敌在一个天底下并存，形容仇恨极深。' },
  { word: '立竿见影', pinyin: 'lì gān jiàn yǐng', meaning: '把竹竿竖在太阳光下，立刻就看到影子，比喻立见功效。' },
  { word: '影影绰绰', pinyin: 'yǐng yǐng chuò chuò', meaning: '模模糊糊，不真切。' },
  { word: '绰绰有余', pinyin: 'chuò chuò yǒu yú', meaning: '形容很宽裕，用不完。' },
  { word: '余勇可贾', pinyin: 'yú yǒng kě gǔ', meaning: '还有剩余力量可以使出来。' },
  { word: '贾勇争先', pinyin: 'gǔ yǒng zhēng xiān', meaning: '鼓足勇气，争着赶在前头。' },
  { word: '先睹为快', pinyin: 'xiān dǔ wéi kuài', meaning: '以能尽先看到为快乐，形容盼望殷切。' },
  { word: '快马加鞭', pinyin: 'kuài mǎ jiā biān', meaning: '对快跑的马再打几鞭子，使它跑得更快，比喻快上加快。' },
  { word: '鞭长莫及', pinyin: 'biān cháng mò jí', meaning: '原来是说虽然鞭子长，但是不应该打到马肚子上，后来借指力量达不到。' },
  { word: '及锋而试', pinyin: 'jí fēng ér shì', meaning: '趁锋利的时候用它，原指乘士气高涨的时候使用军队，后比喻乘有利的时机行动。' },
  { word: '试金石', pinyin: 'shì jīn shí', meaning: '比喻精确可靠的检验方法。' },
  { word: '石破天惊', pinyin: 'shí pò tiān jīng', meaning: '原形容箜篌的声音忽而高亢，忽而低沉，使人震惊，有不可名状的奇境，后多用来比喻文章议论新奇惊人。' },
  { word: '惊天动地', pinyin: 'jīng tiān dòng dì', meaning: '形容声音特别响亮；形容声势浩大或事业伟大。' },
  { word: '地老天荒', pinyin: 'dì lǎo tiān huāng', meaning: '指经过的时间很久。' },
  { word: '荒无人烟', pinyin: 'huāng wú rén yān', meaning: '十分荒凉，没有人家。' },
  { word: '烟消云散', pinyin: 'yān xiāo yún sàn', meaning: '比喻事物消失净尽。' },
  { word: '散兵游勇', pinyin: 'sǎn bīng yóu yǒng', meaning: '指没有统帅的逃散的士兵，也比喻没有组织的集体队伍中的人。' },
  { word: '勇往直前', pinyin: 'yǒng wǎng zhí qián', meaning: '勇敢地一直向前进。' },
  { word: '前因后果', pinyin: 'qián yīn hòu guǒ', meaning: '事情的起因和结果；事情的全过程。' },
  { word: '果不其然', pinyin: 'guǒ bù qí rán', meaning: '果然（强调不出所料）。' },
  { word: '然然可可', pinyin: 'rán rán kě kě', meaning: '什么都答应，一味顺从，形容唯唯诺诺。' },
  { word: '可乘之机', pinyin: 'kě chéng zhī jī', meaning: '可以利用的时机。' },
  { word: '机不可失', pinyin: 'jī bù kě shī', meaning: '好的时机不可放过，失掉了不会再来。' },
  { word: '失魂落魄', pinyin: 'shī hún luò pò', meaning: '形容心神不定非常惊慌的样子。' },
  { word: '魄散魂飞', pinyin: 'pò sàn hún fēi', meaning: '形容非常惊恐。' },
  { word: '飞蛾扑火', pinyin: 'fēi é pū huǒ', meaning: '比喻自取灭亡。' },
  { word: '火中取栗', pinyin: 'huǒ zhōng qǔ lì', meaning: '比喻冒危险给别人出力，自己却上了大当，一无所得。' },
  { word: '栗栗危惧', pinyin: 'lì lì wēi jù', meaning: '形容非常害怕。' },
  { word: '惧内之人', pinyin: 'jù nèi zhī rén', meaning: '怕老婆的人。' },
  { word: '人定胜天', pinyin: 'rén dìng shèng tiān', meaning: '指人力能够战胜自然。' },
  { word: '天衣无缝', pinyin: 'tiān yī wú fèng', meaning: '神话传说，仙女穿的天衣，不用针线制作，没有缝儿，比喻事物（多指诗文、话语等）严密，没有一点破绽。' },
  { word: '缝衣浅带', pinyin: 'féng yī qiǎn dài', meaning: '宽袖大带是古代儒者的服饰，借指儒者。' },
  { word: '带金佩紫', pinyin: 'dài jīn pèi zǐ', meaning: '金指金印，紫指紫绶，带着金印，佩着紫绶，形容地位显赫。' },
  { word: '紫气东来', pinyin: 'zǐ qì dōng lái', meaning: '比喻吉祥的征兆。' },
  { word: '来日方长', pinyin: 'lái rì fāng cháng', meaning: '将来的日子还很长，表示事有可为，或劝人不必急于做某事。' },
  { word: '长年累月', pinyin: 'cháng nián lěi yuè', meaning: '形容经历很多年月；很长时期。' },
  { word: '月下老人', pinyin: 'yuè xià lǎo rén', meaning: '传说中主管婚姻的神，后来用作媒人的代称。' },
  { word: '人山人海', pinyin: 'rén shān rén hǎi', meaning: '聚集的人极多。' },
  { word: '海底捞针', pinyin: 'hǎi dǐ lāo zhēn', meaning: '比喻极难找到。' },
  { word: '针锋相对', pinyin: 'zhēn fēng xiāng duì', meaning: '针尖对针尖，比喻双方策略、论点等尖锐地对立。' },
  { word: '对牛弹琴', pinyin: 'duì niú tán qín', meaning: '比喻对不懂道理的人讲道理，对外行人说内行话。' },
  { word: '琴棋书画', pinyin: 'qín qí shū huà', meaning: '弹琴、下棋、书法、绘画，旧时指文人的风雅之事。' },
  { word: '画蛇添足', pinyin: 'huà shé tiān zú', meaning: '比喻做多余的事，反而不恰当。' },
  { word: '足智多谋', pinyin: 'zú zhì duō móu', meaning: '智谋很多，形容善于料事和用计。' },
  { word: '谋事在人', pinyin: 'móu shì zài rén', meaning: '谋划事情在于人的主观努力。' },
  { word: '人定胜天', pinyin: 'rén dìng shèng tiān', meaning: '指人力能够战胜自然。' },
  { word: '天网恢恢', pinyin: 'tiān wǎng huī huī', meaning: '天道像一个广阔的大网，作恶者逃不出这个网，也就是逃不出天道的惩罚。' },
  { word: '恢恢有余', pinyin: 'huī huī yǒu yú', meaning: '形容本领大，能力强，应付困难毫不费力。' },
  { word: '余音袅袅', pinyin: 'yú yīn niǎo niǎo', meaning: '形容音乐悦耳动听，令人沉醉。' },
  { word: '袅袅炊烟', pinyin: 'niǎo niǎo chuī yān', meaning: '形容烟气缭绕上升。' },
  { word: '烟雨蒙蒙', pinyin: 'yān yǔ méng méng', meaning: '形容雨景迷茫。' },
  { word: '蒙混过关', pinyin: 'méng hùn guò guān', meaning: '用欺骗的手段逃避询问或审查。' },
  { word: '关怀备至', pinyin: 'guān huái bèi zhì', meaning: '关心得无微不至。' },
  { word: '至死不渝', pinyin: 'zhì sǐ bù yú', meaning: '到死都不改变。' },
  { word: '渝盟负约', pinyin: 'yú méng fù yuē', meaning: '违背和抛弃盟约。' },
  { word: '约定俗成', pinyin: 'yuē dìng sú chéng', meaning: '指某种事物的名称或社会习惯是由人们经过长期实践而认定或形成的。' },
  { word: '成千上万', pinyin: 'chéng qiān shàng wàn', meaning: '形容数量非常多。' },
  { word: '万事如意', pinyin: 'wàn shì rú yì', meaning: '一切都符合心意。' },
  { word: '意味深长', pinyin: 'yì wèi shēn cháng', meaning: '含意深远，耐人寻味。' },
  { word: '长命百岁', pinyin: 'cháng mìng bǎi suì', meaning: '寿命很长，能活到一百岁，常用于祝福长寿。' },
  { word: '岁岁平安', pinyin: 'suì suì píng ān', meaning: '每一年都平平安安。' },
  { word: '安步当车', pinyin: 'ān bù dàng chē', meaning: '慢慢地步行，就当作是坐车。' },
  { word: '车水马龙', pinyin: 'chē shuǐ mǎ lóng', meaning: '车像流水，马像游龙，形容车马或车辆很多，来往不绝。' },
  { word: '龙马精神', pinyin: 'lóng mǎ jīng shén', meaning: '比喻人精神旺盛。' },
  { word: '神采奕奕', pinyin: 'shén cǎi yì yì', meaning: '形容精神饱满，容光焕发。' },
  { word: '奕奕生辉', pinyin: 'yì yì shēng huī', meaning: '形容光彩闪耀的样子。' },
  { word: '辉煌灿烂', pinyin: 'huī huáng càn làn', meaning: '形容光彩四射，鲜明耀眼。' },
  { word: '烂熟于心', pinyin: 'làn shú yú xīn', meaning: '形容对某件事情熟悉得好像在心里一样清楚。' },
  { word: '心安理得', pinyin: 'xīn ān lǐ dé', meaning: '自信事情做得合理，心里很坦然。' },
  { word: '得心应手', pinyin: 'dé xīn yìng shǒu', meaning: '心里怎么想，手里就能怎么做，形容运用自如。' },
  { word: '手忙脚乱', pinyin: 'shǒu máng jiǎo luàn', meaning: '形容做事慌张而没有条理，也形容惊慌失措。' },
  { word: '乱七八糟', pinyin: 'luàn qī bā zāo', meaning: '形容混乱；乱糟糟的。' },
  { word: '糟糠之妻', pinyin: 'zāo kāng zhī qī', meaning: '指贫穷时共患难的妻子。' },
  { word: '妻离子散', pinyin: 'qī lí zǐ sàn', meaning: '形容一家人被迫分散四处。' },
  { word: '散花天女', pinyin: 'sàn huā tiān nǚ', meaning: '佛经故事里的神女，有时也指佛教壁画中的仙女。' },
  { word: '女娲补天', pinyin: 'nǚ wā bǔ tiān', meaning: '古代神话，女娲炼五色石补天，形容改造天地的雄伟气魄和大无畏的斗争精神。' },
  { word: '天经地义', pinyin: 'tiān jīng dì yì', meaning: '指非常正确、不容置疑的道理。' },
  { word: '义不容辞', pinyin: 'yì bù róng cí', meaning: '道义上不允许推辞。' },
  { word: '辞旧迎新', pinyin: 'cí jiù yíng xīn', meaning: '告别旧的一年，迎接新的一年的到来，即庆贺新年的意思。' },
  { word: '新陈代谢', pinyin: 'xīn chén dài xiè', meaning: '泛指新的事物滋生发展，代替旧的事物。' },
  { word: '谢天谢地', pinyin: 'xiè tiān xiè dì', meaning: '迷信的人认为处境顺利是天帝和神灵的保祐，因此表示感激或庆幸。' },
  { word: '地大物博', pinyin: 'dì dà wù bó', meaning: '土地广大，物产丰富。' },
  { word: '博学多才', pinyin: 'bó xué duō cái', meaning: '学识广博，有多方面的才能。' },
  { word: '才子佳人', pinyin: 'cái zǐ jiā rén', meaning: '旧时指才华出众的男子和姿容美丽的女子。' },
  { word: '人山人海', pinyin: 'rén shān rén hǎi', meaning: '聚集的人极多。' },
];

@Injectable()
export class IdiomChainService {
  private readonly idiomMap: Map<string, IdiomInfo[]> = new Map();

  constructor() {
    this.buildIndex();
  }

  private buildIndex(): void {
    for (const idiom of IDIOM_DATA) {
      const firstChar = idiom.word.charAt(0);
      if (!this.idiomMap.has(firstChar)) {
        this.idiomMap.set(firstChar, []);
      }
      this.idiomMap.get(firstChar)!.push(idiom);
    }
  }

  validateIdiom(word: string): IdiomInfo | null {
    const trimmed = word.trim();
    if (trimmed.length < 2) return null;
    return IDIOM_DATA.find(i => i.word === trimmed) || null;
  }

  findIdiomByFirstChar(char: string, usedWords: Set<string>): IdiomInfo | null {
    const candidates = this.idiomMap.get(char);
    if (!candidates || candidates.length === 0) return null;

    const available = candidates.filter(c => !usedWords.has(c.word));
    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  checkMatch(prevWord: string, nextWord: string): boolean {
    if (!prevWord || !nextWord) return false;
    const lastChar = prevWord.charAt(prevWord.length - 1);
    const firstChar = nextWord.charAt(0);
    return lastChar === firstChar;
  }

  createNewGame(): GameState {
    const firstIdiom = this.getRandomIdiom();
    return {
      chain: [{
        id: 1,
        role: 'ai',
        word: firstIdiom.word,
        pinyin: firstIdiom.pinyin,
        meaning: firstIdiom.meaning,
        timestamp: Date.now(),
      }],
      currentTail: firstIdiom.word.charAt(firstIdiom.word.length - 1),
      gameOver: false,
      usedWords: [firstIdiom.word],
      round: 1,
      message: 'AI 先出成语，该你了！',
      errorType: null,
      errorDetail: undefined,
    };
  }

  getRandomIdiom(): IdiomInfo {
    const starters = IDIOM_DATA.filter(i => {
      const tail = i.word.charAt(i.word.length - 1);
      return this.idiomMap.has(tail) && this.idiomMap.get(tail)!.length > 0;
    });
    return starters[Math.floor(Math.random() * starters.length)];
  }

  async userSubmit(
    userWord: string,
    currentState: GameState,
  ): Promise<GameState> {
    const usedWords = new Set(currentState.usedWords);
    const trimmedWord = userWord.trim();

    const idiomInfo = this.validateIdiom(trimmedWord);
    if (!idiomInfo) {
      return {
        ...currentState,
        message: `「${trimmedWord}」不是一个有效的成语，请重新输入！`,
        errorType: 'invalid_idiom',
        errorDetail: '系统词库中未找到该成语，请检查拼写或换一个常用成语试试。',
      };
    }

    if (usedWords.has(trimmedWord)) {
      return {
        ...currentState,
        message: `「${trimmedWord}」已经用过了，请换一个！`,
        errorType: 'already_used',
        errorDetail: '同一局对战中每个成语只能使用一次。',
      };
    }

    if (!this.checkMatch(currentState.currentTail, trimmedWord)) {
      return {
        ...currentState,
        message: `接龙错误！需要以「${currentState.currentTail}」开头的成语。`,
        errorType: 'wrong_tail',
        errorDetail: `当前需以「${currentState.currentTail}」字开头，你输入的「${trimmedWord}」是以「${trimmedWord.charAt(0)}」开头的。`,
      };
    }

    usedWords.add(trimmedWord);
    const newChain = [...currentState.chain, {
      id: currentState.chain.length + 1,
      role: 'user' as const,
      word: trimmedWord,
      pinyin: idiomInfo.pinyin,
      meaning: idiomInfo.meaning,
      timestamp: Date.now(),
    }];

    const tailChar = trimmedWord.charAt(trimmedWord.length - 1);
    const aiResponse = this.findIdiomByFirstChar(tailChar, usedWords);

    if (!aiResponse) {
      return {
        chain: newChain,
        currentTail: tailChar,
        gameOver: true,
        winner: 'user',
        usedWords: Array.from(usedWords),
        round: currentState.round + 1,
        message: `太棒了！AI 接不上「${tailChar}」开头的成语，你赢了！🎉`,
        errorType: null,
        errorDetail: undefined,
      };
    }

    usedWords.add(aiResponse.word);
    const finalChain = [...newChain, {
      id: newChain.length + 1,
      role: 'ai' as const,
      word: aiResponse.word,
      pinyin: aiResponse.pinyin,
      meaning: aiResponse.meaning,
      timestamp: Date.now(),
    }];

    return {
      chain: finalChain,
      currentTail: aiResponse.word.charAt(aiResponse.word.length - 1),
      gameOver: false,
      usedWords: Array.from(usedWords),
      round: currentState.round + 1,
      message: `AI 接了「${aiResponse.word}」，该你了！`,
      errorType: null,
      errorDetail: undefined,
    };
  }

  getAllIdioms(): IdiomInfo[] {
    return IDIOM_DATA;
  }

  getHint(currentTail: string, usedWords: string[]): IdiomInfo | null {
    return this.findIdiomByFirstChar(currentTail, new Set(usedWords));
  }
}