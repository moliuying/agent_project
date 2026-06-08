export interface AiArtPrompt {
  id: number
  title: string
  category: string
  tags: string[]
  prompt: string
  negativePrompt?: string
  description: string
  model?: string
  previewEmoji?: string
}

export const promptCategories = [
  { key: 'all', name: '全部', icon: 'Collection' },
  { key: 'portrait', name: '人像', icon: 'User' },
  { key: 'landscape', name: '风景', icon: 'Picture' },
  { key: 'anime', name: '动漫', icon: 'MagicStick' },
  { key: 'scifi', name: '科幻', icon: 'Cpu' },
  { key: 'fantasy', name: '奇幻', icon: 'Star' },
  { key: 'product', name: '产品', icon: 'Goods' },
  { key: 'architecture', name: '建筑', icon: 'OfficeBuilding' },
  { key: 'animal', name: '动物', icon: 'Cherry' }
]

export const aiArtPrompts: AiArtPrompt[] = [
  {
    id: 1,
    title: '梦幻少女肖像',
    category: 'portrait',
    tags: ['人像', '梦幻', '唯美'],
    prompt: 'a beautiful young woman, soft ethereal lighting, dreamy atmosphere, flowing hair, delicate features, pastel colors, bokeh background, professional photography, 8k, ultra detailed, cinematic lighting',
    negativePrompt: 'ugly, deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, disgusting, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, blurry, mutated hands and fingers, watermark, watermarked, oversaturated, distorted hands, amputation, missing hands, obese, doubled face, double hands',
    description: '适用于生成唯美梦幻风格的女性肖像，柔和的光线和朦胧背景营造出浪漫氛围。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '👩'
  },
  {
    id: 2,
    title: '赛博朋克城市夜景',
    category: 'scifi',
    tags: ['赛博朋克', '城市', '夜景', '霓虹'],
    prompt: 'cyberpunk city at night, neon lights, rain, wet streets reflecting colorful signs, futuristic buildings, flying cars, holographic advertisements, dense atmosphere, cinematic, ultra detailed, 8k, dramatic lighting, blade runner style',
    negativePrompt: 'low quality, blurry, bad composition, boring, static, dull colors',
    description: '经典赛博朋克风格的未来都市夜景，霓虹灯、雨天、全息广告营造科技感。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '🌃'
  },
  {
    id: 3,
    title: '日系动漫少女',
    category: 'anime',
    tags: ['动漫', '日系', '少女'],
    prompt: 'anime style girl, beautiful detailed eyes, cute expression, school uniform, cherry blossoms falling, soft sunlight, vibrant colors, masterpiece, best quality, highly detailed, illustration, kawaii',
    negativePrompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
    description: '日系动漫风格的可爱少女形象，樱花飘落增添浪漫气息。',
    model: 'Anything V5 / Counterfeit',
    previewEmoji: '🌸'
  },
  {
    id: 4,
    title: '奇幻魔法森林',
    category: 'fantasy',
    tags: ['奇幻', '森林', '魔法', '神秘'],
    prompt: 'enchanted magical forest, glowing mushrooms, fireflies, ancient trees with glowing runes, mystical atmosphere, ethereal fog, fantasy art, ultra detailed, trending on artstation, cinematic lighting, 8k, vibrant colors, concept art',
    negativePrompt: 'modern, realistic, boring, plain, dark, ugly',
    description: '充满魔法气息的神秘森林场景，发光蘑菇和符文古树营造奇幻世界。',
    model: 'Stable Diffusion',
    previewEmoji: '🌲'
  },
  {
    id: 5,
    title: '现代极简产品摄影',
    category: 'product',
    tags: ['产品', '摄影', '极简', '商业'],
    prompt: 'product photography of a luxury perfume bottle, minimalist style, clean white background, soft studio lighting, reflections, high end commercial photography, sharp focus, 8k, ultra detailed, professional color grading',
    negativePrompt: 'blurry, low quality, messy background, distorted, ugly, watermark',
    description: '适用于电商产品展示的极简风格摄影，干净背景突出产品质感。',
    model: 'Stable Diffusion / DALL-E',
    previewEmoji: '🧴'
  },
  {
    id: 6,
    title: '壮丽雪山日落',
    category: 'landscape',
    tags: ['风景', '雪山', '日落', '自然'],
    prompt: 'majestic mountain landscape at sunset, snow capped peaks, golden hour lighting, dramatic clouds, reflection in alpine lake, ultra wide angle, National Geographic photography, 8k, ultra detailed, vibrant colors, breathtaking view',
    negativePrompt: 'blurry, low quality, boring, flat lighting, dull colors',
    description: '壮丽的雪山日落风景，金色阳光映照雪峰和湖面倒影，震撼人心。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '🏔️'
  },
  {
    id: 7,
    title: '未来主义建筑',
    category: 'architecture',
    tags: ['建筑', '未来主义', '现代'],
    prompt: 'futuristic architecture design, sleek curves, glass and steel structure, floating gardens, sustainable design, sunlight streaming through, minimalist interior, architectural photography, 8k, ultra detailed, award winning design',
    negativePrompt: 'old, traditional, ugly, messy, low quality, blurry',
    description: '未来主义风格的建筑设计，流线型外观与自然元素融合。',
    model: 'Stable Diffusion',
    previewEmoji: '🏛️'
  },
  {
    id: 8,
    title: '可爱猫咪肖像',
    category: 'animal',
    tags: ['动物', '猫咪', '可爱', '宠物'],
    prompt: 'adorable fluffy kitten portrait, big expressive eyes, soft fur details, warm cozy lighting, pastel background, professional pet photography, 8k, ultra detailed, cute expression, playful pose',
    negativePrompt: 'ugly, deformed, blurry, bad anatomy, scary, aggressive',
    description: '超萌的猫咪肖像，突出毛发质感和可爱表情。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '🐱'
  },
  {
    id: 9,
    title: '蒸汽朋克机械',
    category: 'scifi',
    tags: ['蒸汽朋克', '机械', '复古'],
    prompt: 'steampunk mechanical device, intricate brass gears, copper pipes, steam pressure gauges, vintage leather, detailed machinery, dramatic lighting, industrial background, ultra detailed, 8k, concept art, trending on artstation',
    negativePrompt: 'modern, plastic, simple, boring, low quality',
    description: '精密复杂的蒸汽朋克机械装置，黄铜齿轮与复古皮革的完美结合。',
    model: 'Stable Diffusion',
    previewEmoji: '⚙️'
  },
  {
    id: 10,
    title: '水墨山水画',
    category: 'landscape',
    tags: ['中国风', '水墨', '山水', '传统'],
    prompt: 'traditional Chinese ink wash painting, misty mountains, pine trees, small boat on calm river, minimalist composition, flowing brush strokes, rice paper texture, zen atmosphere, masterpiece, elegant, poetic',
    negativePrompt: 'photorealistic, colorful, western style, modern, 3d render',
    description: '中国传统水墨山水画风格，意境悠远，禅意十足。',
    model: 'Stable Diffusion',
    previewEmoji: '🎨'
  },
  {
    id: 11,
    title: '游戏角色战士',
    category: 'fantasy',
    tags: ['角色', '战士', '游戏', '史诗'],
    prompt: 'epic fantasy warrior character, full body portrait, detailed armor with engravings, glowing magical weapon, dramatic pose, cinematic lighting, highly detailed, 8k, concept art, RPG game character, trending on artstation',
    negativePrompt: 'low quality, blurry, bad anatomy, ugly, deformed, casual clothes',
    description: '史诗级奇幻战士角色设计，精致盔甲和魔法武器彰显英雄气概。',
    model: 'Stable Diffusion',
    previewEmoji: '⚔️'
  },
  {
    id: 12,
    title: '日系海边风景',
    category: 'anime',
    tags: ['动漫', '风景', '海边', '治愈'],
    prompt: 'anime style seaside landscape, calm blue ocean, white sandy beach, cumulus clouds in blue sky, sunset glow, nostalgic atmosphere, Makoto Shinkai style, vibrant colors, detailed clouds, lens flare, masterpiece, 4k',
    negativePrompt: 'realistic, photo, 3d render, dark, storm, people',
    description: '新海诚风格的治愈系海边风景，蓝天白云夕阳余晖营造怀旧氛围。',
    model: 'Anything V5 / Counterfeit',
    previewEmoji: '🌊'
  },
  {
    id: 13,
    title: '优雅婚纱人像',
    category: 'portrait',
    tags: ['人像', '婚纱', '优雅', '婚礼'],
    prompt: 'elegant bride in wedding dress, flowing veil, soft natural lighting, romantic garden setting, delicate makeup, graceful pose, professional wedding photography, 8k, ultra detailed, soft bokeh, timeless beauty',
    negativePrompt: 'ugly, deformed, blurry, bad anatomy, casual clothes, modern',
    description: '优雅唯美的婚纱人像，适合婚礼相关的创作需求。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '👰'
  },
  {
    id: 14,
    title: '北欧风格室内设计',
    category: 'architecture',
    tags: ['室内', '北欧', '极简', '家居'],
    prompt: 'Scandinavian style interior design, minimalist living room, light wood furniture, white walls, large windows with natural light, cozy textiles, green plants, clean aesthetic, interior design photography, 8k, ultra detailed, warm atmosphere',
    negativePrompt: 'cluttered, dark, colorful, ornate, messy, low quality',
    description: '简洁温暖的北欧风格室内设计，自然光线与木质元素和谐搭配。',
    model: 'Stable Diffusion',
    previewEmoji: '🛋️'
  },
  {
    id: 15,
    title: '霸气龙肖像',
    category: 'fantasy',
    tags: ['龙', '奇幻', '史诗'],
    prompt: 'majestic dragon portrait, detailed scales shimmering, fiery eyes, smoke coming from nostrils, dramatic lighting against dark background, ultra detailed, 8k, concept art, fantasy illustration, trending on artstation, cinematic',
    negativePrompt: 'cute, cartoon, small, friendly, blurry, low quality',
    description: '威武霸气的巨龙肖像，细腻的鳞片和火焰般的眼睛震撼人心。',
    model: 'Stable Diffusion',
    previewEmoji: '🐉'
  },
  {
    id: 16,
    title: '极光星空',
    category: 'landscape',
    tags: ['星空', '极光', '夜景', '自然'],
    prompt: 'stunning aurora borealis over snow covered mountains, green and purple northern lights, starry night sky, reflection in frozen lake, long exposure photography, 8k, ultra detailed, magical atmosphere, National Geographic',
    negativePrompt: 'blurry, low quality, boring, dull colors, people',
    description: '绚丽的极光星空夜景，绿色紫色光幕倒映在冰湖之上。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '🌌'
  },
  {
    id: 17,
    title: '动漫机甲战斗',
    category: 'anime',
    tags: ['机甲', '战斗', '热血'],
    prompt: 'epic mecha anime battle scene, giant robot, dynamic pose, explosions in background, energy effects, highly detailed mechanical parts, dramatic lighting, cinematic composition, anime style, 4k, masterpiece',
    negativePrompt: 'realistic, photo, slow, peaceful, low quality, blurry',
    description: '热血动漫风格的机甲战斗场面，动态构图和能量特效极具冲击力。',
    model: 'Anything V5',
    previewEmoji: '🤖'
  },
  {
    id: 18,
    title: '森林小狐狸',
    category: 'animal',
    tags: ['动物', '狐狸', '自然', '可爱'],
    prompt: 'adorable red fox in autumn forest, golden leaves, soft sunlight filtering through trees, curious expression, fluffy tail, wildlife photography, ultra detailed, 8k, warm colors, bokeh background, National Geographic quality',
    negativePrompt: 'ugly, scary, aggressive, blurry, low quality, pet, domestic',
    description: '秋季森林中的可爱小狐狸，金色落叶与阳光营造温暖氛围。',
    model: 'Stable Diffusion / Midjourney',
    previewEmoji: '🦊'
  },
  {
    id: 19,
    title: '科技感耳机产品',
    category: 'product',
    tags: ['产品', '科技', '3C', '商业'],
    prompt: 'product shot of futuristic wireless headphones, sleek metallic finish, LED accent lights, floating in zero gravity, dark studio background, dramatic rim lighting, reflections, high end tech commercial, 8k, ultra sharp, professional',
    negativePrompt: 'blurry, low quality, messy, cheap, plastic look, watermark',
    description: '科技感十足的耳机产品展示，悬浮效果和打光凸显高端质感。',
    model: 'Stable Diffusion / DALL-E',
    previewEmoji: '🎧'
  },
  {
    id: 20,
    title: '油画风格老人肖像',
    category: 'portrait',
    tags: ['人像', '油画', '艺术', '经典'],
    prompt: 'classical oil painting portrait of an elderly man with wisdom in his eyes, detailed wrinkles and beard, dramatic chiaroscuro lighting, Rembrandt style, rich colors, textured brushstrokes, museum quality, masterpiece, 8k',
    negativePrompt: 'photo, realistic, modern, young, blurry, low quality, ugly',
    description: '伦勃朗风格的古典油画老人肖像，光影对比强烈充满故事感。',
    model: 'Stable Diffusion',
    previewEmoji: '🧔'
  }
]
