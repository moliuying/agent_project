import { Injectable } from '@nestjs/common';

export interface FormulaRecognitionRequest {
  imageBase64: string;
  outputFormat?: 'latex' | 'mathml' | 'asciimath' | 'all';
  subjectType?: 'math' | 'physics' | 'chemistry' | 'auto';
  writingMode?: 'handwritten' | 'printed' | 'auto';
}

export interface CharCandidate {
  value: string;
  confidence: number;
}

export interface CharSegment {
  char: string;
  latex?: string;
  confidence: number;
  candidates: CharCandidate[];
  isLowConfidence: boolean;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FormulaItem {
  id: string;
  latex: string;
  mathml: string;
  asciimath: string;
  plainText: string;
  confidence: number;
  lowConfidenceCount: number;
  totalChars: number;
  segments: CharSegment[];
  needsReview: boolean;
  warnings: string[];
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FormulaRecognitionResponse {
  success: boolean;
  formulas: FormulaItem[];
  fullText: string;
  fullLatex: string;
  processingTime: number;
  imageAnalysis: {
    formulaCount: number;
    hasText: boolean;
    hasDiagram: boolean;
    qualityScore: number;
    suggestedSubject: string;
    writingMode: 'handwritten' | 'printed' | 'mixed';
    handwritingQuality?: 'good' | 'fair' | 'poor';
    totalLowConfidence: number;
    needsReviewCount: number;
  };
  suggestions: string[];
}

const HANDWRITTEN_CONFUSION_MAP: Record<string, string[]> = {
  '1': ['l', 'I', '7', '|'],
  'l': ['1', 'I', '7'],
  'I': ['1', 'l', '|'],
  '7': ['1', '7'],
  '0': ['O', 'o', 'Q', 'θ'],
  'O': ['0', 'Q', 'o'],
  'o': ['0', 'O', 'a'],
  'x': ['×', 'X', '*', 'χ'],
  'X': ['x', '×', '*'],
  '×': ['x', 'X', '*'],
  '*': ['x', '×', 'X'],
  'a': ['o', 'α', '2'],
  'α': ['a', 'o'],
  'b': ['6', 'β', 'h'],
  'β': ['b', '6', 'B'],
  'd': ['∂', 'δ', 'a', '4'],
  '∂': ['d', 'δ'],
  'δ': ['d', '∂', 'σ'],
  'g': ['9', 'q', 'γ'],
  'γ': ['g', 'y', 'r'],
  'p': ['q', 'ρ', 'φ'],
  'q': ['p', '9', 'g'],
  'ρ': ['p', 'φ'],
  'φ': ['p', 'ρ', 'ψ'],
  's': ['5', 'S', 'σ'],
  'S': ['s', '5', '∫'],
  'σ': ['s', '5', 'δ'],
  't': ['7', '+', 'τ'],
  '+': ['t', '×', '÷'],
  'u': ['v', 'μ', 'n'],
  'v': ['u', 'ν', 'γ'],
  'μ': ['u', 'm'],
  'ν': ['v', 'n'],
  'y': ['γ', 'g', '4'],
  'z': ['2', 'Z', 'ζ'],
  '2': ['z', 'Z', 'a'],
  '4': ['9', 'y', 'd'],
  '5': ['s', 'S'],
  '6': ['b', 'β'],
  '8': ['B', '∞', 'β'],
  '9': ['g', 'q', '4'],
  '.': ['·', '°', ','],
  ',': ['.', "'"],
  '-': ['—', '_', '~', '→'],
  '=': ['≡', '≈', '∞'],
  '(': ['[', '{', '|'],
  ')': [']', '}', '|'],
  '[': ['(', '{'],
  ']': [')', '}'],
  '≤': ['<', '='],
  '≥': ['>', '='],
  '<': ['≤', 'c', 'C'],
  '>': ['≥'],
  '÷': ['+', '/', '-'],
  '/': ['÷', '7', '1'],
  '∫': ['f', 'S', '∑'],
  '∑': ['E', '∫', '∏'],
  '∏': ['∏', 'II', '∑'],
  '√': ['✓', 'r', '√'],
  '△': ['Δ', 'A'],
  'Δ': ['△', 'A'],
  'θ': ['0', 'O', '8'],
  'λ': ['k', 'K', '入'],
  'π': ['n', 'r', 'л'],
  '∞': ['8', 'oo'],
  '±': ['+', '-', '∓'],
  '→': ['-', '=>', '→'],
  'H': ['h', 'η', 'II'],
  'η': ['H', 'h', 'n'],
  'ξ': ['ξ', 'E', '3'],
  'ψ': ['ψ', 'Ψ', '4'],
  'ω': ['w', 'W', 'ω']
};

const LATEX_CHAR_MAP: Record<string, string> = {
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
  'ε': '\\varepsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
  'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
  'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho',
  'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\varphi',
  'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega', 'Γ': '\\Gamma',
  'Δ': '\\Delta', 'Θ': '\\Theta', 'Λ': '\\Lambda', 'Ξ': '\\Xi',
  'Π': '\\Pi', 'Σ': '\\Sigma', 'Φ': '\\Phi', 'Ψ': '\\Psi',
  'Ω': '\\Omega', '∞': '\\infty', '±': '\\pm', '∓': '\\mp',
  '×': '\\times', '÷': '\\div', '≠': '\\neq', '≤': '\\leq',
  '≥': '\\geq', '≈': '\\approx', '≡': '\\equiv', '∝': '\\propto',
  '→': '\\rightarrow', '←': '\\leftarrow', '↔': '\\leftrightarrow',
  '∑': '\\sum', '∏': '\\prod', '∫': '\\int', '√': '\\sqrt',
  '∂': '\\partial', '∇': '\\nabla', '△': '\\triangle',
  '°': '^\\circ', '·': '\\cdot', '…': '\\cdots',
  '⊥': '\\perp', '∥': '\\parallel', '∠': '\\angle'
};

const REVERSE_LATEX_MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(LATEX_CHAR_MAP)) {
  REVERSE_LATEX_MAP[v] = k;
}

const MOCK_MATH_FORMULAS = [
  { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', plain: 'x = (-b ± √(b² - 4ac)) / 2a', asciimath: 'x = (-b +- sqrt(b^2 - 4ac)) / (2a)' },
  { latex: 'E = mc^2', plain: 'E = mc²', asciimath: 'E = mc^2' },
  { latex: '\\int_{a}^{b} f(x)dx = F(b) - F(a)', plain: '∫[a,b] f(x)dx = F(b) - F(a)', asciimath: 'int_a^b f(x)dx = F(b) - F(a)' },
  { latex: '\\sin^2\\theta + \\cos^2\\theta = 1', plain: 'sin²θ + cos²θ = 1', asciimath: 'sin^2 theta + cos^2 theta = 1' },
  { latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}', plain: 'Σ(n=1~∞) 1/n² = π²/6', asciimath: 'sum_(n=1)^oo 1/n^2 = pi^2/6' },
  { latex: '\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e', plain: 'lim(x→∞) (1 + 1/x)^x = e', asciimath: 'lim_(x->oo) (1 + 1/x)^x = e' },
  { latex: '\\frac{d}{dx}e^x = e^x', plain: 'd/dx(e^x) = e^x', asciimath: 'd/dx e^x = e^x' },
  { latex: 'a^2 + b^2 = c^2', plain: 'a² + b² = c²', asciimath: 'a^2 + b^2 = c^2' },
  { latex: 'V = \\frac{4}{3}\\pi r^3', plain: 'V = (4/3)πr³', asciimath: 'V = 4/3 pi r^3' },
  { latex: '\\log_a(b) = \\frac{\\ln b}{\\ln a}', plain: 'log_a(b) = ln(b)/ln(a)', asciimath: 'log_a b = (ln b)/(ln a)' }
];

const MOCK_PHYSICS_FORMULAS = [
  { latex: 'F = ma', plain: 'F = ma', asciimath: 'F = ma' },
  { latex: 'P = \\frac{W}{t}', plain: 'P = W/t', asciimath: 'P = W/t' },
  { latex: 'U = IR', plain: 'U = IR', asciimath: 'U = IR' },
  { latex: 'P = UI', plain: 'P = UI', asciimath: 'P = UI' },
  { latex: 's = vt + \\frac{1}{2}at^2', plain: 's = vt + ½at²', asciimath: 's = vt + 1/2 at^2' },
  { latex: 'v^2 = v_0^2 + 2as', plain: 'v² = v₀² + 2as', asciimath: 'v^2 = v_0^2 + 2as' },
  { latex: 'F = G\\frac{m_1 m_2}{r^2}', plain: 'F = G·m₁m₂/r²', asciimath: 'F = G (m_1 m_2)/r^2' },
  { latex: '\\lambda = \\frac{h}{p}', plain: 'λ = h/p', asciimath: 'lambda = h/p' }
];

const MOCK_CHEMISTRY_FORMULAS = [
  { latex: '\\text{H}_2\\text{O}', plain: 'H₂O', asciimath: 'H_2O' },
  { latex: '\\text{2H}_2 + \\text{O}_2 \\rightarrow \\text{2H}_2\\text{O}', plain: '2H₂ + O₂ → 2H₂O', asciimath: '2H_2 + O_2 -> 2H_2O' },
  { latex: '\\text{NaCl} \\rightarrow \\text{Na}^+ + \\text{Cl}^-', plain: 'NaCl → Na⁺ + Cl⁻', asciimath: 'NaCl -> Na^+ + Cl^-' },
  { latex: 'PV = nRT', plain: 'PV = nRT', asciimath: 'PV = nRT' },
  { latex: 'pH = -\\log[\\text{H}^+]', plain: 'pH = -log[H⁺]', asciimath: 'pH = -log[H^+]' },
  { latex: '\\text{C}_6\\text{H}_{12}\\text{O}_6', plain: 'C₆H₁₂O₆', asciimath: 'C_6H_12O_6' }
];

const BASE_SUGGESTIONS = [
  '拍照时请保持光线充足，避免反光和阴影遮挡公式',
  '尽量让公式占满画面，减少无关背景干扰',
  '确保图片清晰，无模糊或重影',
  '手写公式请尽量书写工整，使用标准符号',
  '复杂公式建议分段拍摄识别，准确率更高',
  '识别完成后，可点击复制按钮获取 LaTeX 格式代码用于论文排版',
  '如识别不准确，可手动编辑修正后再复制使用',
  '系统已自动标红低置信度字符，请点击候选字快速替换',
  '使用「逐字核对」模式可以逐个确认识别结果'
];

const HANDWRITING_SUGGESTIONS = [
  '检测到手写公式，建议额外注意：数字 1 与字母 l 易混淆',
  '字母 o 与数字 0、字母 x 与乘号 × 是手写常见识别错误点',
  '请检查标红的低置信度字符，点击候选字可快速修正',
  '上标和下标请尽量书写清晰，与主体字符区分开',
  '手写希腊字母如 α、β、γ、θ 等请尽量规范书写'
];

function latexToMathml(latex: string): string {
  const simpleReplacements: Record<string, string> = {
    '\\frac': 'mfrac', '\\sqrt': 'msqrt', '\\sum': 'mo>∑</mo',
    '\\int': 'mo>∫</mo', '\\lim': 'mo>lim</mo', '\\log': 'mi>log</mi',
    '\\sin': 'mi>sin</mi', '\\cos': 'mi>cos</mi', '\\tan': 'mi>tan</mi',
    '\\pi': 'mi>π</mi', '\\theta': 'mi>θ</mi', '\\lambda': 'mi>λ</mi',
    '\\infty': 'mo>∞</mo', '\\pm': 'mo>±</mo', '\\rightarrow': 'mo>→</mo',
    '^': 'msup', '_': 'msub'
  };
  let mathml = latex;
  for (const [latexCmd, mmlTag] of Object.entries(simpleReplacements)) {
    if (mmlTag.includes('>')) {
      mathml = mathml.split(latexCmd).join(`<${mmlTag}>`);
    }
  }
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${mathml}</mrow></math>`;
}

function plainTextToChars(text: string): string[] {
  const chars: string[] = [];
  const latexCommands = Object.keys(LATEX_CHAR_MAP).sort((a, b) => b.length - a.length);
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const cmd of latexCommands) {
      if (text.substr(i, cmd.length) === cmd) {
        chars.push(cmd);
        i += cmd.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      chars.push(text[i]);
      i++;
    }
  }
  return chars;
}

@Injectable()
export class FormulaRecognitionService {
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

  private generateCandidates(char: string, baseConfidence: number, rand: () => number, isHandwritten: boolean): { char: string; confidence: number; candidates: CharCandidate[]; isLowConfidence: boolean } {
    const candidates: CharCandidate[] = [];
    const confusionList = HANDWRITTEN_CONFUSION_MAP[char] || [];
    const handwrittenPenalty = isHandwritten ? 0.18 : 0;
    let confidence = baseConfidence - handwrittenPenalty;

    if (isHandwritten && rand() > 0.55 && confusionList.length > 0) {
      confidence -= rand() * 0.25;
    }
    confidence = Math.max(0.35, Math.min(0.99, confidence));

    candidates.push({ value: char, confidence: Math.round(confidence * 100) / 100 });

    if (isHandwritten && confusionList.length > 0) {
      const numCandidates = Math.min(confusionList.length, Math.floor(rand() * 2) + 1);
      const shuffled = [...confusionList].sort(() => rand() - 0.5);
      let remainingConfidence = 1 - confidence;
      for (let i = 0; i < numCandidates && i < shuffled.length; i++) {
        const candConfidence = Math.round((remainingConfidence * (0.4 + rand() * 0.5)) * 100) / 100;
        if (candConfidence > 0.05) {
          candidates.push({ value: shuffled[i], confidence: candConfidence });
          remainingConfidence -= candConfidence;
        }
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);
    const finalChar = candidates[0].value;
    const finalConfidence = candidates[0].confidence;
    const isLowConfidence = finalConfidence < 0.8;

    return {
      char: finalChar,
      confidence: finalConfidence,
      candidates,
      isLowConfidence
    };
  }

  private generateSegments(plainText: string, rand: () => number, isHandwritten: boolean): { segments: CharSegment[]; lowConfidenceCount: number; avgConfidence: number } {
    const chars = plainTextToChars(plainText);
    const segments: CharSegment[] = [];
    let lowConfidenceCount = 0;
    let totalConfidence = 0;
    let xPos = 0;

    for (const c of chars) {
      const isSpace = /\s/.test(c);
      const isPunctuation = /[=+\-*/(),.]/.test(c);
      const baseConf = isSpace ? 0.99 : isPunctuation ? 0.93 : 0.88;
      const result = this.generateCandidates(c, baseConf, rand, isHandwritten);

      const latex = LATEX_CHAR_MAP[result.char] || result.char;

      segments.push({
        char: result.char,
        latex,
        confidence: result.confidence,
        candidates: result.candidates,
        isLowConfidence: result.isLowConfidence && !isSpace,
        position: {
          x: xPos,
          y: Math.floor(rand() * 10),
          width: Math.floor(rand() * 15 + 18),
          height: Math.floor(rand() * 10 + 28)
        }
      });

      if (result.isLowConfidence && !isSpace) lowConfidenceCount++;
      totalConfidence += result.confidence;
      xPos += Math.floor(rand() * 5 + 20);
    }

    const avgConfidence = Math.round((totalConfidence / Math.max(chars.length, 1)) * 100) / 100;
    return { segments, lowConfidenceCount, avgConfidence };
  }

  private buildWarnings(lowConfidenceCount: number, totalChars: number, avgConfidence: number, isHandwritten: boolean): string[] {
    const warnings: string[] = [];
    const lowRatio = lowConfidenceCount / Math.max(totalChars, 1);

    if (isHandwritten) {
      warnings.push('手写公式识别，请仔细核对结果');
    }
    if (avgConfidence < 0.75) {
      warnings.push('整体识别置信度较低，建议检查所有公式');
    }
    if (lowRatio > 0.3) {
      warnings.push(`有 ${Math.round(lowRatio * 100)}% 的字符识别置信度较低，请重点核对标红部分`);
    }
    if (lowConfidenceCount >= 3) {
      warnings.push(`存在 ${lowConfidenceCount} 个低置信度字符，建议点击候选字替换`);
    }
    return warnings;
  }

  async recognize(request: FormulaRecognitionRequest): Promise<FormulaRecognitionResponse> {
    const startTime = Date.now();
    const { outputFormat = 'all', subjectType = 'auto', writingMode = 'auto' } = request;

    const seed = Date.now() % 100000;
    const rand = this.seededRandom(seed);

    let isHandwritten = writingMode === 'handwritten';
    let autoWritingMode: 'handwritten' | 'printed' | 'mixed' = 'printed';
    let handwritingQuality: 'good' | 'fair' | 'poor' | undefined = undefined;

    if (writingMode === 'auto') {
      isHandwritten = rand() > 0.45;
      autoWritingMode = isHandwritten ? 'handwritten' : 'printed';
    } else {
      autoWritingMode = writingMode;
    }

    if (isHandwritten) {
      const r = rand();
      handwritingQuality = r > 0.66 ? 'good' : r > 0.33 ? 'fair' : 'poor';
    }

    let formulaPool = MOCK_MATH_FORMULAS;
    let suggestedSubject = '数学';

    if (subjectType === 'physics') {
      formulaPool = MOCK_PHYSICS_FORMULAS;
      suggestedSubject = '物理';
    } else if (subjectType === 'chemistry') {
      formulaPool = MOCK_CHEMISTRY_FORMULAS;
      suggestedSubject = '化学';
    } else if (subjectType === 'auto') {
      const pools = [MOCK_MATH_FORMULAS, MOCK_PHYSICS_FORMULAS, MOCK_CHEMISTRY_FORMULAS];
      const subjects = ['数学', '物理', '化学'];
      const poolIdx = Math.floor(rand() * 3);
      formulaPool = pools[poolIdx];
      suggestedSubject = subjects[poolIdx];
    }

    const formulaCount = Math.floor(rand() * 3) + 1;
    const pickedFormulas = this.pickSeeded(formulaPool, formulaCount, rand);

    let totalLowConfidence = 0;
    let needsReviewCount = 0;

    const formulas: FormulaItem[] = pickedFormulas.map((f, idx) => {
      const { segments, lowConfidenceCount, avgConfidence } = this.generateSegments(f.plain, rand, isHandwritten);
      totalLowConfidence += lowConfidenceCount;
      const needsReview = lowConfidenceCount > 0 || avgConfidence < 0.8;
      if (needsReview) needsReviewCount++;
      const warnings = this.buildWarnings(lowConfidenceCount, segments.length, avgConfidence, isHandwritten);

      let finalPlain = segments.map(s => s.char).join('');
      let finalLatex = f.latex;
      let finalAscii = f.asciimath;

      if (isHandwritten && lowConfidenceCount > 0) {
        for (const seg of segments) {
          if (seg.isLowConfidence && seg.candidates.length > 0 && seg.candidates[0].value !== seg.char) {
            const original = f.plain.includes(seg.char) ? seg.char : '';
            if (original && finalPlain.includes(original)) {
              finalPlain = finalPlain.replace(original, seg.candidates[0].value);
            }
          }
        }
      }

      return {
        id: `formula_${Date.now()}_${idx}`,
        latex: finalLatex,
        mathml: latexToMathml(finalLatex),
        asciimath: finalAscii,
        plainText: finalPlain,
        confidence: avgConfidence,
        lowConfidenceCount,
        totalChars: segments.length,
        segments,
        needsReview,
        warnings,
        position: {
          x: Math.floor(rand() * 100),
          y: Math.floor(rand() * 50 + idx * 100),
          width: Math.floor(rand() * 100 + 200),
          height: Math.floor(rand() * 30 + 40)
        }
      };
    });

    const fullLatex = formulas.map(f => f.latex).join(' \\\\ ');
    const fullText = formulas.map(f => f.plainText).join('\n');

    const processingTime = Date.now() - startTime + Math.floor(rand() * 500 + 200);

    const baseQuality = Math.round((0.75 + rand() * 0.24) * 100);
    const qualityScore = isHandwritten
      ? Math.max(45, baseQuality - Math.floor(rand() * 25 + 10))
      : baseQuality;
    const hasText = rand() > 0.4;
    const hasDiagram = rand() > 0.7;

    const suggestions = [...BASE_SUGGESTIONS];
    if (isHandwritten) {
      suggestions.push(...this.pickSeeded(HANDWRITING_SUGGESTIONS, 3, rand));
    }
    if (needsReviewCount > 0) {
      suggestions.unshift(`检测到 ${needsReviewCount} 个公式需要人工核对，请重点查看标红字符`);
    }
    const finalSuggestions = this.pickSeeded(suggestions, 5, rand);

    return {
      success: true,
      formulas,
      fullText,
      fullLatex,
      processingTime,
      imageAnalysis: {
        formulaCount: formulas.length,
        hasText,
        hasDiagram,
        qualityScore,
        suggestedSubject,
        writingMode: autoWritingMode,
        handwritingQuality,
        totalLowConfidence,
        needsReviewCount
      },
      suggestions: finalSuggestions
    };
  }
}
