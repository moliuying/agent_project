import { Injectable } from '@nestjs/common';

export interface FormulaRecognitionRequest {
  imageBase64: string;
  outputFormat?: 'latex' | 'mathml' | 'asciimath' | 'all';
  subjectType?: 'math' | 'physics' | 'chemistry' | 'auto';
}

export interface FormulaItem {
  id: string;
  latex: string;
  mathml: string;
  asciimath: string;
  plainText: string;
  confidence: number;
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
  };
  suggestions: string[];
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

const SUGGESTIONS = [
  '拍照时请保持光线充足，避免反光和阴影遮挡公式',
  '尽量让公式占满画面，减少无关背景干扰',
  '确保图片清晰，无模糊或重影',
  '手写公式请尽量书写工整，使用标准符号',
  '复杂公式建议分段拍摄识别，准确率更高',
  '识别完成后，可点击复制按钮获取 LaTeX 格式代码用于论文排版',
  '如识别不准确，可手动编辑修正后再复制使用'
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

  async recognize(request: FormulaRecognitionRequest): Promise<FormulaRecognitionResponse> {
    const startTime = Date.now();
    const { outputFormat = 'all', subjectType = 'auto' } = request;

    const seed = Date.now() % 100000;
    const rand = this.seededRandom(seed);

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

    const formulas: FormulaItem[] = pickedFormulas.map((f, idx) => ({
      id: `formula_${Date.now()}_${idx}`,
      latex: f.latex,
      mathml: latexToMathml(f.latex),
      asciimath: f.asciimath,
      plainText: f.plain,
      confidence: Math.round((0.85 + rand() * 0.14) * 100) / 100,
      position: {
        x: Math.floor(rand() * 100),
        y: Math.floor(rand() * 50 + idx * 100),
        width: Math.floor(rand() * 100 + 200),
        height: Math.floor(rand() * 30 + 40)
      }
    }));

    const fullLatex = formulas.map(f => f.latex).join(' \\\\ ');
    const fullText = formulas.map(f => f.plainText).join('\n');

    const processingTime = Date.now() - startTime + Math.floor(rand() * 500 + 200);

    const qualityScore = Math.round((0.75 + rand() * 0.24) * 100);
    const hasText = rand() > 0.4;
    const hasDiagram = rand() > 0.7;

    const suggestions = this.pickSeeded(SUGGESTIONS, 3, rand);

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
        suggestedSubject
      },
      suggestions
    };
  }
}
