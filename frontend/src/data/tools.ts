export interface ToolItem {
  name: string
  path: string
  icon: string
  color: string
  description: string
}

export interface ToolCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  tools: ToolItem[]
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'image',
    name: '图片处理',
    icon: 'PictureFilled',
    color: '#722ed1',
    description: 'AI 图片识别与处理相关工具',
    tools: [
      {
        name: '拍照识别公式',
        path: '/formula-ocr',
        icon: 'Camera',
        color: '#165DFF',
        description: '数学物理化学公式智能识别'
      },
      {
        name: '图片转提示词',
        path: '/image-to-prompt',
        icon: 'PictureFilled',
        color: '#722ed1',
        description: 'AI 分析图片生成绘画提示词'
      },
      {
        name: '看图写话',
        path: '/picture-writing',
        icon: 'Reading',
        color: '#f56c6c',
        description: 'AI 分析图片生成小学生作文'
      },
      {
        name: '拍照识别单词',
        path: '/word-ocr',
        icon: 'Camera',
        color: '#13c2c2',
        description: 'OCR识别单词·音标·例句'
      },
      {
        name: '拍照识别穿搭',
        path: '/outfit-recognition',
        icon: 'CameraFilled',
        color: '#eb2f96',
        description: 'AI 识别衣物·搭配建议·同款推荐'
      },
      {
        name: '拍照识别食物热量',
        path: '/food-calorie',
        icon: 'CameraFilled',
        color: '#67c23a',
        description: 'AI识别食物·热量估算·营养分析'
      },
      {
        name: '拍照识别万物',
        path: '/object-recognition',
        icon: 'CameraFilled',
        color: '#722ed1',
        description: 'AI识别物体·百科知识·探索发现'
      }
    ]
  },
  {
    id: 'text',
    name: '文字工具',
    icon: 'Edit',
    color: '#165DFF',
    description: '文本处理、写作与内容生成工具',
    tools: [
      {
        name: '字数统计',
        path: '/word-counter',
        icon: 'Edit',
        color: '#722ed1',
        description: '文本字数详细统计'
      },
      {
        name: 'AI 文本扩写',
        path: '/ai-text-expander',
        icon: 'MagicStick',
        color: '#165DFF',
        description: '智能扩写句子·丰富表达'
      },
      {
        name: '论文辅助写作',
        path: '/thesis-writer',
        icon: 'Reading',
        color: '#e6a23c',
        description: '学术论文内容自动生成'
      },
      {
        name: '代码反混淆',
        path: '/code-deobfuscator',
        icon: 'Monitor',
        color: '#eb2f96',
        description: 'JS代码混淆还原工具'
      },
      {
        name: '成语接龙对战',
        path: '/idiom-chain',
        icon: 'ChatDotRound',
        color: '#eb2f96',
        description: 'AI 智能接龙，挑战你的词汇量'
      }
    ]
  },
  {
    id: 'life',
    name: '生活计算',
    icon: 'Money',
    color: '#67c23a',
    description: '日常生活中的计算与查询工具',
    tools: [
      {
        name: '贷款试算',
        path: '/loan-calculator',
        icon: 'Money',
        color: '#165DFF',
        description: '房贷/车贷/公积金计算'
      },
      {
        name: '节假日查询',
        path: '/holiday-calendar',
        icon: 'Calendar',
        color: '#67c23a',
        description: '法定节假日与调休查询'
      },
      {
        name: '随机选择',
        path: '/random-picker',
        icon: 'Cpu',
        color: '#13c2c2',
        description: '随机选择/抽奖工具'
      },
      {
        name: 'IP地址查询',
        path: '/ip-lookup',
        icon: 'Location',
        color: '#f56c6c',
        description: 'IP归属地信息查询'
      }
    ]
  },
  {
    id: 'fun',
    name: '趣味娱乐',
    icon: 'MagicStick',
    color: '#eb2f96',
    description: '趣味问答、占卜与创意工具',
    tools: [
      {
        name: 'AI 绘画提示词',
        path: '/ai-art-prompts',
        icon: 'MagicStick',
        color: '#722ed1',
        description: '精选提示词快速上手'
      },
      {
        name: '数字占卜问答',
        path: '/number-divination',
        icon: 'MagicStick',
        color: '#722ed1',
        description: '输入1-1314数字·获得心灵启示'
      },
      {
        name: '世界之最知识问答',
        path: '/world-record',
        icon: 'Trophy',
        color: '#13c2c2',
        description: 'AI智能问答·百科知识·趣味冷知识'
      },
      {
        name: '恐龙知识问答',
        path: '/dinosaur-qa',
        icon: 'Reading',
        color: '#165DFF',
        description: 'AI古生物专家·科普学习·亲子教育'
      }
    ]
  },
  {
    id: 'education',
    name: '学习教育',
    icon: 'Reading',
    color: '#e6a23c',
    description: '语言学习、知识问答与教育工具',
    tools: [
      {
        name: '英语口语对话',
        path: '/english-conversation',
        icon: 'ChatDotRound',
        color: '#722ed1',
        description: 'AI 英语对话·场景练习·口语提升'
      },
      {
        name: '诗词推荐',
        path: '/poetry-recommendation',
        icon: 'Reading',
        color: '#eb2f96',
        description: '描述心情场景·智能匹配经典诗句'
      },
      {
        name: '场景化英语表达',
        path: '/scene-english',
        icon: 'ChatLineSquare',
        color: '#165DFF',
        description: '真实场景英语表达·实用句式·口语速查'
      },
      {
        name: '文学作品问答',
        path: '/literature-qa',
        icon: 'Reading',
        color: '#eb2f96',
        description: '文学解读·读书会讨论·阅读笔记'
      },
      {
        name: '烹饪问题解答',
        path: '/cooking-qa',
        icon: 'Reading',
        color: '#e6a23c',
        description: 'AI专业厨师·做菜技巧·新手学厨'
      },
      {
        name: 'Python 代码示例',
        path: '/python-code-samples',
        icon: 'Monitor',
        color: '#13c2c2',
        description: '常用 Python 代码片段速查'
      }
    ]
  },
  {
    id: 'dev',
    name: '开发工具',
    icon: 'Cpu',
    color: '#13c2c2',
    description: '开发者常用的效率工具',
    tools: [
      {
        name: '音频剪辑',
        path: '/audio-clipper',
        icon: 'Headset',
        color: '#e6a23c',
        description: '在线音频剪切工具'
      },
      {
        name: '格子纸生成',
        path: '/grid-paper',
        icon: 'Grid',
        color: '#fa8c16',
        description: '方格/点阵/康奈尔笔记模板'
      },
      {
        name: 'WebSocket 调试器',
        path: '/websocket-debugger',
        icon: 'Connection',
        color: '#165DFF',
        description: 'WebSocket 连接测试与调试工具'
      },
      {
        name: 'Excel公式查询',
        path: '/excel-formula',
        icon: 'DataBoard',
        color: '#165DFF',
        description: '智能匹配函数与示例公式'
      },
      {
        name: '系统设置',
        path: '/system/menu',
        icon: 'Setting',
        color: '#909399',
        description: '菜单与系统管理'
      }
    ]
  }
]

export const getAllTools = (): ToolItem[] => {
  return toolCategories.flatMap(category => category.tools)
}

export const searchTools = (keyword: string): ToolItem[] => {
  const lowerKeyword = keyword.toLowerCase()
  return getAllTools().filter(
    tool =>
      tool.name.toLowerCase().includes(lowerKeyword) ||
      tool.description.toLowerCase().includes(lowerKeyword)
  )
}

export const getCategoryById = (id: string): ToolCategory | undefined => {
  return toolCategories.find(category => category.id === id)
}
