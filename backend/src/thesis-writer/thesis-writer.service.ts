import { Injectable } from '@nestjs/common';

export interface GenerateRequest {
  topic: string;
  researchDirection: string;
  sectionType: string;
  academicLevel: string;
  wordCount: string;
  citationStyle: string;
  discipline: string;
  paperType: string;
  customRequirements?: string;
}

export interface GenerateResponse {
  result: string;
  sectionType: string;
  academicLevel: string;
  discipline: string;
  paperType: string;
  wordCount: number;
  outline: string[];
}

interface SectionTemplate {
  openings: string[];
  contentParagraphs: string[];
  methodologies?: string[];
  analysisPoints: string[];
  citations: string[];
  transitions: string[];
  conclusions: string[];
}

interface DisciplineConfig {
  name: string;
  terminology: string[];
  methodologyPhrases: string[];
  analysisPhrases: string[];
  structureHints: string[];
  toneModifiers: string[];
}

interface PaperTypeConfig {
  name: string;
  focusKeywords: string[];
  structurePreference: string;
  emphasisPhrases: string[];
}

const ACADEMIC_LEVEL_CONFIG: Record<string, {
  name: string; vocabularyLevel: string; complexity: number; formality: string }> = {
  bachelor: { name: '本科', vocabularyLevel: '基础', complexity: 1, formality: '正式' },
  master: { name: '硕士', vocabularyLevel: '进阶', complexity: 2, formality: '严谨' },
  doctor: { name: '博士', vocabularyLevel: '专业', complexity: 3, formality: '学术' },
  journal: { name: '期刊投稿', vocabularyLevel: '前沿', complexity: 3, formality: '专业' },
  course: { name: '课程论文', vocabularyLevel: '中级', complexity: 2, formality: '规范' },
};

const WORD_COUNT_CONFIG: Record<string, { key: string; name: string; paragraphs: number; sentencesPerPara: number }> = {
  short: { key: 'short', name: '简短 (800-1200字)', paragraphs: 3, sentencesPerPara: 4 },
  medium: { key: 'medium', name: '中等 (1500-2500字)', paragraphs: 5, sentencesPerPara: 5 },
  long: { key: 'long', name: '详细 (3000-5000字)', paragraphs: 8, sentencesPerPara: 6 },
};

const CITATION_STYLES: Record<string, string> = {
  apa: 'APA (American Psychological Association)',
  mla: 'MLA (Modern Language Association)',
  chicago: 'Chicago/Turabian',
  gb7714: 'GB/T 7714 (中国国家标准)',
  ieee: 'IEEE',
};

const DISCIPLINE_CONFIGS: Record<string, DisciplineConfig> = {
  engineering: {
    name: '理工科',
    terminology: ['实验验证', '数值模拟', '理论推导', '算法设计', '系统实现', '性能评估', '参数优化', '误差分析'],
    methodologyPhrases: [
      '采用控制变量法进行系统实验，每组实验重复三次取平均值以减小随机误差。',
      '运用有限元分析方法对研究对象进行数值模拟，网格划分精度设置为毫米级。',
      '基于经典理论框架建立数学模型，通过严格的数学推导得出核心结论。',
      '设计并实现原型系统，在标准测试集上进行对比实验以验证方法有效性。',
    ],
    analysisPhrases: [
      '从实验结果可以看出，所提方法在准确率指标上较基线方法提升了约15%，具有统计学显著性差异（p<0.05）。',
      '通过对参数敏感性的分析，发现变量A对系统性能的影响最为显著，相关系数达到0.87。',
      '理论分析与实验结果高度吻合，验证了所建模型的正确性与有效性。',
      '消融实验结果表明，各模块均对整体性能有正向贡献，其中核心模块的贡献度最大。',
    ],
    structureHints: ['理论分析', '方法设计', '实验验证', '结果讨论'],
    toneModifiers: ['严谨', '客观', '可复现', '量化'],
  },
  humanities: {
    name: '人文社科',
    terminology: ['文本阐释', '话语分析', '历史脉络', '社会建构', '文化批判', '价值取向', '意识形态', '主体间性'],
    methodologyPhrases: [
      '采用文本细读法对原始文献进行深度阐释，兼顾作者意图与文本意义的开放性。',
      '运用话语分析理论，揭示文本背后的权力关系与意识形态运作机制。',
      '结合历史文献梳理与理论思辨，厘清该概念在不同历史语境中的演变轨迹。',
      '通过多案例比较分析，提炼出具有普遍解释力的理论框架。',
    ],
    analysisPhrases: [
      '从上述文本分析可见，该话语策略在构建社会共识的同时，也隐含着某种深层的权力运作。',
      '历史地看，这一观念的形成并非偶然，而是特定社会历史条件与思想传统交汇的产物。',
      '与西方同类理论相比，本土思想资源显示出独特的问题意识与理论品格，值得深入挖掘。',
      '这种张力结构恰恰构成了该现象最富启发性的理论面向，值得学界进一步关注。',
    ],
    structureHints: ['概念溯源', '理论辨析', '文本阐释', '价值反思'],
    toneModifiers: ['思辨', '阐释', '批判', '反思'],
  },
  medical: {
    name: '医学',
    terminology: ['临床研究', '随机对照试验', 'Meta分析', '流行病学调查', '病理机制', '预后因素', '不良反应', '循证医学'],
    methodologyPhrases: [
      '采用前瞻性随机对照研究设计，将研究对象按1:1比例随机分配至实验组和对照组。',
      '按照纳入排除标准筛选研究对象，样本量估算基于主要结局指标的预期效应量。',
      '运用系统性文献回顾与Meta分析方法，检索PubMed、Embase、Cochrane等数据库。',
      '采用队列研究设计，随访周期为24个月，主要观察终点为不良事件发生率。',
    ],
    analysisPhrases: [
      '实验组与对照组在基线特征上无统计学差异（P>0.05），具有可比性。',
      '研究结果显示，干预组总有效率为86.7%，显著高于对照组的63.3%，差异有统计学意义（P<0.01）。',
      '多因素Logistic回归分析表明，年龄、病程和合并症是影响预后的独立危险因素。',
      '本研究的局限性在于样本量相对较小、随访时间有限，结论有待大样本多中心研究进一步验证。',
    ],
    structureHints: ['研究对象与方法', '观察指标', '统计学处理', '结果与讨论'],
    toneModifiers: ['循证', '安全', '伦理', '临床意义'],
  },
  business: {
    name: '经济管理',
    terminology: ['实证研究', '面板数据', '回归分析', '稳健性检验', '中介效应', '调节变量', '异质性分析', '机制检验'],
    methodologyPhrases: [
      '选取2015-2023年A股上市公司为研究样本，数据来源于CSMAR和Wind数据库。',
      '构建双向固定效应模型进行基准回归，同时控制行业和年份固定效应。',
      '采用逐步回归法检验中介效应，依次验证自变量、中介变量和因变量之间的关系。',
      '为缓解内生性问题，采用工具变量法和双重差分模型进行稳健性检验。',
    ],
    analysisPhrases: [
      '基准回归结果显示，核心解释变量的回归系数在1%水平上显著为正，表明「{topic}」对被解释变量具有显著的正向促进作用。',
      '机制检验表明，「{topic}」主要通过提升创新效率和优化资源配置两条路径作用于因变量。',
      '异质性分析发现，该效应在国有企业和高科技企业中更为显著，存在明显的企业异质性。',
      '经过替换变量、改变样本区间和采用工具变量等多种稳健性检验后，上述结论依然成立。',
    ],
    structureHints: ['理论分析与假设', '研究设计', '实证结果', '机制与异质性'],
    toneModifiers: ['数据驱动', '因果识别', '政策启示', '实践价值'],
  },
  education: {
    name: '教育学',
    terminology: ['教学实验', '行动研究', '问卷调查', '访谈法', '教学干预', '学习效果', '核心素养', '教学模式'],
    methodologyPhrases: [
      '采用准实验研究设计，选取两个平行班分别作为实验班和对照班，实施一学期的教学干预。',
      '运用混合研究方法，结合问卷调查、课堂观察和半结构化访谈等多种方式收集数据。',
      '基于建构主义学习理论设计教学方案，以项目式学习为主要教学组织形式。',
      '采用SPSS和NVivo软件分别对定量和定性数据进行统计分析与主题编码。',
    ],
    analysisPhrases: [
      '独立样本t检验结果显示，实验班学生的后测成绩显著高于对照班（t=3.42, p<0.01），效应量Cohen\'s d=0.68，属于中等偏上效应。',
      '访谈资料分析表明，学生普遍认为该教学模式提升了学习兴趣和自主学习能力。',
      '从课堂观察记录来看，实验班学生的参与度和互动频次均明显高于对照班。',
      '研究同时发现，该教学模式对不同学业水平学生的影响存在差异，对中等生的促进作用最为明显。',
    ],
    structureHints: ['教学研究设计', '干预方案', '效果评估', '教学建议'],
    toneModifiers: ['教学实践', '学生发展', '可推广', '教学改进'],
  },
  general: {
    name: '通用/综合',
    terminology: ['理论分析', '实证研究', '文献综述', '案例分析', '系统研究', '综合评估'],
    methodologyPhrases: [
      '采用文献研究法与实证分析相结合的研究方法，对相关理论进行系统梳理。',
      '通过多维度的分析框架，对研究对象进行全面深入的考察。',
      '选取典型案例进行深入剖析，以揭示其内在规律与外在特征。',
      '综合运用多种研究方法，确保研究结论的科学性与可靠性。',
    ],
    analysisPhrases: [
      '研究结果表明，「{topic}」在实际应用中展现出显著的理论意义与实践价值。',
      '从多维度的分析来看，「{topic}」呈现出复杂多元的特征，需要系统把握。',
      '与现有研究相比，本文的发现进一步丰富和深化了对该问题的认识。',
      '上述分析为理解「{topic}」的本质与规律提供了新的视角和证据。',
    ],
    structureHints: ['理论基础', '研究方法', '分析讨论', '结论建议'],
    toneModifiers: ['系统', '全面', '深入'],
  },
};

const PAPER_TYPE_CONFIGS: Record<string, PaperTypeConfig> = {
  theoretical: {
    name: '理论研究',
    focusKeywords: ['理论建构', '概念辨析', '逻辑推演', '范式创新'],
    structurePreference: '侧重概念界定、理论框架构建和逻辑论证',
    emphasisPhrases: [
      '本研究的核心贡献在于提出了新的理论分析框架，为后续研究提供了新的概念工具。',
      '通过对现有理论的批判性反思，本文试图在理论层面实现一定的突破与创新。',
    ],
  },
  empirical: {
    name: '实证研究',
    focusKeywords: ['数据收集', '假设检验', '统计分析', '经验证据'],
    structurePreference: '侧重研究设计、数据分析和假设检验',
    emphasisPhrases: [
      '本文基于大样本实证数据，对研究假设进行了严格的统计检验。',
      '实证结果为相关理论提供了来自经验层面的有力支持。',
    ],
  },
  case: {
    name: '案例研究',
    focusKeywords: ['典型案例', '深度剖析', '过程追踪', '情境化分析'],
    structurePreference: '侧重案例介绍、分析框架和案例讨论',
    emphasisPhrases: [
      '通过对典型案例的深度剖析，本文揭示了「{topic}」在具体情境下的运作机制。',
      '案例研究的发现为理解复杂现象提供了丰富的细节和深刻的洞见。',
    ],
  },
  review: {
    name: '文献综述',
    focusKeywords: ['系统梳理', '研究脉络', '前沿热点', '未来展望'],
    structurePreference: '侧重文献梳理、脉络分析和研究展望',
    emphasisPhrases: [
      '本文系统梳理了该领域的研究脉络，指出现有研究的共识、争议和未来方向。',
      '通过对国内外文献的全面回顾，本文试图描绘出该领域的知识图谱。',
    ],
  },
  design: {
    name: '设计开发',
    focusKeywords: ['需求分析', '系统设计', '原型实现', '测试评估'],
    structurePreference: '侧重设计思路、技术实现和效果验证',
    emphasisPhrases: [
      '本文完成了系统的需求分析、架构设计和原型实现，并通过测试验证了方案的可行性。',
      '设计方案充分考虑了实用性、可扩展性和用户体验，具有良好的应用前景。',
    ],
  },
  general: {
    name: '综合研究',
    focusKeywords: ['多视角', '综合分析', '全面研究'],
    structurePreference: '兼顾理论与实证的综合研究',
    emphasisPhrases: [
      '本文从多个角度对「{topic}」进行了全面系统的研究。',
      '综合理论分析与实证考察，本文得出以下主要结论。',
    ],
  },
};

const SECTION_TEMPLATES: Record<string, SectionTemplate> = {
  abstract: {
    openings: [
      '「{topic}」作为{researchDirection}领域的重要研究课题，近年来受到学术界的广泛关注。',
      '随着{researchDirection}的快速发展，「{topic}」逐渐成为该领域研究的热点问题。',
      '本文以「{topic}」为研究对象，系统探讨了其在{researchDirection}语境下的理论内涵与实践价值。',
    ],
    contentParagraphs: [
      '本研究采用文献综述与实证分析相结合的研究方法，对相关理论进行了系统梳理。',
      '研究发现，「{topic}」在实际应用中展现出显著的理论意义与实践价值，为相关领域提供了新的研究视角。',
      '通过深入分析，本文揭示了「{topic}」的内在机制与外在表现特征。',
      '研究结果表明，「{topic}」对推动{researchDirection}的发展具有重要的理论贡献。',
    ],
    analysisPoints: [
      '从理论层面来看，本研究丰富了{researchDirection}领域的相关理论体系，为后续研究提供了新的分析框架。',
      '从实践角度而言，研究结论对相关行业的发展具有一定的指导意义和参考价值。',
    ],
    citations: [
      '（张三等，2023）',
      '（Smith & Johnson, 2022）',
      '（李四，2021）',
    ],
    transitions: [
      '综上所述，',
      '进一步分析表明，',
      '值得注意的是，',
    ],
    conclusions: [
      '本文的研究成果为「{topic}」的后续研究提供了有益的参考和借鉴。',
      '未来研究可在本研究基础上，进一步拓展研究视野，深化对「{topic}」的理解与应用。',
    ],
  },
  introduction: {
    openings: [
      '1. 绪论\n\n1.1 研究背景与意义\n\n在当前{researchDirection}快速发展的时代背景下，「{topic}」这一课题日益凸显其重要性与紧迫性。',
      '近年来，随着社会经济的发展和科学技术的进步，{researchDirection}领域发生了深刻变革，「{topic}」作为其中的关键议题，愈发受到学界和业界的广泛关注。',
    ],
    contentParagraphs: [
      '从国际视野来看，「{topic}」的研究已经取得了一系列重要进展，诸多学者从不同角度对其进行了深入探讨。',
      '然而，现有研究在理论框架、研究方法和实践应用等方面仍存在一定的局限性，有待进一步完善。',
      '在此背景下，本文选择「{topic}」作为研究主题，具有重要的理论意义和现实价值。',
    ],
    methodologies: [
      '1.2 国内外研究现状\n\n国外学者关于「{topic}」的研究起步较早，形成了较为系统的理论体系。Smith (2020) 从理论层面系统阐述了相关概念框架，为后续研究奠定了基础。Johnson等 (2021) 则通过实证研究验证了关键变量之间的关系。国内学者在此领域也进行了积极探索，张三（2022）从本土视角出发，构建了适用于中国情境的分析模型。',
      '1.3 研究内容与方法\n\n本文主要围绕「{topic}」展开研究，具体包括以下几个方面：首先，梳理相关理论基础；其次，分析当前现状及存在问题；再次，构建理论模型并进行实证检验；最后，提出对策建议。研究方法上，本文采用文献研究法、实证分析法和案例研究法相结合，确保研究结论的科学性与可靠性。',
    ],
    analysisPoints: [
      '本研究的创新之处在于：一是拓展了「{topic}」的研究视角；二是构建了更为全面的分析框架；三是提出了具有可操作性的对策建议。',
    ],
    citations: [
      '（Smith, 2020）',
      '（Johnson et al., 2021）',
      '（张三，2022）',
    ],
    transitions: [
      '基于上述分析，',
      '在此基础上，',
      '与此同时，',
    ],
    conclusions: [
      '通过上述研究，本文期望能够为「{topic}」领域的理论发展和实践应用做出一定的贡献。',
    ],
  },
  literature: {
    openings: [
      '2. 文献综述\n\n2.1 相关概念界定\n\n「{topic}」作为{researchDirection}领域的核心概念，其内涵丰富且不断演化。',
    ],
    contentParagraphs: [
      '早期研究主要从理论层面对「{topic}」的概念进行了界定。学者们普遍认为，「{topic}」具有多维度的特征，包括理论性、实践性和发展性等方面。',
      '随着研究的深入，学界对「{topic}」的理解逐步深化，形成了多个理论流派，各有侧重且互为补充。',
      '近年来，跨学科研究为「{topic}」的研究提供了新的视角，推动了该领域的繁荣发展。',
    ],
    methodologies: [
      '2.2 理论基础\n\n本文的研究主要基于以下理论：第一，经典理论框架，为研究提供了基本的分析视角；第二，系统论方法，有助于全面把握研究对象的整体特征；第三，实证研究范式，确保研究结论的科学性。',
      '2.3 研究现状评述\n\n综上所述，现有研究为本文奠定了坚实基础，但仍存在以下不足：一是理论整合研究较多，实证研究相对匮乏；二是宏观研究视角有待深化；三是跨学科研究尚处于起步阶段。这些不足正是本文试图弥补的研究空间。',
    ],
    analysisPoints: [
      '通过文献梳理可以发现，「{topic}」的研究呈现出以下发展趋势：一是研究方法日益多元化；二是研究视角不断拓展；三是理论与实践结合更加紧密。',
    ],
    citations: [
      '（王五，2020）',
      '（Williams, 2019）',
      '（Zhao et al., 2021）',
      '（陈六，2022）',
    ],
    transitions: [
      '进一步而言，',
      '具体来看，',
      '从另一个角度，',
    ],
    conclusions: [
      '本章对相关文献进行了系统梳理，为后续章节的分析奠定了理论基础。',
    ],
  },
  methodology: {
    openings: [
      '3. 研究设计与方法\n\n3.1 研究思路\n\n本章详细阐述本文的研究设计，包括研究思路、研究方法、数据来源及分析方法等内容。',
    ],
    contentParagraphs: [
      '本文采用定量与定性相结合的混合研究方法，以确保研究结论的科学性和可靠性。',
      '在研究设计上，遵循从理论到实证、从宏观到微观的逻辑思路，系统分析「{topic}」的内在规律。',
    ],
    methodologies: [
      '3.2 研究方法\n\n（1）文献研究法：通过系统梳理国内外相关文献，全面了解「{topic}」的研究现状和理论基础。\n\n（2）问卷调查法：设计科学合理的调查问卷，收集第一手数据资料。\n\n（3）案例分析法：选取典型案例进行深入剖析，验证研究假设。\n\n（4）统计分析法：运用描述性统计、相关性分析和回归分析等方法对数据进行处理。',
      '3.3 样本选择与数据来源\n\n本研究的数据来源主要包括：一是公开的官方统计数据；二是问卷调查所得的一手数据；三是案例企业的内部资料。样本选择遵循科学性和代表性原则，确保研究结果具有普适性。',
      '3.4 变量测量与模型构建\n\n本文的核心变量包括自变量、因变量和控制变量。自变量主要衡量「{topic}」的关键维度，因变量反映研究对象的表现特征。在此基础上，构建如下理论模型，提出相关研究假设。',
    ],
    analysisPoints: [
      '本研究方法体系具有以下特点：一是多种方法互补，增强研究的严谨性；二是数据来源多元，提升结论的可靠性；三是分析路径清晰，保证逻辑的严密性。',
    ],
    citations: [
      '（根据{citationStyle}格式）',
    ],
    transitions: [
      '具体而言，',
      '在此过程中，',
    ],
    conclusions: [
      '通过上述研究方法的系统运用，本文将对「{topic}」进行深入分析，以获得科学的研究结论。',
    ],
  },
  analysis: {
    openings: [
      '4. 实证分析与结果\n\n4.1 描述性统计分析\n\n本章对收集的数据进行系统的实证分析。',
    ],
    contentParagraphs: [
      '首先对样本数据进行描述性统计分析，结果显示各变量的均值、标准差和分布情况基本符合预期。',
      '相关性分析结果表明，核心变量之间存在显著的相关关系，为后续回归分析奠定了基础。',
    ],
    methodologies: [
      '4.2 回归分析结果\n\n通过多元回归分析，检验本文提出的研究假设。回归结果显示，「{topic}」的各维度对因变量具有显著影响，假设1得到验证。控制变量的影响也在统计上显著，模型整体拟合度良好。',
      '4.3 稳健性检验\n\n为确保研究结论的可靠性，本文采用替换变量和改变样本等多种方法进行稳健性检验，结果与主回归基本一致，说明研究结论具有稳健可靠。',
      '4.4 异质性分析\n\n进一步的异质性分析发现，「{topic}」的影响在不同群体和场景下存在差异，这为深入理解其作用机制提供了新的视角。',
    ],
    analysisPoints: [
      '实证结果表明，「{topic}」具有显著的正向影响，这与理论预期一致。具体而言：第一，影响机制清晰可辨；第二，效果稳定可靠；第三，具有一定的实践指导意义。',
    ],
    citations: [
      '（相关结果与已有研究结论（李四，2022）保持一致。',
      '（这一发现进一步印证了Smith等（2021）的研究。',
    ],
    transitions: [
      '进一步分析发现，',
      '值得关注的是，',
      '从结果可以看出，',
    ],
    conclusions: [
      '本章通过系统的实证分析，验证了本文的研究假设，为后续讨论提供了实证支撑。',
    ],
  },
  discussion: {
    openings: [
      '5. 讨论\n\n5.1 研究结果讨论\n\n本章在前述实证分析的基础上，对研究结果进行深入讨论。',
    ],
    contentParagraphs: [
      '本文的研究结果与理论预期基本一致，「{topic}」展现出重要的影响效应。',
      '这一结果具有深刻的理论内涵，进一步丰富了{researchDirection}领域的相关研究。',
      '从实践角度看，研究结论对相关行业和企业具有重要的启示意义。',
    ],
    methodologies: [
      '5.2 理论贡献\n\n本研究的理论贡献主要体现在：第一，拓展了「{topic}」的理论视角，丰富了相关理论体系；第二，验证了关键机制，深化了对其内在规律的认识；第三，构建了分析框架，为后续研究提供了新的思路。',
      '5.3 实践启示\n\n基于研究结论，本文提出以下实践建议：一是加强理论学习，深化对「{topic}」的理解；二是完善机制建设，保障相关工作有序推进；三是注重创新发展，推动实践应用落地生根。',
    ],
    analysisPoints: [
      '与已有研究相比，本文的创新之处体现在研究视角、研究方法和研究结论等方面。',
    ],
    citations: [
      '（这一结论支持了Wang (2020) 的观点。',
      '（与Zhang等，2023）',
    ],
    transitions: [
      '进一步而言，',
      '从更深层次看，',
      '与此同时，',
    ],
    conclusions: [
      '综上所述，本文的研究结果具有重要的理论价值和实践意义。',
    ],
  },
  conclusion: {
    conclusions: [
      '6. 结论与展望\n\n6.1 研究结论\n\n本文以「{topic}」为研究对象，系统探讨了其在{researchDirection}领域的理论与实践问题。通过理论分析与实证检验，本文得出以下主要结论：\n\n第一，「{topic}」具有丰富的理论内涵，其多维特征相互作用，共同构成了完整的体系。\n\n第二，实证结果表明，「{topic}」对相关领域具有显著的正向影响，这一结论经过多种稳健性检验依然成立。\n\n第三，「{topic}」的影响机制具有多元性和复杂性，需要从多个角度进行综合把握。\n\n第四，实践层面，应充分重视「{topic}」的重要作用，采取有效措施推动其发展。',
      '6.2 研究不足与展望\n\n当然，本研究仍存在一定的局限性：一是样本选择的范围有待进一步扩大；二是研究方法可进一步丰富；三是部分结论的普适性仍需更多实证检验。\n\n未来研究可从以下方面展开：一是拓展研究视角，引入更多理论进行交叉研究；二是丰富研究方法，采用前沿方法进行更深入的分析；三是扩大研究样本，增强结论的普适性；四是加强实践应用，推动理论成果转化。',
    ],
    openings: [],
    contentParagraphs: [],
    analysisPoints: [],
    citations: [],
    transitions: [],
  },
  full: {
    openings: [
      '摘要\n\n「{topic}」作为{researchDirection}领域的重要研究课题，近年来受到学术界的广泛关注。本文以「{topic}」为研究对象，采用文献研究、实证分析和案例研究相结合的方法，系统探讨了其理论内涵、影响机制及实践应用。研究发现，「{topic}」具有多维特征和显著影响，对推动{researchDirection}的发展具有重要的理论价值和实践意义。本文的研究结论丰富了相关领域的理论积累，也为实践应用提供了可借鉴的参考。\n\n关键词：{topic}；{researchDirection}；理论分析；实证研究',
      '\n\n1. 绪论\n\n1.1 研究背景与意义\n\n在当前{researchDirection}快速发展的时代背景下，「{topic}」这一课题日益凸显其重要性与紧迫性。随着社会经济的发展和科学技术的进步，{researchDirection}领域发生了深刻变革，「{topic}」作为其中的关键议题，愈发受到学界和业界的广泛关注。',
    ],
    contentParagraphs: [
      '从国际视野来看「{topic}」的研究已经取得了一系列重要进展，诸多学者从不同角度对其进行了深入探讨。然而，现有研究在理论框架、研究方法和实践应用等方面仍存在一定的局限性，有待进一步完善。在此背景下，本文选择「{topic}」作为研究主题，具有重要的理论意义和现实价值。',
      '1.2 国内外研究现状\n\n国外学者关于「{topic}」的研究起步较早，形成了较为系统的理论体系。Smith (2020) 从理论层面系统阐述了相关概念框架，为后续研究奠定了基础。Johnson等 (2021) 则通过实证研究验证了关键变量之间的关系。国内学者在此领域也进行了积极探索，张三（2022）从本土视角出发，构建了适用于中国情境的分析模型。',
      '1.3 研究内容与方法\n\n本文主要围绕「{topic}」展开研究。研究方法上，采用文献研究法、实证分析法和案例研究法相结合，确保研究结论的科学性与可靠性。本文的创新之处在于：一是拓展了研究视角；二是构建了更为全面的分析框架；三是提出了具有可操作性的对策建议。',
      '\n\n2. 文献综述与理论基础\n\n2.1 相关概念界定\n\n「{topic}」作为{researchDirection}领域的核心概念，其内涵丰富且不断演化。早期研究主要从理论层面对「{topic}」的概念进行了界定。学者们普遍认为，「{topic}」具有多维度的特征。随着研究的深入，学界对「{topic}」的理解逐步深化，形成了多个理论流派。',
      '2.2 理论基础\n\n本文的研究主要基于以下理论：第一，经典理论框架，为研究提供了基本的分析视角；第二，系统论方法，有助于全面把握研究对象的整体特征；第三，实证研究范式，确保研究结论的科学性。',
      '2.3 研究现状评述\n\n综上所述，现有研究为本文奠定了坚实基础，但仍存在一些不足，这些不足正是本文试图弥补的研究空间。',
      '\n\n3. 研究设计\n\n3.1 研究思路与方法\n\n本文采用定量与定性相结合的混合研究方法。研究设计遵循从理论到实证、从宏观到微观的逻辑思路。具体研究方法包括文献研究法、问卷调查法、案例分析法和统计分析法。',
      '3.2 样本选择与数据来源\n\n本研究的数据来源包括官方统计数据、问卷调查和案例资料。样本选择遵循科学性和代表性原则。',
      '3.3 变量测量与模型构建\n\n核心变量包括自变量、因变量和控制变量。在此基础上，构建理论模型，提出研究假设。',
      '\n\n4. 实证分析\n\n4.1 描述性统计\n\n对样本数据进行描述性统计分析，结果显示各变量基本符合预期。相关性分析表明，核心变量之间存在显著相关。',
      '4.2 回归分析结果\n\n多元回归分析检验了本文的研究假设，结果显示「{topic}」的各维度对因变量具有显著影响。',
      '4.3 稳健性检验\n\n采用多种方法进行稳健性检验，结果与主回归基本一致，说明研究结论稳健可靠。',
      '\n\n5. 讨论与建议\n\n5.1 研究结果讨论\n\n研究结果与理论预期基本一致。这一结果具有深刻的理论内涵，进一步丰富了相关研究。从实践角度看，对相关行业具有重要的启示意义。',
      '5.2 理论贡献与实践启示\n\n理论贡献主要体现在拓展了理论视角、验证了关键机制、构建了分析框架。实践建议包括：加强理论学习、完善机制建设、注重创新发展。',
    ],
    analysisPoints: [
      '\n\n6. 结论与展望\n\n6.1 研究结论\n\n本文得出以下主要结论：第一，「{topic}」具有丰富的理论内涵；第二，实证结果表明其具有显著的正向影响；第三，影响机制具有多元性；第四，应充分重视其实践应用。',
      '6.2 研究不足与展望\n\n本研究存在一定局限性。未来可从拓展研究视角、丰富研究方法、扩大研究样本、加强实践应用等方面进一步深入。',
      '\n\n参考文献\n\n[1] Smith J. Theory and Practice of {topic}[J]. Journal of {researchDirection}, 2020, 10(2): 45-67.\n\n[2] Johnson A, Williams B. Empirical Analysis of Key Factors[J]. Academic Review, 2021, 15(3): 89-112.\n\n[3] 张三. {topic}研究[M]. 北京: 学术出版社, 2022.\n\n[4] 李四. {researchDirection}前沿问题研究[J]. 中国学术, 2023, (4): 123-145.\n\n[5] Wang C, Zhang D. A Comprehensive Study[M]. New York: Academic Press, 2020.',
    ],
    citations: [],
    transitions: [],
    conclusions: [],
  },
};

const OUTLINE_TEMPLATES: Record<string, string[]> = {
  abstract: ['研究背景', '研究方法', '核心发现', '研究意义'],
  introduction: ['研究背景与意义', '国内外研究现状', '研究内容与方法', '研究创新点'],
  literature: ['相关概念界定', '理论基础梳理', '国内外研究综述', '研究现状评述'],
  methodology: ['研究思路', '研究方法', '样本与数据', '模型构建'],
  analysis: ['描述性统计', '回归分析', '稳健性检验', '异质性分析'],
  discussion: ['结果讨论', '理论贡献', '实践启示', '研究局限'],
  conclusion: ['主要研究结论', '理论与实践意义', '研究不足', '未来研究展望'],
  full: ['摘要', '绪论', '文献综述与理论基础', '研究设计', '实证分析', '讨论与建议', '结论与展望', '参考文献'],
};

@Injectable()
export class ThesisWriterService {
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

  private fillTemplate(template: string, topic: string, researchDirection: string, citationStyle: string): string {
    return template
      .replace(/\{topic\}/g, topic)
      .replace(/\{researchDirection\}/g, researchDirection)
      .replace(/\{citationStyle\}/g, citationStyle);
  }

  private applyAcademicLevel(text: string, level: string): string {
    let result = text;
    
    if (level === 'doctor' || level === 'journal') {
      result = result.replace(/重要/g, '至关重要');
      result = result.replace(/显著/g, '极为显著');
      result = result.replace(/分析/g, '系统分析');
      result = result.replace(/研究/g, '深入研究');
    } else if (level === 'master') {
      result = result.replace(/重要/g, '较为重要');
      result = result.replace(/显著/g, '较为显著');
    }
    
    return result;
  }

  private applyDisciplineAdaptation(text: string, discipline: string, sectionType: string): string {
    let result = text;
    const disciplineConfig = DISCIPLINE_CONFIGS[discipline] || DISCIPLINE_CONFIGS.general;
    
    if (sectionType === 'methodology' || sectionType === 'full') {
      if (disciplineConfig.methodologyPhrases.length > 0 && Math.random() < 0.7) {
        const phrase = this.getRandomItem(disciplineConfig.methodologyPhrases);
        result = result + '\n\n' + phrase;
      }
    }
    
    if (sectionType === 'analysis' || sectionType === 'discussion' || sectionType === 'full') {
      if (disciplineConfig.analysisPhrases.length > 0 && Math.random() < 0.6) {
        const phrase = this.getRandomItem(disciplineConfig.analysisPhrases);
        result = result + '\n\n' + phrase;
      }
    }
    
    return result;
  }

  private applyPaperTypeAdaptation(text: string, paperType: string, topic: string, researchDirection: string): string {
    let result = text;
    const paperTypeConfig = PAPER_TYPE_CONFIGS[paperType] || PAPER_TYPE_CONFIGS.general;
    
    if (paperTypeConfig.emphasisPhrases.length > 0) {
      const emphasis = this.getRandomItem(paperTypeConfig.emphasisPhrases);
      const filledEmphasis = this.fillTemplate(emphasis, topic, researchDirection, '');
      result = result + '\n\n' + filledEmphasis;
    }
    
    return result;
  }

  private addCustomRequirements(text: string, requirements?: string): string {
    if (!requirements || !requirements.trim()) return text;
    const addition = `\n\n【补充说明】${requirements.trim()}\n\n`;
    return text + addition;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { topic, researchDirection, sectionType, academicLevel, wordCount, citationStyle, discipline, paperType, customRequirements } = request;

    const trimmedTopic = topic.trim();
    const trimmedDirection = researchDirection.trim() || '相关学科';
    const sectionKey = SECTION_TEMPLATES[sectionType] ? sectionType : 'full';
    const template = SECTION_TEMPLATES[sectionKey];
    const lengthConfig = WORD_COUNT_CONFIG[wordCount] || WORD_COUNT_CONFIG.medium;
    const levelConfig = ACADEMIC_LEVEL_CONFIG[academicLevel] || ACADEMIC_LEVEL_CONFIG.bachelor;
    const citationName = CITATION_STYLES[citationStyle] || CITATION_STYLES.gb7714;
    const disciplineConfig = DISCIPLINE_CONFIGS[discipline] || DISCIPLINE_CONFIGS.general;
    const paperTypeConfig = PAPER_TYPE_CONFIGS[paperType] || PAPER_TYPE_CONFIGS.general;

    const paragraphs: string[] = [];

    template.openings.forEach(opening => {
      paragraphs.push(this.fillTemplate(opening, trimmedTopic, trimmedDirection, citationName));
    });

    const contentPool = [...template.contentParagraphs];
    const shuffledContent = this.shuffleArray(contentPool);
    const contentToUse = shuffledContent.slice(0, Math.min(lengthConfig.paragraphs - 2, shuffledContent.length));
    contentToUse.forEach(para => {
      paragraphs.push(this.fillTemplate(para, trimmedTopic, trimmedDirection, citationName));
    });

    if (template.methodologies) {
      const methodoCount = sectionKey === 'full' ? template.methodologies.length : Math.min(2, template.methodologies.length);
      template.methodologies.slice(0, methodoCount).forEach(method => {
        paragraphs.push(this.fillTemplate(method, trimmedTopic, trimmedDirection, citationName));
      });
    }

    template.analysisPoints.forEach(point => {
      paragraphs.push(this.fillTemplate(point, trimmedTopic, trimmedDirection, citationName));
    });

    template.conclusions.forEach(conclusion => {
      paragraphs.push(this.fillTemplate(conclusion, trimmedTopic, trimmedDirection, citationName));
    });

    let resultText = paragraphs.join('\n\n');
    
    resultText = this.applyAcademicLevel(resultText, academicLevel);
    resultText = this.applyDisciplineAdaptation(resultText, discipline, sectionKey);
    resultText = this.applyPaperTypeAdaptation(resultText, paperType, trimmedTopic, trimmedDirection);
    resultText = this.addCustomRequirements(resultText, customRequirements);

    const wordCountNum = resultText.replace(/\s/g, '').length;
    const outline = OUTLINE_TEMPLATES[sectionKey] || OUTLINE_TEMPLATES.full;

    const sectionNameMap: Record<string, string> = {
      abstract: '摘要',
      introduction: '绪论',
      literature: '文献综述',
      methodology: '研究方法',
      analysis: '实证分析',
      discussion: '讨论',
      conclusion: '结论与展望',
      full: '完整论文',
    };

    return {
      result: resultText,
      sectionType: sectionNameMap[sectionKey] || '完整论文',
      academicLevel: levelConfig.name,
      discipline: disciplineConfig.name,
      paperType: paperTypeConfig.name,
      wordCount: wordCountNum,
      outline,
    };
  }
}
