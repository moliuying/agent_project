import { Injectable } from '@nestjs/common';
import { POETRY_DATA, Poem } from './poetry-recommendation.data';

export interface ScoredPoem extends Poem {
  score: number;
  matchReasons: string[];
}

export const CATEGORY_MAP: Record<string, string> = {
  poem: '诗',
  ci: '词',
  song: '曲',
  fu: '赋'
};

export const QUICK_TAGS = [
  { label: '送别朋友', keywords: ['送别', '友情', '离别', '朋友'] },
  { label: '秋天思念', keywords: ['秋天', '思念', '思乡', '悲秋'] },
  { label: '春天写景', keywords: ['春天', '写景', '自然'] },
  { label: '爱情相思', keywords: ['爱情', '相思', '思念', '闺怨'] },
  { label: '中秋节', keywords: ['中秋', '月亮', '团圆'] },
  { label: '思乡之情', keywords: ['思乡', '羁旅', '回乡'] },
  { label: '励志进取', keywords: ['励志', '哲理', '豪情', '抱负'] },
  { label: '山水田园', keywords: ['山水', '田园', '写景', '自然'] },
  { label: '母爱情深', keywords: ['母爱', '亲情', '感恩', '父母'] },
  { label: '忧国忧民', keywords: ['忧国', '爱国'] },
  { label: '边塞豪情', keywords: ['边塞', '战争', '爱国', '豪情'] },
  { label: '孤独寂寞', keywords: ['孤独', '忧愁'] }
];

@Injectable()
export class PoetryRecommendationService {
  private readonly poems: Poem[] = POETRY_DATA;

  private getKeywords(query: string): string[] {
    const keywords: string[] = [];
    const queryLower = query.toLowerCase();

    const keywordMap: Record<string, string[]> = {
      '送别': ['送别', '离别', '友情', '朋友'],
      '朋友': ['送别', '离别', '友情', '朋友'],
      '离别': ['送别', '离别', '友情', '朋友'],
      '告别': ['送别', '离别', '友情', '朋友'],
      '秋天': ['秋天', '悲秋'],
      '秋': ['秋天', '悲秋'],
      '思念': ['思念'],
      '想念': ['思念'],
      '相思': ['相思', '爱情', '思念'],
      '月亮': ['月亮'],
      '月': ['月亮'],
      '思乡': ['思乡', '羁旅', '回乡'],
      '家乡': ['思乡', '羁旅', '回乡'],
      '故乡': ['思乡', '羁旅', '回乡'],
      '想家': ['思乡', '羁旅', '回乡'],
      '春天': ['春天'],
      '春': ['春天'],
      '爱情': ['爱情', '相思'],
      '爱人': ['爱情', '相思', '思念'],
      '情人': ['爱情', '相思'],
      '中秋': ['中秋', '月亮', '团圆', '中秋节'],
      '团圆': ['团圆', '中秋'],
      '母亲': ['母爱', '亲情', '感恩', '父母'],
      '妈妈': ['母爱', '亲情', '感恩', '父母'],
      '父母': ['父母', '亲情', '感恩', '母爱'],
      '感恩': ['感恩'],
      '励志': ['励志', '哲理', '豪情', '抱负'],
      '奋斗': ['励志', '豪情', '抱负'],
      '努力': ['励志', '豪情', '抱负'],
      '加油': ['励志', '豪情'],
      '写景': ['写景', '山水', '自然'],
      '山水': ['山水', '写景', '自然'],
      '自然': ['自然', '写景', '山水'],
      '西湖': ['西湖'],
      '庐山': ['庐山'],
      '长江': ['长江'],
      '黄河': ['黄河'],
      '忧愁': ['忧愁'],
      '烦恼': ['忧愁', '孤独'],
      '孤独': ['孤独', '忧愁'],
      '寂寞': ['孤独', '忧愁'],
      '高兴': ['喜悦'],
      '开心': ['喜悦'],
      '喜悦': ['喜悦'],
      '快乐': ['喜悦'],
      '爱国': ['爱国', '忧国'],
      '国家': ['爱国', '忧国'],
      '边塞': ['边塞', '战争'],
      '战争': ['战争', '边塞'],
      '怀古': ['怀古', '历史'],
      '历史': ['怀古', '历史'],
      '雨': ['雨'],
      '下雨': ['雨'],
      '雪': ['冬天', '雪景'],
      '冬天': ['冬天', '雪景'],
      '花': ['花'],
      '柳': ['柳树'],
      '竹': ['高洁', '咏物'],
      '梅': ['高洁', '咏物'],
      '高洁': ['高洁'],
      '读书': ['读书', '哲理'],
      '哲理': ['哲理'],
      '人生': ['人生', '哲理', '感慨'],
      '感慨': ['感慨', '人生'],
      '登高': ['登高'],
      '重阳': ['重阳节', '登高'],
      '清明': ['清明节'],
      '寒食': ['寒食节'],
      '荷花': ['荷花'],
      '江南': ['江南'],
      '乡村': ['田园', '乡村'],
      '田园': ['田园', '乡村'],
      '夜景': ['夜晚', '夜景'],
      '夜晚': ['夜晚'],
      '夕阳': ['夕阳']
    };

    for (const [key, tags] of Object.entries(keywordMap)) {
      if (queryLower.includes(key)) {
        keywords.push(...tags);
      }
    }

    const singleChars = query.split('').filter(c => c.trim() && /[\u4e00-\u9fa5]/.test(c));
    for (const char of singleChars) {
      if (char in keywordMap && !keywords.some(k => keywordMap[char]?.includes(k))) {
      }
    }

    return [...new Set(keywords)];
  }

  private matchPoem(poem: Poem, keywords: string[]): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const matchedTags = new Set<string>();

    for (const keyword of keywords) {
      for (const tag of poem.tags) {
        if (!matchedTags.has(tag)) {
          if (tag === keyword) {
            score += 10;
            matchedTags.add(tag);
            reasons.push(`匹配标签「${tag}」`);
          } else if (tag.includes(keyword) || keyword.includes(tag)) {
            score += 5;
            matchedTags.add(tag);
            reasons.push(`相关标签「${tag}」`);
          }
        }
      }

      if (poem.title.includes(keyword) || poem.content.includes(keyword) || poem.author.includes(keyword)) {
        score += 3;
        if (poem.title.includes(keyword)) {
          reasons.push(`标题包含「${keyword}」`);
        }
      }
    }

    return { score, reasons };
  }

  recommend(query: string, limit: number = 5, fameLevelRange?: [number, number]): ScoredPoem[] {
    const keywords = this.getKeywords(query);

    let poemsPool = this.poems;
    if (fameLevelRange) {
      const [min, max] = fameLevelRange;
      poemsPool = this.poems.filter(p => p.fameLevel >= min && p.fameLevel <= max);
    }

    if (keywords.length === 0) {
      return poemsPool
        .slice(0, limit)
        .map(p => ({ ...p, score: 1, matchReasons: ['随机推荐'] }));
    }

    const scored: ScoredPoem[] = poemsPool.map(poem => {
      const { score, reasons } = this.matchPoem(poem, keywords);
      return { ...poem, score, matchReasons: reasons };
    });

    scored.sort((a, b) => b.score - a.score);

    const filtered = scored.filter(p => p.score > 0);

    if (filtered.length === 0) {
      return poemsPool
        .slice(0, limit)
        .map(p => ({ ...p, score: 1, matchReasons: ['未找到精准匹配，为您推荐相关作品'] }));
    }

    return filtered.slice(0, limit);
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    for (const poem of this.poems) {
      for (const tag of poem.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }

  getQuickTags() {
    return QUICK_TAGS;
  }

  getDynasties(): string[] {
    const dynastySet = new Set<string>();
    for (const poem of this.poems) {
      dynastySet.add(poem.dynasty);
    }
    return Array.from(dynastySet);
  }

  getAll(
    params: { tag?: string; dynasty?: string; author?: string; category?: string; minFame?: number; maxFame?: number } = {}
  ): Poem[] {
    let result = [...this.poems];

    if (params.tag) {
      result = result.filter(p => p.tags.includes(params.tag!));
    }
    if (params.dynasty) {
      result = result.filter(p => p.dynasty === params.dynasty);
    }
    if (params.author) {
      result = result.filter(p => p.author.includes(params.author!));
    }
    if (params.category) {
      result = result.filter(p => p.category === params.category);
    }
    if (params.minFame !== undefined) {
      result = result.filter(p => p.fameLevel >= params.minFame!);
    }
    if (params.maxFame !== undefined) {
      result = result.filter(p => p.fameLevel <= params.maxFame!);
    }

    return result;
  }

  getById(id: number): Poem | undefined {
    return this.poems.find(p => p.id === id);
  }

  search(
    keyword: string,
    limit: number = 20,
    fameLevelRange?: [number, number]
  ): Poem[] {
    const lower = keyword.toLowerCase();
    let pool = this.poems;
    if (fameLevelRange) {
      const [min, max] = fameLevelRange;
      pool = this.poems.filter(p => p.fameLevel >= min && p.fameLevel <= max);
    }
    return pool
      .filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.author.toLowerCase().includes(lower) ||
        p.content.toLowerCase().includes(lower) ||
        p.tags.some(t => t.toLowerCase().includes(lower))
      )
      .slice(0, limit);
  }

  getInspiration(count: number = 5): Poem[] {
    const obscure = this.poems.filter(p => p.fameLevel <= 2);
    const shuffled = [...obscure].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, obscure.length));
  }

  getRelatedByTheme(poemId: number, limit: number = 5): Poem[] {
    const target = this.poems.find(p => p.id === poemId);
    if (!target) return [];
    const others = this.poems.filter(p => p.id !== poemId);
    const scored = others.map(p => {
      let score = 0;
      for (const tag of target.tags) {
        if (p.tags.includes(tag)) score += 2;
        else for (const t of p.tags) {
          if (t.includes(tag) || tag.includes(t)) score += 1;
        }
      }
      if (p.category === target.category) score += 1;
      return { poem: p, score };
    });
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.poem);
  }

  getRelatedByImagery(imagery: string, limit: number = 8): Poem[] {
    const kw = imagery.trim();
    if (!kw) return [];
    return this.poems
      .filter(p => p.content.includes(kw) || p.tags.some(t => t.includes(kw)))
      .sort((a, b) => a.fameLevel - b.fameLevel)
      .slice(0, limit);
  }
}
