import { Injectable } from '@nestjs/common';

export interface ImageToPromptRequest {
  imageBase64: string;
  userDescription?: string;
  targetStyle?: string;
  forcedStyles?: string[];
  forcedCompositions?: string[];
  forcedLightings?: string[];
  forcedMoods?: string[];
  colorProfile?: string;
  detailLevel?: string;
  includeNegative?: boolean;
  variantSeed?: number;
  outputLanguage?: string;
}

export interface ImageAnalysis {
  mainSubject: string;
  style: string[];
  composition: string[];
  colorPalette: string[];
  lighting: string[];
  mood: string[];
  details: string[];
  qualityTags: string[];
}

export interface ImageToPromptResponse {
  analysis: ImageAnalysis;
  positivePrompt: string;
  negativePrompt: string;
  promptCn: string;
  negativePromptCn: string;
  suggestions: string[];
}

const MAIN_SUBJECTS = [
  'a beautiful young woman', 'a handsome man', 'a cute cat', 'an adorable dog',
  'a majestic mountain landscape', 'a serene ocean scene', 'a futuristic city',
  'an enchanted forest', 'a cozy interior room', 'a stunning anime character',
  'a fantasy creature', 'a delicious food dish', 'a vintage car', 'a space scene',
  'a mysterious castle', 'a blooming flower garden', 'a cinematic portrait',
  'an underwater scene', 'a steampunk machine', 'a cyberpunk street'
];

const STYLES = [
  'photorealistic', 'anime style', 'oil painting', 'watercolor', 'digital art',
  'cyberpunk', 'steampunk', 'fantasy art', 'pixel art', '3D render',
  'cinematic', 'vintage photography', 'surrealism', 'impressionism',
  'low poly', 'isometric', 'chibi style', 'concept art', 'storybook illustration',
  'hyperrealistic', 'minimalist', 'art nouveau', 'art deco', 'Ukiyo-e'
];

const COMPOSITIONS = [
  'centered composition', 'rule of thirds', 'golden ratio', 'symmetrical composition',
  'leading lines', 'frame within frame', 'low angle shot', 'high angle shot',
  'close-up shot', 'wide angle shot', 'bird\'s eye view', 'worm\'s eye view',
  'Dutch angle', 'depth of field', 'foreground framing', 'dynamic pose',
  'full body shot', 'upper body shot', 'portrait composition', 'environmental shot'
];

const WARM_COLOR_PALETTES = [
  'warm color palette', 'golden hour colors', 'sunset colors',
  'earth tones', 'vibrant colors', 'soft colors', 'sepia tones', 'saturated colors'
];

const COOL_COLOR_PALETTES = [
  'cool color palette', 'blue hour lighting', 'pastel colors',
  'monochromatic', 'neon colors', 'black and white', 'muted tones',
  'high contrast', 'rainbow colors', 'dramatic lighting',
  'complementary colors', 'analogous colors'
];

const BRIGHT_COLOR_PALETTES = [
  'vibrant colors', 'pastel colors', 'saturated colors', 'soft colors',
  'golden hour colors', 'rainbow colors', 'warm color palette'
];

const DARK_COLOR_PALETTES = [
  'muted tones', 'monochromatic', 'black and white', 'sepia tones',
  'high contrast', 'dramatic lighting', 'cool color palette'
];

const DESATURATED_PALETTES = [
  'muted tones', 'sepia tones', 'black and white', 'monochromatic',
  'pastel colors', 'soft colors'
];

const SATURATED_PALETTES = [
  'vibrant colors', 'saturated colors', 'neon colors', 'rainbow colors',
  'golden hour colors', 'sunset colors'
];

const LIGHTINGS = [
  'soft natural lighting', 'dramatic side lighting', 'rim lighting', 'backlighting',
  'golden hour lighting', 'blue hour lighting', 'studio lighting', 'volumetric lighting',
  'cinematic lighting', 'chiaroscuro', 'ambient occlusion', 'global illumination',
  'neon glow', 'candlelight', 'moonlight', 'sun rays through clouds',
  'soft diffused light', 'harsh sunlight', 'bounce lighting', 'three-point lighting'
];

const MOODS = [
  'peaceful and serene', 'mysterious and atmospheric', 'epic and grand',
  'warm and cozy', 'dark and moody', 'vibrant and energetic',
  'nostalgic and melancholic', 'dreamy and ethereal', 'whimsical and playful',
  'tense and dramatic', 'romantic and tender', 'awe-inspiring',
  'eerie and unsettling', 'uplifting and hopeful', 'contemplative and quiet'
];

const DETAILS = [
  'highly detailed textures', 'intricate patterns', 'fine details',
  'sharp focus', 'crystal clear', 'macro details', 'micro details',
  'rich fabric textures', 'skin pores and imperfections', 'hair strands',
  'environmental details', 'small background elements', 'subtle surface reflections',
  'particle effects', 'lens flare', 'bokeh background',
  'motion blur effects', 'chromatic aberration', 'film grain', 'depth of field'
];

const QUALITY_TAGS = [
  'masterpiece', 'best quality', 'ultra detailed', '8K resolution', '4K',
  'high resolution', 'professional', 'award winning', 'trending on artstation',
  'by Greg Rutkowski', 'by Artgerm', 'by Alphonse Mucha', 'by Studio Ghibli',
  'Unreal Engine 5', 'Octane render', 'photographic', 'RAW photo',
  'DSLR', 'shot on Canon', 'shot on Sony', 'cinematic film still'
];

const NEGATIVE_COMMON = [
  'low quality', 'blurry', 'bad anatomy', 'bad proportions', 'extra limbs',
  'missing limbs', 'deformed', 'ugly', 'duplicate', 'watermark', 'text',
  'signature', 'out of frame', 'cropped', 'worst quality', 'jpeg artifacts',
  'pixelated', 'grainy', 'overexposed', 'underexposed', 'bad lighting'
];

const STYLE_SUGGESTIONS = [
  '可以尝试加入 "by {艺术家名}" 来模仿特定艺术家风格，如 by Greg Rutkowski, by Artgerm, by Studio Ghibli',
  '添加 "trending on Artstation" 或 "trending on Pixiv" 可显著提升画面质感和构图水准',
  '使用 "Unreal Engine 5, Octane render, ray tracing" 增强 3D 渲染的真实感和光影效果',
  '在提示词末尾加上权重语法如 (keyword:1.2) 可加强该关键词效果，(keyword:0.8) 则减弱',
  '建议指定具体分辨率如 "8K, ultra detailed, high resolution, intricate details" 获得更精致的画面',
  '可追加镜头参数如 "shot on 35mm lens, f/1.8, bokeh" 营造特定焦段和景深效果',
  '风格混合时可按 "A style fusion of X and Y" 格式书写，让 AI 更好地融合多种风格'
];

@Injectable()
export class ImageToPromptService {
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

  private pickWeightedSeeded<T>(arr: T[], min: number, max: number, rand: () => number): T[] {
    const count = Math.floor(rand() * (max - min + 1)) + min;
    return this.pickSeeded(arr, count, rand);
  }

  private mergeForced(base: string[], forced: string[] | undefined, maxCount: number): string[] {
    if (!forced || forced.length === 0) {
      return base.slice(0, maxCount);
    }
    const remaining = maxCount - forced.length;
    const merged = [...forced];
    if (remaining > 0) {
      const extra = base.filter(t => !forced.includes(t));
      merged.push(...extra.slice(0, remaining));
    }
    return merged.slice(0, maxCount);
  }

  private getColorPalettesByProfile(colorProfile: string | undefined, rand: () => number): string[] {
    if (!colorProfile) {
      return this.pickWeightedSeeded(
        [...WARM_COLOR_PALETTES, ...COOL_COLOR_PALETTES],
        2, 3, rand
      );
    }

    let candidatePool: string[] = [];

    if (colorProfile.includes('暖色调')) {
      candidatePool.push(...WARM_COLOR_PALETTES);
    } else if (colorProfile.includes('冷色调')) {
      candidatePool.push(...COOL_COLOR_PALETTES);
    }

    if (colorProfile.includes('清新明快')) {
      candidatePool.push(...BRIGHT_COLOR_PALETTES, ...SATURATED_PALETTES);
    }
    if (colorProfile.includes('暗调氛围')) {
      candidatePool.push(...DARK_COLOR_PALETTES);
    }
    if (colorProfile.includes('复古灰调')) {
      candidatePool.push(...DESATURATED_PALETTES);
    }

    if (candidatePool.length === 0) {
      candidatePool = [...WARM_COLOR_PALETTES, ...COOL_COLOR_PALETTES];
    }

    const uniquePool = [...new Set(candidatePool)];
    return this.pickWeightedSeeded(uniquePool, 2, 3, rand);
  }

  private extractMainSubject(description: string | undefined): string {
    if (!description || !description.trim()) {
      return '';
    }

    const cnSubjectPatterns = [
      /(?:一只|一个|一条|一位|一名|一群|一张|一座|一捧|一杯|一碗|一道|一辆|一架|一艘)[^，。,；;\s|]{1,15}/g,
      /[^，。,；;\s|]{1,15}(?:猫咪|小猫|小狗|狗狗|女孩|男孩|女人|男人|人物|风景|城市|建筑|食物|美食|花朵|森林|山脉|海洋|天空|汽车|房间|肖像|插画)/g
    ];

    for (const pattern of cnSubjectPatterns) {
      const matches = description.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }

    const firstSegment = description.split(/[|，。,；;\n]/)[0].trim();
    if (firstSegment.length > 0 && firstSegment.length < 60) {
      return firstSegment;
    }

    return '';
  }

  async generate(request: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    const {
      userDescription,
      targetStyle,
      forcedStyles,
      forcedCompositions,
      forcedLightings,
      forcedMoods,
      colorProfile,
      detailLevel = 'medium',
      includeNegative = true,
      variantSeed = 0
    } = request;

    const rand = this.seededRandom(variantSeed || Date.now() % 100000);

    const extractedSubject = this.extractMainSubject(userDescription);

    const detailCounts = {
      simple: { style: 1, composition: 1, color: 1, lighting: 1, mood: 1, detail: 1, quality: 2 },
      medium: { style: 2, composition: 2, color: 2, lighting: 2, mood: 1, detail: 2, quality: 3 },
      detailed: { style: 3, composition: 3, color: 3, lighting: 2, mood: 2, detail: 4, quality: 5 },
      extreme: { style: 4, composition: 3, color: 3, lighting: 3, mood: 2, detail: 5, quality: 6 }
    };

    const counts = detailCounts[detailLevel as keyof typeof detailCounts] || detailCounts.medium;

    let baseStyles = this.pickWeightedSeeded(STYLES, counts.style, counts.style + 1, rand);
    if (targetStyle && !baseStyles.includes(targetStyle)) {
      baseStyles = [targetStyle, ...baseStyles.slice(0, -1)];
    }
    const finalStyles = this.mergeForced(baseStyles, forcedStyles, counts.style + 2);

    const baseCompositions = this.pickWeightedSeeded(COMPOSITIONS, counts.composition, counts.composition + 1, rand);
    const finalCompositions = this.mergeForced(baseCompositions, forcedCompositions, counts.composition + 2);

    const baseLightings = this.pickWeightedSeeded(LIGHTINGS, counts.lighting, counts.lighting + 1, rand);
    const finalLightings = this.mergeForced(baseLightings, forcedLightings, counts.lighting + 2);

    const baseMoods = this.pickWeightedSeeded(MOODS, counts.mood, counts.mood + 1, rand);
    const finalMoods = this.mergeForced(baseMoods, forcedMoods, counts.mood + 2);

    const finalColors = this.getColorPalettesByProfile(colorProfile, rand);

    const finalDetails = this.pickWeightedSeeded(DETAILS, counts.detail, counts.detail + 2, rand);
    const finalQuality = this.pickWeightedSeeded(QUALITY_TAGS, counts.quality, counts.quality + 1, rand);

    let mainSubject = extractedSubject;
    if (!mainSubject) {
      mainSubject = this.pickSeeded(MAIN_SUBJECTS, 1, rand)[0];
    }

    const analysis: ImageAnalysis = {
      mainSubject,
      style: finalStyles,
      composition: finalCompositions,
      colorPalette: finalColors,
      lighting: finalLightings,
      mood: finalMoods,
      details: finalDetails,
      qualityTags: finalQuality
    };

    const positiveTags = [
      analysis.mainSubject,
      ...analysis.style,
      ...analysis.composition,
      ...analysis.colorPalette,
      ...analysis.lighting,
      ...analysis.mood,
      ...analysis.details,
      ...analysis.qualityTags
    ];

    const positivePrompt = positiveTags.join(', ');

    const negativePrompt = includeNegative
      ? NEGATIVE_COMMON.join(', ')
      : '';

    const styleCnMap: Record<string, string> = {
      'photorealistic': '写实风格', 'anime style': '动漫风格', 'oil painting': '油画风格',
      'watercolor': '水彩画', 'digital art': '数字艺术', 'cyberpunk': '赛博朋克',
      'steampunk': '蒸汽朋克', 'fantasy art': '奇幻艺术', 'pixel art': '像素艺术',
      '3D render': '3D渲染', 'cinematic': '电影感', 'vintage photography': '复古摄影',
      'surrealism': '超现实主义', 'impressionism': '印象派', 'hyperrealistic': '超写实',
      'concept art': '概念艺术', 'storybook illustration': '绘本插画',
      'minimalist': '极简主义', 'art nouveau': '新艺术', 'art deco': '装饰艺术',
      'low poly': '低多边形', 'isometric': '等轴测', 'chibi style': 'Q版风格',
      'Ukiyo-e': '浮世绘'
    };

    const compCnMap: Record<string, string> = {
      'centered composition': '居中构图', 'rule of thirds': '三分法构图',
      'golden ratio': '黄金比例', 'symmetrical composition': '对称构图',
      'leading lines': '引导线', 'frame within frame': '画中画',
      'low angle shot': '低角度拍摄', 'high angle shot': '俯拍',
      'close-up shot': '特写镜头', 'wide angle shot': '广角拍摄',
      "bird's eye view": '鸟瞰视角', "worm's eye view": '仰视视角',
      'Dutch angle': '倾斜构图', 'depth of field': '景深虚化',
      'foreground framing': '前景构图', 'dynamic pose': '动态姿势',
      'full body shot': '全身构图', 'upper body shot': '半身构图',
      'portrait composition': '肖像构图', 'environmental shot': '环境人像'
    };

    const moodCnMap: Record<string, string> = {
      'peaceful and serene': '宁静祥和', 'mysterious and atmospheric': '神秘氛围',
      'epic and grand': '史诗宏大', 'warm and cozy': '温暖舒适',
      'dark and moody': '黑暗忧郁', 'vibrant and energetic': '活力四射',
      'nostalgic and melancholic': '怀旧感伤', 'dreamy and ethereal': '梦幻飘渺',
      'whimsical and playful': '童趣活泼', 'tense and dramatic': '紧张戏剧',
      'romantic and tender': '浪漫温柔', 'awe-inspiring': '震撼惊叹',
      'eerie and unsettling': '诡异不安', 'uplifting and hopeful': '振奋希望',
      'contemplative and quiet': '沉思安静'
    };

    const cnStyles = analysis.style.map(s => styleCnMap[s] || s).join('、');
    const cnComps = analysis.composition.map(c => compCnMap[c] || c).join('、');
    const cnMoods = analysis.mood.map(m => moodCnMap[m] || m).join('、');
    const cnColors = analysis.colorPalette.join('、');
    const cnLighting = analysis.lighting.slice(0, 2).join('、');

    const promptCn = `一张${cnMoods}的图片，${analysis.mainSubject}，${cnStyles}风格，采用${cnComps}构图，${cnColors}色调，${cnLighting}，画面包含${analysis.details.slice(0, 3).join('、')}，整体品质：${analysis.qualityTags.slice(0, 4).join('、')}`;

    const negativePromptCn = includeNegative
      ? '低质量、模糊、比例失调、肢体畸形、水印文字、构图不佳、过度曝光、噪点过多、画面裁切、五官变形'
      : '';

    const suggestions = this.pickSeeded(STYLE_SUGGESTIONS, 4, rand);

    return {
      analysis,
      positivePrompt,
      negativePrompt,
      promptCn,
      negativePromptCn,
      suggestions
    };
  }
}
