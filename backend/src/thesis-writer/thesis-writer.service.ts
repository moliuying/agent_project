import { Injectable } from '@nestjs/common';

export interface GenerateRequest {
  topic: string;
  researchDirection: string;
  sectionType: string;
  academicLevel: string;
  wordCount: string;
  citationStyle: string;
  customRequirements?: string;
}

export interface GenerateResponse {
  result: string;
  sectionType: string;
  academicLevel: string;
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
    const levelConfig = ACADEMIC_LEVEL_CONFIG[level];
    
    if (level === 'doctor' || level === 'journal') {
      result = result.replace(/重要/g, '至关重要');
      result = result.replace(/显著/g, '极为显著');
      result = result.replace(/分析/g, '系统分析');
      result = result.replace(/研究/g, '深入研究');
    }
    
    return result;
  }

  private addCustomRequirements(text: string, requirements?: string): string {
    if (!requirements || !requirements.trim()) return text;
    const addition = `\n\n【补充说明：${requirements.trim()}\n\n`;
    return text + addition;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { topic, researchDirection, sectionType, academicLevel, wordCount, citationStyle, customRequirements } = request;

    const trimmedTopic = topic.trim();
    const trimmedDirection = researchDirection.trim() || '相关学科';
    const sectionKey = SECTION_TEMPLATES[sectionType] ? sectionType : 'full';
    const template = SECTION_TEMPLATES[sectionKey];
    const lengthConfig = WORD_COUNT_CONFIG[wordCount] || WORD_COUNT_CONFIG.medium;
    const levelConfig = ACADEMIC_LEVEL_CONFIG[academicLevel] || ACADEMIC_LEVEL_CONFIG.bachelor;
    const citationName = CITATION_STYLES[citationStyle] || CITATION_STYLES.gb7714;

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
      wordCount: wordCountNum,
      outline,
    };
  }
}
