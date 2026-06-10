export interface ToolItem {
  name: string
  path: string
  icon: string
  color: string
  description: string
  tags: string[]
  hot?: boolean
  rating: number
  usageCount: number
  qualityLevel: 'excellent' | 'good' | 'normal'
}

export interface ToolCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subTags: string[]
  tools: ToolItem[]
}

export type SortType = 'hot' | 'rating' | 'usage' | 'name'

export const toolCategories: ToolCategory[] = [
  {
    id: 'image',
    name: '图片处理',
    icon: 'PictureFilled',
    color: '#722ed1',
    description: 'AI 图片识别与处理相关工具',
    subTags: ['拍照识别', 'AI 生成', 'OCR 识别', '创意应用'],
    tools: [
      {
        name: '拍照识别公式',
        path: '/formula-ocr',
        icon: 'Camera',
        color: '#165DFF',
        description: '数学物理化学公式智能识别',
        tags: ['拍照识别', 'OCR 识别'],
        hot: true,
        rating: 4.9,
        usageCount: 128560,
        qualityLevel: 'excellent'
      },
      {
        name: '图片转提示词',
        path: '/image-to-prompt',
        icon: 'PictureFilled',
        color: '#722ed1',
        description: 'AI 分析图片生成绘画提示词',
        tags: ['AI 生成', '创意应用'],
        hot: true,
        rating: 4.8,
        usageCount: 98230,
        qualityLevel: 'excellent'
      },
      {
        name: '看图写话',
        path: '/picture-writing',
        icon: 'Reading',
        color: '#f56c6c',
        description: 'AI 分析图片生成小学生作文',
        tags: ['AI 生成', '创意应用'],
        rating: 4.5,
        usageCount: 35670,
        qualityLevel: 'good'
      },
      {
        name: '拍照识别单词',
        path: '/word-ocr',
        icon: 'Camera',
        color: '#13c2c2',
        description: 'OCR识别单词·音标·例句',
        tags: ['拍照识别', 'OCR 识别'],
        hot: true,
        rating: 4.7,
        usageCount: 87450,
        qualityLevel: 'excellent'
      },
      {
        name: '拍照识别穿搭',
        path: '/outfit-recognition',
        icon: 'CameraFilled',
        color: '#eb2f96',
        description: 'AI 识别衣物·搭配建议·同款推荐',
        tags: ['拍照识别', '创意应用'],
        rating: 4.3,
        usageCount: 28900,
        qualityLevel: 'good'
      },
      {
        name: '拍照识别食物热量',
        path: '/food-calorie',
        icon: 'CameraFilled',
        color: '#67c23a',
        description: 'AI识别食物·热量估算·营养分析',
        tags: ['拍照识别'],
        rating: 4.6,
        usageCount: 56230,
        qualityLevel: 'good'
      },
      {
        name: '拍照识别万物',
        path: '/object-recognition',
        icon: 'CameraFilled',
        color: '#722ed1',
        description: 'AI识别物体·百科知识·探索发现',
        tags: ['拍照识别'],
        hot: true,
        rating: 4.8,
        usageCount: 112340,
        qualityLevel: 'excellent'
      },
      {
        name: '艺术二维码生成',
        path: '/artistic-qrcode',
        icon: 'Grid',
        color: '#eb2f96',
        description: '二维码与艺术图案融合·品牌宣传素材',
        tags: ['创意应用', 'AI 生成'],
        hot: true,
        rating: 4.9,
        usageCount: 145670,
        qualityLevel: 'excellent'
      }
    ]
  },
  {
    id: 'text',
    name: '文字工具',
    icon: 'Edit',
    color: '#165DFF',
    description: '文本处理、写作与内容生成工具',
    subTags: ['文本处理', 'AI 写作', '代码工具', '趣味互动'],
    tools: [
      {
        name: '字数统计',
        path: '/word-counter',
        icon: 'Edit',
        color: '#722ed1',
        description: '文本字数详细统计',
        tags: ['文本处理'],
        hot: true,
        rating: 4.9,
        usageCount: 256800,
        qualityLevel: 'excellent'
      },
      {
        name: 'AI 文本扩写',
        path: '/ai-text-expander',
        icon: 'MagicStick',
        color: '#165DFF',
        description: '智能扩写句子·丰富表达',
        tags: ['AI 写作'],
        hot: true,
        rating: 4.7,
        usageCount: 89560,
        qualityLevel: 'excellent'
      },
      {
        name: '论文辅助写作',
        path: '/thesis-writer',
        icon: 'Reading',
        color: '#e6a23c',
        description: '学术论文内容自动生成',
        tags: ['AI 写作'],
        rating: 4.4,
        usageCount: 42100,
        qualityLevel: 'good'
      },
      {
        name: '代码反混淆',
        path: '/code-deobfuscator',
        icon: 'Monitor',
        color: '#eb2f96',
        description: 'JS代码混淆还原工具',
        tags: ['代码工具'],
        rating: 4.2,
        usageCount: 18760,
        qualityLevel: 'normal'
      },
      {
        name: '成语接龙对战',
        path: '/idiom-chain',
        icon: 'ChatDotRound',
        color: '#eb2f96',
        description: 'AI 智能接龙，挑战你的词汇量',
        tags: ['趣味互动'],
        hot: true,
        rating: 4.8,
        usageCount: 145230,
        qualityLevel: 'excellent'
      }
    ]
  },
  {
    id: 'life',
    name: '生活计算',
    icon: 'Money',
    color: '#67c23a',
    description: '日常生活中的计算与查询工具',
    subTags: ['金融计算', '时间查询', '随机工具', '网络查询'],
    tools: [
      {
        name: '贷款试算',
        path: '/loan-calculator',
        icon: 'Money',
        color: '#165DFF',
        description: '房贷/车贷/公积金计算',
        tags: ['金融计算'],
        hot: true,
        rating: 4.9,
        usageCount: 312560,
        qualityLevel: 'excellent'
      },
      {
        name: '节假日查询',
        path: '/holiday-calendar',
        icon: 'Calendar',
        color: '#67c23a',
        description: '法定节假日与调休查询',
        tags: ['时间查询'],
        hot: true,
        rating: 4.8,
        usageCount: 198700,
        qualityLevel: 'excellent'
      },
      {
        name: '随机选择',
        path: '/random-picker',
        icon: 'Cpu',
        color: '#13c2c2',
        description: '随机选择/抽奖工具',
        tags: ['随机工具'],
        rating: 4.5,
        usageCount: 67890,
        qualityLevel: 'good'
      },
      {
        name: 'IP地址查询',
        path: '/ip-lookup',
        icon: 'Location',
        color: '#f56c6c',
        description: 'IP归属地信息查询',
        tags: ['网络查询'],
        rating: 4.3,
        usageCount: 45670,
        qualityLevel: 'good'
      }
    ]
  },
  {
    id: 'fun',
    name: '趣味娱乐',
    icon: 'MagicStick',
    color: '#eb2f96',
    description: '趣味问答、占卜与创意工具',
    subTags: ['AI 创意', '趣味占卜', '知识问答', '科普学习'],
    tools: [
      {
        name: 'AI 绘画提示词',
        path: '/ai-art-prompts',
        icon: 'MagicStick',
        color: '#722ed1',
        description: '精选提示词快速上手',
        tags: ['AI 创意'],
        hot: true,
        rating: 4.8,
        usageCount: 176540,
        qualityLevel: 'excellent'
      },
      {
        name: '数字占卜问答',
        path: '/number-divination',
        icon: 'MagicStick',
        color: '#722ed1',
        description: '输入1-1314数字·获得心灵启示',
        tags: ['趣味占卜'],
        rating: 4.1,
        usageCount: 23450,
        qualityLevel: 'normal'
      },
      {
        name: '世界之最知识问答',
        path: '/world-record',
        icon: 'Trophy',
        color: '#13c2c2',
        description: 'AI智能问答·百科知识·趣味冷知识',
        tags: ['知识问答'],
        hot: true,
        rating: 4.7,
        usageCount: 98120,
        qualityLevel: 'excellent'
      },
      {
        name: '恐龙知识问答',
        path: '/dinosaur-qa',
        icon: 'Reading',
        color: '#165DFF',
        description: 'AI古生物专家·科普学习·亲子教育',
        tags: ['科普学习', '知识问答'],
        rating: 4.5,
        usageCount: 54320,
        qualityLevel: 'good'
      }
    ]
  },
  {
    id: 'education',
    name: '学习教育',
    icon: 'Reading',
    color: '#e6a23c',
    description: '语言学习、知识问答与教育工具',
    subTags: ['英语学习', '文学诗词', '编程学习', '生活百科'],
    tools: [
      {
        name: '英语口语对话',
        path: '/english-conversation',
        icon: 'ChatDotRound',
        color: '#722ed1',
        description: 'AI 英语对话·场景练习·口语提升',
        tags: ['英语学习'],
        hot: true,
        rating: 4.9,
        usageCount: 234560,
        qualityLevel: 'excellent'
      },
      {
        name: '诗词推荐',
        path: '/poetry-recommendation',
        icon: 'Reading',
        color: '#eb2f96',
        description: '描述心情场景·智能匹配经典诗句',
        tags: ['文学诗词'],
        rating: 4.4,
        usageCount: 38760,
        qualityLevel: 'good'
      },
      {
        name: '场景化英语表达',
        path: '/scene-english',
        icon: 'ChatLineSquare',
        color: '#165DFF',
        description: '真实场景英语表达·实用句式·口语速查',
        tags: ['英语学习'],
        hot: true,
        rating: 4.8,
        usageCount: 156780,
        qualityLevel: 'excellent'
      },
      {
        name: '文学作品问答',
        path: '/literature-qa',
        icon: 'Reading',
        color: '#eb2f96',
        description: '文学解读·读书会讨论·阅读笔记',
        tags: ['文学诗词'],
        rating: 4.3,
        usageCount: 27890,
        qualityLevel: 'good'
      },
      {
        name: '烹饪问题解答',
        path: '/cooking-qa',
        icon: 'Reading',
        color: '#e6a23c',
        description: 'AI专业厨师·做菜技巧·新手学厨',
        tags: ['生活百科'],
        rating: 4.6,
        usageCount: 78900,
        qualityLevel: 'good'
      },
      {
        name: 'Python 代码示例',
        path: '/python-code-samples',
        icon: 'Monitor',
        color: '#13c2c2',
        description: '常用 Python 代码片段速查',
        tags: ['编程学习'],
        rating: 4.5,
        usageCount: 45230,
        qualityLevel: 'good'
      }
    ]
  },
  {
    id: 'dev',
    name: '开发工具',
    icon: 'Cpu',
    color: '#13c2c2',
    description: '开发者常用的效率工具',
    subTags: ['多媒体', '效率办公', '调试工具', '系统管理'],
    tools: [
      {
        name: '音频剪辑',
        path: '/audio-clipper',
        icon: 'Headset',
        color: '#e6a23c',
        description: '在线音频剪切工具',
        tags: ['多媒体'],
        hot: true,
        rating: 4.8,
        usageCount: 187650,
        qualityLevel: 'excellent'
      },
      {
        name: '格子纸生成',
        path: '/grid-paper',
        icon: 'Grid',
        color: '#fa8c16',
        description: '方格/点阵/康奈尔笔记模板',
        tags: ['效率办公'],
        rating: 4.4,
        usageCount: 56780,
        qualityLevel: 'good'
      },
      {
        name: 'WebSocket 调试器',
        path: '/websocket-debugger',
        icon: 'Connection',
        color: '#165DFF',
        description: 'WebSocket 连接测试与调试工具',
        tags: ['调试工具'],
        rating: 4.3,
        usageCount: 23450,
        qualityLevel: 'normal'
      },
      {
        name: 'Excel公式查询',
        path: '/excel-formula',
        icon: 'DataBoard',
        color: '#165DFF',
        description: '智能匹配函数与示例公式',
        tags: ['效率办公'],
        hot: true,
        rating: 4.9,
        usageCount: 201230,
        qualityLevel: 'excellent'
      },
      {
        name: '在线白板',
        path: '/whiteboard',
        icon: 'EditPen',
        color: '#eb2f96',
        description: '无限画布自由创作·头脑风暴·会议记录',
        tags: ['效率办公', '创意应用'],
        hot: true,
        rating: 4.9,
        usageCount: 156890,
        qualityLevel: 'excellent'
      },
      {
        name: '系统设置',
        path: '/system/menu',
        icon: 'Setting',
        color: '#909399',
        description: '菜单与系统管理',
        tags: ['系统管理'],
        rating: 4.0,
        usageCount: 12340,
        qualityLevel: 'normal'
      }
    ]
  }
]

export const getAllTools = (): ToolItem[] => {
  return toolCategories.flatMap(category => category.tools)
}

export const getHotTools = (): ToolItem[] => {
  return getAllTools().filter(tool => tool.hot)
}

export const getQualityBadge = (level: ToolItem['qualityLevel']): { text: string; color: string } => {
  switch (level) {
    case 'excellent':
      return { text: '精选', color: '#f56c6c' }
    case 'good':
      return { text: '优质', color: '#e6a23c' }
    default:
      return { text: '可用', color: '#909399' }
  }
}

export const formatUsageCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

export const searchTools = (keyword: string): ToolItem[] => {
  const lowerKeyword = keyword.toLowerCase()
  return getAllTools().filter(
    tool =>
      tool.name.toLowerCase().includes(lowerKeyword) ||
      tool.description.toLowerCase().includes(lowerKeyword) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

export const getCategoryById = (id: string): ToolCategory | undefined => {
  return toolCategories.find(category => category.id === id)
}

export const getToolsByCategoryAndTag = (
  categoryId: string,
  tag: string
): ToolItem[] => {
  const category = getCategoryById(categoryId)
  if (!category) return []
  if (tag === 'all') return category.tools
  return category.tools.filter(tool => tool.tags.includes(tag))
}

export const sortTools = (tools: ToolItem[], sortType: SortType): ToolItem[] => {
  const sorted = [...tools]
  switch (sortType) {
    case 'hot':
      return sorted.sort((a, b) => {
        if (a.hot && !b.hot) return -1
        if (!a.hot && b.hot) return 1
        return b.usageCount - a.usageCount
      })
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'usage':
      return sorted.sort((a, b) => b.usageCount - a.usageCount)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    default:
      return sorted
  }
}

export const getFirstLetter = (name: string): string => {
  const char = name.charAt(0)
  if (/[a-zA-Z]/.test(char)) {
    return char.toUpperCase()
  }
  if (/[\u4e00-\u9fa5]/.test(char)) {
    return name.charAt(0)
  }
  return '#'
}
