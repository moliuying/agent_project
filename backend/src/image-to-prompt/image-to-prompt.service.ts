import { Injectable } from '@nestjs/common';

export interface ImageToPromptRequest {
  imageBase64: string;
  userDescription?: string;
  targetStyle?: string;
  detailLevel?: string;
  includeNegative?: boolean;
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

const COLOR_PALETTES = [
  'vibrant colors', 'pastel colors', 'warm color palette', 'cool color palette',
  'monochromatic', 'high contrast', 'muted tones', 'neon colors',
  'earth tones', 'black and white', 'sepia tones', 'golden hour colors',
  'blue hour lighting', 'sunset colors', 'rainbow colors', 'saturated colors',
  'soft colors', 'dramatic lighting', 'complementary colors', 'analogous colors'
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
  '可以尝试加入 "by {artist}" 来模仿特定艺术家风格',
  '添加 "trending on Artstation/Pixiv" 可提升画面质感',
  '使用 "Unreal Engine 5, Octane render" 增强3D渲染效果',
  '在提示词末尾加上权重如 (keyword:1.2) 可加强效果',
  '建议指定具体分辨率，如 "8K, ultra detailed"'
];

@Injectable()
export class ImageToPromptService {
  private getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private pickWeighted<T>(arr: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.getRandomItems(arr, count);
  }

  async generate(request: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    const { userDescription, targetStyle, detailLevel = 'medium', includeNegative = true, outputLanguage = 'en' } = request;

    let baseSubject = userDescription?.trim() || '';

    const detailCounts = {
      simple: { style: 1, composition: 1, color: 1, lighting: 1, mood: 1, detail: 1, quality: 2 },
      medium: { style: 2, composition: 2, color: 2, lighting: 2, mood: 1, detail: 2, quality: 3 },
      detailed: { style: 3, composition: 3, color: 3, lighting: 2, mood: 2, detail: 4, quality: 5 },
      extreme: { style: 4, composition: 3, color: 3, lighting: 3, mood: 2, detail: 5, quality: 6 }
    };

    const counts = detailCounts[detailLevel as keyof typeof detailCounts] || detailCounts.medium;

    const analysis: ImageAnalysis = {
      mainSubject: baseSubject || this.getRandomItems(MAIN_SUBJECTS, 1)[0],
      style: targetStyle ? [targetStyle, ...this.getRandomItems(STYLES.filter(s => s !== targetStyle), counts.style - 1)] : this.pickWeighted(STYLES, counts.style, counts.style + 1),
      composition: this.pickWeighted(COMPOSITIONS, counts.composition, counts.composition + 1),
      colorPalette: this.pickWeighted(COLOR_PALETTES, counts.color, counts.color + 1),
      lighting: this.pickWeighted(LIGHTINGS, counts.lighting, counts.lighting + 1),
      mood: this.pickWeighted(MOODS, counts.mood, counts.mood + 1),
      details: this.pickWeighted(DETAILS, counts.detail, counts.detail + 2),
      qualityTags: this.pickWeighted(QUALITY_TAGS, counts.quality, counts.quality + 1)
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
      'surrealism': '超现实主义', 'impressionism': '印象派'
    };

    const promptCn = `一张${analysis.mood.join('、')}的图片，${analysis.mainSubject}，${analysis.style.map(s => styleCnMap[s] || s).join('、')}风格，采用${analysis.composition.join('、')}构图，${analysis.colorPalette.join('、')}色调，${analysis.lighting.join('、')}，画面包含${analysis.details.slice(0, 3).join('、')}，整体品质：${analysis.qualityTags.slice(0, 4).join('、')}`;

    const negativePromptCn = includeNegative
      ? '低质量、模糊、比例失调、肢体畸形、水印文字、构图不佳、过度曝光、噪点过多、画面裁切'
      : '';

    const suggestions = this.getRandomItems(STYLE_SUGGESTIONS, 3);

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
