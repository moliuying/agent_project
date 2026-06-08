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

export interface AutoCorrection {
  from: string;
  to: string;
  reason: string;
  segmentIndex: number;
}

export interface CorrectionSuggestion {
  id: string;
  current: string;
  suggested: string;
  reason: string;
  confidence: number;
  segmentIndex?: number;
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
  autoCorrections: AutoCorrection[];
  correctionSuggestions: CorrectionSuggestion[];
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
    totalAutoCorrections: number;
    totalSuggestions: number;
  };
  suggestions: string[];
}

const HANDWRITTEN_CONFUSION_MAP: Record<string, string[]> = {
  '1': ['l', 'I', '7', '|'],
  'l': ['1', 'I', '7'],
  'I': ['1', 'l', '|'],
  '7': ['1', 'l', '7'],
  '0': ['O', 'o', 'Q', 'θ'],
  'O': ['0', 'Q', 'o'],
  'o': ['0', 'O', 'a', 'θ'],
  'x': ['×', 'X', '*', 'χ'],
  'X': ['x', '×', '*'],
  '×': ['x', 'X', '*'],
  '*': ['x', '×', 'X'],
  'a': ['o', 'α', '2'],
  'α': ['a', 'o'],
  'b': ['6', 'β', 'h'],
  'β': ['b', '6', 'B'],
  'd': ['∂', 'δ', 'a', '4'],
  '∂': ['d', 'δ', '∇'],
  'δ': ['d', '∂', 'σ'],
  'g': ['9', 'q', 'γ'],
  'γ': ['g', 'y', 'r'],
  'p': ['q', 'ρ', 'φ'],
  'q': ['p', '9', 'g'],
  'ρ': ['p', 'φ'],
  'φ': ['p', 'ρ', 'ψ'],
  's': ['5', 'S', 'σ', '∫'],
  'S': ['s', '5', '∫', '∑'],
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
  '5': ['s', 'S', '∫'],
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
  '∫': ['f', 'F', 'S', 's', '∑', '∮', '∬'],
  '∑': ['E', '∫', '∏', 'S', 'Σ', 'Ʃ'],
  '∏': ['∏', 'II', '∑', 'Π', 'π'],
  '∮': ['∫', '∑', 'o', '0'],
  '∬': ['∫', '∑', 'S'],
  '√': ['✓', 'r', '√', 'v'],
  '△': ['Δ', 'A'],
  'Δ': ['△', 'A'],
  '∇': ['∂', 'd', 'δ', '▽'],
  'θ': ['0', 'O', '8'],
  'λ': ['k', 'K', '入'],
  'π': ['n', 'r', 'л', 'Π'],
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
  '∑': '\\sum', '∏': '\\prod', '∫': '\\int', '∮': '\\oint',
  '∬': '\\iint', '√': '\\sqrt', '∂': '\\partial', '∇': '\\nabla',
  '△': '\\triangle', '°': '^\\circ', '·': '\\cdot', '…': '\\cdots',
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
  { latex: '\\int x^2 dx = \\frac{x^3}{3} + C', plain: '∫x²dx = x³/3 + C', asciimath: 'int x^2 dx = x^3/3 + C' },
  { latex: '\\oint_C Pdx + Qdy', plain: '∮_C Pdx + Qdy', asciimath: 'oint_C P dx + Q dy' },
  { latex: '\\sin^2\\theta + \\cos^2\\theta = 1', plain: 'sin²θ + cos²θ = 1', asciimath: 'sin^2 theta + cos^2 theta = 1' },
  { latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}', plain: 'Σ(n=1~∞) 1/n² = π²/6', asciimath: 'sum_(n=1)^oo 1/n^2 = pi^2/6' },
  { latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', plain: 'Σ(i=1~n) i = n(n+1)/2', asciimath: 'sum_(i=1)^n i = n(n+1)/2' },
  { latex: '\\prod_{i=1}^{n} i = n!', plain: '∏(i=1~n) i = n!', asciimath: 'prod_(i=1)^n i = n!' },
  { latex: '\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e', plain: 'lim(x→∞) (1 + 1/x)^x = e', asciimath: 'lim_(x->oo) (1 + 1/x)^x = e' },
  { latex: '\\frac{d}{dx}e^x = e^x', plain: 'd/dx(e^x) = e^x', asciimath: 'd/dx e^x = e^x' },
  { latex: '\\frac{\\partial f}{\\partial x}', plain: '∂f/∂x', asciimath: '(partial f)/(partial x)' },
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
  { latex: '\\lambda = \\frac{h}{p}', plain: 'λ = h/p', asciimath: 'lambda = h/p' },
  { latex: 'W = \\int_{s_1}^{s_2} F ds', plain: 'W = ∫(s₁→s₂) F ds', asciimath: 'W = int_(s_1)^(s_2) F ds' }
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
  '使用「逐字核对」模式可以逐个确认识别结果',
  '积分号 ∫ 和求和符号 Σ 手写易混，请使用智能纠错建议面板核对'
];

const HANDWRITING_SUGGESTIONS = [
  '检测到手写公式，建议额外注意：数字 1 与字母 l 易混淆',
  '字母 o 与数字 0、字母 x 与乘号 × 是手写常见识别错误点',
  '请检查标红的低置信度字符，点击候选字可快速修正',
  '上标和下标请尽量书写清晰，与主体字符区分开',
  '手写希腊字母如 α、β、γ、θ 等请尽量规范书写',
  '积分号 ∫ 写长一些、求和符号 Σ 横线要清晰，可显著提升识别率',
  '手写 dx/dy 等微分符号时 d 与 x/y 之间留少量间距',
  '偏导符号 ∂ 手写时注意与字母 d、希腊字母 δ 区分'
];

function latexToMathml(latex: string): string {
  const simpleReplacements: Record<string, string> = {
    '\\frac': 'mfrac', '\\sqrt': 'msqrt', '\\sum': 'mo>∑</mo',
    '\\int': 'mo>∫</mo', '\\lim': 'mo>lim</mo', '\\log': 'mi>log</mi',
    '\\sin': 'mi>sin</mi', '\\cos': 'mi>cos</mi', '\\tan': 'mi>tan</mi',
    '\\pi': 'mi>π</mi', '\\theta': 'mi>θ</mi', '\\lambda': 'mi>λ</mi',
    '\\infty': 'mo>∞</mo', '\\pm': 'mo>±</mo', '\\rightarrow': 'mo>→</mo',
    '^': 'msup', '_': 'msub', '\\oint': 'mo>∮</mo>', '\\iint': 'mo>∬</mo>',
    '\\partial': 'mo>∂</mo>', '\\nabla': 'mo>∇</mo>', '\\prod': 'mo>∏</mo>'
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

function getSegmentsString(segments: CharSegment[]): string {
  return segments.map(s => s.char).join('');
}

function lookahead(segments: CharSegment[], startIdx: number, len: number): string {
  let result = '';
  for (let i = startIdx; i < Math.min(startIdx + len, segments.length); i++) {
    result += segments[i].char;
  }
  return result;
}

function lookbehind(segments: CharSegment[], startIdx: number, len: number): string {
  let result = '';
  const begin = Math.max(0, startIdx - len);
  for (let i = begin; i < startIdx; i++) {
    result += segments[i].char;
  }
  return result;
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

  private generateCandidates(char: string, baseConfidence: number, rand: () => number, isHandwritten: boolean, forceMathSymCandidates = false): { char: string; confidence: number; candidates: CharCandidate[]; isLowConfidence: boolean } {
    const candidates: CharCandidate[] = [];
    let confusionList = HANDWRITTEN_CONFUSION_MAP[char] || [];

    if (forceMathSymCandidates) {
      if (['∫', '∑', '∏', 'S', 's', 'f', 'F', '∮', '∬'].includes(char)) {
        const extra = ['∫', '∑', '∏', '∮', '∬', 'S', 's', 'f'].filter(c => c !== char && !confusionList.includes(c));
        confusionList = [...confusionList, ...extra];
      }
    }

    const handwrittenPenalty = isHandwritten ? 0.18 : 0;
    let confidence = baseConfidence - handwrittenPenalty;

    if (isHandwritten && rand() > 0.55 && confusionList.length > 0) {
      confidence -= rand() * 0.25;
    }
    confidence = Math.max(0.35, Math.min(0.99, confidence));

    candidates.push({ value: char, confidence: Math.round(confidence * 100) / 100 });

    if (confusionList.length > 0) {
      const shuffled = [...confusionList].sort(() => rand() - 0.5);
      let remainingConfidence = 1 - confidence;
      const numCandidates = Math.min(confusionList.length, isHandwritten ? Math.floor(rand() * 3) + 2 : Math.floor(rand() * 2) + 1);
      for (let i = 0; i < numCandidates && i < shuffled.length; i++) {
        const candConfidence = Math.round((remainingConfidence * (0.3 + rand() * 0.55)) * 100) / 100;
        if (candConfidence > 0.04) {
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
      const isMathSymbol = ['∫', '∑', '∏', '∮', '∬', '√', '∂', '∇', '∞', '±', '→', '≤', '≥', '×', '÷', '≠', '≈', '≡', '∝', '⊥', '∥', '∠', '△', '°', '·', '…', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'].includes(c);
      let baseConf = isSpace ? 0.99 : isPunctuation ? 0.93 : isMathSymbol ? 0.82 : 0.88;

      if (isHandwritten && isMathSymbol) {
        baseConf -= 0.08;
      }

      const forceMathSym = isMathSymbol || ['f', 'F', 'S', 's', 'E', 'd'].includes(c);
      const result = this.generateCandidates(c, baseConf, rand, isHandwritten, forceMathSym);

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

  private applyContextualCorrections(segments: CharSegment[], isHandwritten: boolean): {
    segments: CharSegment[];
    corrections: AutoCorrection[];
    suggestions: CorrectionSuggestion[];
  } {
    const correctedSegments = segments.map(s => ({ ...s, candidates: [...s.candidates] }));
    const corrections: AutoCorrection[] = [];
    const suggestions: CorrectionSuggestion[] = [];
    const text = getSegmentsString(correctedSegments);

    for (let i = 0; i < correctedSegments.length; i++) {
      const seg = correctedSegments[i];
      const behind = lookbehind(correctedSegments, i, 8);
      const ahead = lookahead(correctedSegments, i + 1, 12);

      if (seg.char === '∑' || seg.char === 'Σ') {
        const aheadTrim = ahead.replace(/\s/g, '');
        const behindTrim = behind.replace(/\s/g, '');

        const hasIntegralSuffix = /d[xXyYzZtuvθφραβγ]/.test(aheadTrim) || /d[a-zA-Z]$/.test(aheadTrim);
        const hasIntegralRange = aheadTrim.match(/^\s*[\[({][a-zA-Z0-9]+[,~:][a-zA-Z0-9∞]+[\])}]/) !== null;
        const hasFuncAfter = /^[a-zA-Z]+\(/.test(aheadTrim);
        const behindHasIntegrand = /[a-zA-Z0-9\)][\^\+\-\*\/]*$/.test(behindTrim);

        if (hasIntegralSuffix || (hasIntegralRange && hasFuncAfter) || (behindHasIntegrand && hasIntegralSuffix)) {
          const oldChar = seg.char;
          correctedSegments[i] = {
            ...seg,
            char: '∫',
            latex: '\\int',
            confidence: Math.max(seg.confidence, 0.9),
            isLowConfidence: false,
            candidates: [
              { value: '∫', confidence: 0.95 },
              { value: oldChar, confidence: seg.confidence },
              ...seg.candidates.filter(c => c.value !== '∫' && c.value !== oldChar).slice(0, 3)
            ]
          };
          corrections.push({
            from: oldChar,
            to: '∫',
            reason: `检测到 "${oldChar}" 后紧跟 ${hasIntegralSuffix ? '微分符号(dx/dy等)' : '积分区间和被积函数'}，推断应为积分号 ∫`,
            segmentIndex: i
          });
          continue;
        }
      }

      if (seg.char === '∫' || seg.char === '∮' || seg.char === '∬') {
        const aheadTrim = ahead.replace(/\s/g, '');
        const behindTrim = behind.replace(/\s/g, '');

        const hasSumIndex = /^[_\{]?[a-zA-Z]\s*=\s*[0-9]/.test(aheadTrim) || /_[a-zA-Z]=/.test(aheadTrim);
        const hasSumRange = /[a-zA-Z]\s*=\s*[0-9]+[^\)]*[~∞]/.test(aheadTrim);
        const hasSumTerm = /[a-zA-Z]_[a-zA-Z](\s|\+|=|$)/.test(aheadTrim);

        if (hasSumIndex || hasSumRange) {
          const oldChar = seg.char;
          correctedSegments[i] = {
            ...seg,
            char: '∑',
            latex: '\\sum',
            confidence: Math.max(seg.confidence, 0.9),
            isLowConfidence: false,
            candidates: [
              { value: '∑', confidence: 0.95 },
              { value: oldChar, confidence: seg.confidence },
              ...seg.candidates.filter(c => c.value !== '∑' && c.value !== oldChar).slice(0, 3)
            ]
          };
          corrections.push({
            from: oldChar,
            to: '∑',
            reason: `检测到 "${oldChar}" 后有求和下标(如 n=1)，推断应为求和符号 ∑`,
            segmentIndex: i
          });
          continue;
        }
      }

      if (seg.char === 'S' || seg.char === 's' || seg.char === 'f' || seg.char === 'F') {
        const aheadTrim = ahead.replace(/\s/g, '');
        const behindTrim = behind.replace(/\s/g, '');
        const lowConf = seg.isLowConfidence || seg.confidence < 0.85;

        if (lowConf && isHandwritten) {
          const hasIntegralLike = /d[xXyYzZtuv]/.test(aheadTrim) || /[\[({][a-zA-Z0-9]+[,~]/.test(aheadTrim);
          const hasSumLike = /^[_\{][a-zA-Z]=/.test(aheadTrim);
          if (hasIntegralLike) {
            const oldChar = seg.char;
            suggestions.push({
              id: `sug_${i}_int`,
              current: oldChar,
              suggested: '∫',
              reason: `检测到 "${oldChar}" 后紧跟微分符号(dx/dy等)，疑似积分号 ∫`,
              confidence: 0.85,
              segmentIndex: i
            });
          } else if (hasSumLike) {
            const oldChar = seg.char;
            suggestions.push({
              id: `sug_${i}_sum`,
              current: oldChar,
              suggested: '∑',
              reason: `检测到 "${oldChar}" 后有求和下标，疑似求和符号 ∑`,
              confidence: 0.82,
              segmentIndex: i
            });
          }
        }
      }

      if (seg.char === '∂' || seg.char === 'δ' || (seg.char === 'd' && seg.isLowConfidence && isHandwritten)) {
        const aheadTrim = ahead.replace(/\s/g, '');
        if (/^\/[a-zA-Z]/.test(aheadTrim) || /^[a-zA-Z]\//.test(aheadTrim) || aheadTrim.startsWith('∂')) {
          if (seg.char === 'δ') {
            suggestions.push({
              id: `sug_${i}_partial`,
              current: seg.char,
              suggested: '∂',
              reason: `检测到 "${seg.char}" 后有除法形式，疑似偏导符号 ∂`,
              confidence: 0.8,
              segmentIndex: i
            });
          }
        }
      }

      if (seg.char === 'Π' || seg.char === 'π' || seg.char === 'n') {
        const aheadTrim = ahead.replace(/\s/g, '');
        if (/^[_\{]?[a-zA-Z]=/.test(aheadTrim) && isHandwritten && seg.isLowConfidence) {
          if (seg.char !== 'Π' && seg.char !== '∏') {
            suggestions.push({
              id: `sug_${i}_prod`,
              current: seg.char,
              suggested: '∏',
              reason: `检测到 "${seg.char}" 后有乘积下标，疑似乘积符号 ∏`,
              confidence: 0.78,
              segmentIndex: i
            });
          }
        }
      }
    }

    const finalText = getSegmentsString(correctedSegments);
    if (/∑[^\n]*d[xXyYzZtuv]/.test(finalText) || /∑[^\n]*[\[({][a-zA-Z]+[,~]/.test(finalText)) {
      suggestions.push({
        id: 'sug_global_sum_int',
        current: '∑',
        suggested: '∫',
        reason: '公式中同时存在求和符号 ∑ 和积分特征(dx 或区间)，建议核对是否应为积分号 ∫',
        confidence: 0.9
      });
    }
    if (/∫[^\n]*_[a-zA-Z]=/.test(finalText)) {
      suggestions.push({
        id: 'sug_global_int_sum',
        current: '∫',
        suggested: '∑',
        reason: '公式中同时存在积分号 ∫ 和求和下标特征，建议核对是否应为求和符号 ∑',
        confidence: 0.9
      });
    }

    return { segments: correctedSegments, corrections, suggestions };
  }

  private buildWarnings(lowConfidenceCount: number, totalChars: number, avgConfidence: number, isHandwritten: boolean, corrections: AutoCorrection[], suggestions: CorrectionSuggestion[]): string[] {
    const warnings: string[] = [];
    const lowRatio = lowConfidenceCount / Math.max(totalChars, 1);

    if (isHandwritten) {
      warnings.push('手写公式识别，请仔细核对结果');
    }
    if (corrections.length > 0) {
      warnings.push(`系统已自动进行 ${corrections.length} 处智能纠错，请确认修正是否正确`);
    }
    if (suggestions.length > 0) {
      warnings.push(`有 ${suggestions.length} 条智能纠错建议可供参考`);
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

  private rebuildLatexFromSegments(originalLatex: string, segments: CharSegment[], corrections: AutoCorrection[]): string {
    if (corrections.length === 0) return originalLatex;
    let latex = originalLatex;
    for (const c of corrections) {
      const fromLatex = LATEX_CHAR_MAP[c.from] || c.from;
      const toLatex = LATEX_CHAR_MAP[c.to] || c.to;
      latex = latex.replace(fromLatex, toLatex);
    }
    return latex;
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
      isHandwritten = rand() > 0.4;
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
    let totalAutoCorrections = 0;
    let totalSuggestions = 0;

    const formulas: FormulaItem[] = pickedFormulas.map((f, idx) => {
      let { segments, lowConfidenceCount, avgConfidence } = this.generateSegments(f.plain, rand, isHandwritten);

      const { segments: correctedSegments, corrections, suggestions } = this.applyContextualCorrections(segments, isHandwritten);
      segments = correctedSegments;
      lowConfidenceCount = segments.filter(s => s.isLowConfidence).length;
      let totalConfidence = segments.reduce((sum, s) => sum + s.confidence, 0);
      avgConfidence = Math.round((totalConfidence / Math.max(segments.length, 1)) * 100) / 100;

      totalLowConfidence += lowConfidenceCount;
      totalAutoCorrections += corrections.length;
      totalSuggestions += suggestions.length;
      const needsReview = lowConfidenceCount > 0 || avgConfidence < 0.8 || corrections.length > 0 || suggestions.length > 0;
      if (needsReview) needsReviewCount++;

      const warnings = this.buildWarnings(lowConfidenceCount, segments.length, avgConfidence, isHandwritten, corrections, suggestions);

      const finalPlain = segments.map(s => s.char).join('');
      const finalLatex = this.rebuildLatexFromSegments(f.latex, segments, corrections);
      let finalAscii = f.asciimath;
      for (const c of corrections) {
        if (c.from === '∑' && c.to === '∫') finalAscii = finalAscii.replace('sum_', 'int_').replace('sum', 'int');
        if (c.from === '∫' && c.to === '∑') finalAscii = finalAscii.replace('int_', 'sum_').replace('int', 'sum');
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
        autoCorrections: corrections,
        correctionSuggestions: suggestions,
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
    if (totalAutoCorrections > 0) {
      suggestions.unshift(`系统已自动完成 ${totalAutoCorrections} 处智能纠错，请确认修正是否正确`);
    }
    if (totalSuggestions > 0) {
      suggestions.unshift(`有 ${totalSuggestions} 条智能纠错建议，可点击使用快速修正`);
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
        needsReviewCount,
        totalAutoCorrections,
        totalSuggestions
      },
      suggestions: finalSuggestions
    };
  }
}
