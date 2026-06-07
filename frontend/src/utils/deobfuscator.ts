export interface DeobfuscateResult {
  code: string
  transformations: TransformationRecord[]
  detectedObfuscationTypes: string[]
}

export interface TransformationRecord {
  type: string
  description: string
  before?: string
  after?: string
}

export type ObfuscationType =
  | 'base64'
  | 'unicode-escape'
  | 'url-encode'
  | 'hex-escape'
  | 'html-entity'
  | 'js-eval'
  | 'js-function-constructor'
  | 'string-concat'
  | 'array-index-obfuscation'
  | 'variable-renaming'
  | 'control-flow-flattening'
  | 'dead-code-injection'
  | 'jsfuck'
  | 'jjencode'
  | 'mixed'

const OBFUSCATION_LABELS: Record<ObfuscationType, string> = {
  'base64': 'Base64 编码',
  'unicode-escape': 'Unicode 转义 (\\uXXXX)',
  'url-encode': 'URL 编码 (%XX)',
  'hex-escape': '十六进制转义 (\\xXX)',
  'html-entity': 'HTML 实体编码',
  'js-eval': 'JavaScript eval 包装',
  'js-function-constructor': 'Function 构造函数',
  'string-concat': '字符串拼接混淆',
  'array-index-obfuscation': '数组索引混淆',
  'variable-renaming': '变量/函数名混淆',
  'control-flow-flattening': '控制流平坦化',
  'dead-code-injection': '死代码注入',
  'jsfuck': 'JSFuck 编码',
  'jjencode': 'JJEncode 编码',
  'mixed': '多层混合混淆'
}

export function getObfuscationLabel(type: ObfuscationType): string {
  return OBFUSCATION_LABELS[type] || type
}

export function detectObfuscationTypes(code: string): ObfuscationType[] {
  const types: ObfuscationType[] = []
  const trimmed = code.trim()

  if (detectBase64(trimmed)) types.push('base64')
  if (/\\u[0-9a-fA-F]{4}/.test(trimmed)) types.push('unicode-escape')
  if (/%[0-9a-fA-F]{2}/.test(trimmed) && !trimmed.includes('function') && !trimmed.includes('var ')) {
    types.push('url-encode')
  }
  if (/\\x[0-9a-fA-F]{2}/.test(trimmed)) types.push('hex-escape')
  if (/&[a-zA-Z]+;|&#x?[0-9a-fA-F]+;/.test(trimmed)) types.push('html-entity')
  if (/^eval\s*\(/.test(trimmed)) types.push('js-eval')
  if (/new\s+Function\s*\(/.test(trimmed)) types.push('js-function-constructor')
  if (detectStringConcat(trimmed)) types.push('string-concat')
  if (detectArrayIndexObfuscation(trimmed)) types.push('array-index-obfuscation')
  if (detectJSFuck(trimmed)) types.push('jsfuck')
  if (detectJJEncode(trimmed)) types.push('jjencode')

  if (types.length > 2) {
    types.push('mixed')
  }

  return types
}

function detectBase64(code: string): boolean {
  const trimmed = code.trim().replace(/['"`]/g, '')
  if (trimmed.length < 8) return false
  if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) return false
  if (trimmed.length % 4 !== 0) return false
  try {
    const decoded = atob(trimmed)
    let printableRatio = 0
    for (let i = 0; i < decoded.length; i++) {
      const code = decoded.charCodeAt(i)
      if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
        printableRatio++
      }
    }
    return printableRatio / decoded.length > 0.7
  } catch {
    return false
  }
}

function detectStringConcat(code: string): boolean {
  const pattern = /(['"`])([^'"`]{0,30})\1\s*\+\s*\1/g
  const matches = code.match(pattern)
  return matches !== null && matches.length >= 3
}

function detectArrayIndexObfuscation(code: string): boolean {
  return /\[[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\]/.test(code) ||
    /\[[a-zA-Z_$][a-zA-Z0-9_$]*\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$]*\]/.test(code)
}

function detectJSFuck(code: string): boolean {
  const uniqueChars = new Set(code.replace(/\s/g, ''))
  const jsfuckChars = new Set(['[', ']', '(', ')', '!', '+'])
  if (uniqueChars.size < 3) return false
  for (const ch of uniqueChars) {
    if (!jsfuckChars.has(ch)) return false
  }
  return uniqueChars.size >= 3
}

function detectJJEncode(code: string): boolean {
  return code.trim().startsWith('[(![]+[])[+[]]+') ||
    /\[\+\[(.*?)\]\]/.test(code) && /!\+\[\]/.test(code)
}

export function deobfuscate(
  code: string,
  options: {
    maxIterations?: number
    formatCode?: boolean
  } = {}
): DeobfuscateResult {
  const maxIterations = options.maxIterations ?? 10
  const transformations: TransformationRecord[] = []
  const detectedTypes = detectObfuscationTypes(code)
  let currentCode = code

  for (let i = 0; i < maxIterations; i++) {
    const beforeCode = currentCode

    currentCode = decodeBase64Strings(currentCode, transformations)
    currentCode = decodeUnicodeEscapes(currentCode, transformations)
    currentCode = decodeHexEscapes(currentCode, transformations)
    currentCode = decodeUrlEncoding(currentCode, transformations)
    currentCode = decodeHtmlEntities(currentCode, transformations)
    currentCode = unwrapEval(currentCode, transformations)
    currentCode = unwrapFunctionConstructor(currentCode, transformations)
    currentCode = resolveStringConcatenation(currentCode, transformations)

    if (currentCode === beforeCode) {
      break
    }
  }

  if (options.formatCode !== false) {
    currentCode = formatJavaScript(currentCode)
  }

  const finalDetectedTypes = [
    ...new Set([...detectedTypes, ...detectObfuscationTypes(code)])
  ]

  return {
    code: currentCode,
    transformations,
    detectedObfuscationTypes: finalDetectedTypes.map(t => getObfuscationLabel(t as ObfuscationType))
  }
}

function decodeBase64Strings(code: string, transformations: TransformationRecord[]): string {
  const patterns = [
    /atob\s*\(\s*(['"`])([A-Za-z0-9+/=]+)\1\s*\)/g,
    /(['"`])([A-Za-z0-9+/]{16,}={0,2})\1/g
  ]

  let result = code
  let replaced = false

  for (const pattern of patterns) {
    result = result.replace(pattern, (match, quote, b64, offset) => {
      try {
        if (b64.length % 4 !== 0) return match
        const decoded = atob(b64)
        let printableRatio = 0
        for (let i = 0; i < decoded.length; i++) {
          const c = decoded.charCodeAt(i)
          if ((c >= 32 && c <= 126) || c === 10 || c === 13 || c === 9) {
            printableRatio++
          }
        }
        if (printableRatio / decoded.length < 0.7) return match

        replaced = true
        transformations.push({
          type: 'base64',
          description: 'Base64 字符串解码',
          before: match.slice(0, 80) + (match.length > 80 ? '...' : ''),
          after: decoded.slice(0, 80) + (decoded.length > 80 ? '...' : '')
        })

        const escaped = decoded
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
        return quote + escaped + quote
      } catch {
        return match
      }
    })
  }

  if (!replaced && code.trim().length > 0) {
    const trimmed = code.trim()
    if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length >= 8) {
      try {
        const decoded = atob(trimmed)
        let printableRatio = 0
        for (let i = 0; i < decoded.length; i++) {
          const c = decoded.charCodeAt(i)
          if ((c >= 32 && c <= 126) || c === 10 || c === 13 || c === 9) {
            printableRatio++
          }
        }
        if (printableRatio / decoded.length > 0.7) {
          transformations.push({
            type: 'base64',
            description: '完整 Base64 内容解码',
            before: trimmed.slice(0, 80) + (trimmed.length > 80 ? '...' : ''),
            after: decoded.slice(0, 80) + (decoded.length > 80 ? '...' : '')
          })
          return decoded
        }
      } catch {
        // ignore
      }
    }
  }

  return result
}

function decodeUnicodeEscapes(code: string, transformations: TransformationRecord[]): string {
  const unicodePattern = /\\u([0-9a-fA-F]{4})/g
  let replaced = false

  const result = code.replace(unicodePattern, (match, hex) => {
    try {
      replaced = true
      return String.fromCharCode(parseInt(hex, 16))
    } catch {
      return match
    }
  })

  if (replaced) {
    transformations.push({
      type: 'unicode-escape',
      description: 'Unicode 转义字符解码 (\\uXXXX → 字符)'
    })
  }

  return result
}

function decodeHexEscapes(code: string, transformations: TransformationRecord[]): string {
  const hexPattern = /\\x([0-9a-fA-F]{2})/g
  let replaced = false

  const result = code.replace(hexPattern, (match, hex) => {
    try {
      replaced = true
      return String.fromCharCode(parseInt(hex, 16))
    } catch {
      return match
    }
  })

  if (replaced) {
    transformations.push({
      type: 'hex-escape',
      description: '十六进制转义字符解码 (\\xXX → 字符)'
    })
  }

  return result
}

function decodeUrlEncoding(code: string, transformations: TransformationRecord[]): string {
  if (!/%[0-9a-fA-F]{2}/.test(code)) return code

  try {
    const decoded = decodeURIComponent(code)
    if (decoded !== code) {
      transformations.push({
        type: 'url-encode',
        description: 'URL 编码解码 (%XX → 字符)'
      })
      return decoded
    }
  } catch {
    // ignore
  }
  return code
}

function decodeHtmlEntities(code: string, transformations: TransformationRecord[]): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&hellip;': '…',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'"
  }

  let result = code
  let replaced = false

  result = result.replace(/&[a-zA-Z]+;/g, (match) => {
    if (entityMap[match]) {
      replaced = true
      return entityMap[match]
    }
    return match
  })

  result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      replaced = true
      return String.fromCharCode(parseInt(hex, 16))
    } catch {
      return match
    }
  })

  result = result.replace(/&#(\d+);/g, (match, num) => {
    try {
      replaced = true
      return String.fromCharCode(parseInt(num, 10))
    } catch {
      return match
    }
  })

  if (replaced) {
    transformations.push({
      type: 'html-entity',
      description: 'HTML 实体编码解码'
    })
  }

  return result
}

function unwrapEval(code: string, transformations: TransformationRecord[]): string {
  const evalPattern = /^eval\s*\(\s*(['"`])([\s\S]*?)\1\s*\);?\s*$/
  const match = code.match(evalPattern)

  if (match) {
    const innerCode = match[2]
    transformations.push({
      type: 'js-eval',
      description: '展开 eval() 包装',
      before: 'eval(...)',
      after: innerCode.slice(0, 80) + (innerCode.length > 80 ? '...' : '')
    })
    return innerCode
  }

  const evalWithConcat = /eval\s*\(\s*([\s\S]*?)\s*\)/g
  let result = code
  let replaced = false

  result = result.replace(evalWithConcat, (match, expression) => {
    expression = expression.trim()
    if (/^['"`]/.test(expression)) {
      try {
        let inner = ''
        if (expression.startsWith("'") || expression.startsWith('"')) {
          inner = expression.slice(1, -1)
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\')
        }
        if (inner && inner.length > 0) {
          replaced = true
          return inner
        }
      } catch {
        // ignore
      }
    }
    return match
  })

  if (replaced) {
    transformations.push({
      type: 'js-eval',
      description: '展开 eval() 中的字符串代码'
    })
  }

  return result
}

function unwrapFunctionConstructor(code: string, transformations: TransformationRecord[]): string {
  const funcPattern = /new\s+Function\s*\(\s*(['"`])([\s\S]*?)\1\s*\)\s*\(\s*\)/g
  let result = code
  let replaced = false

  result = result.replace(funcPattern, (match, quote, body) => {
    try {
      const decodedBody = body
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
      replaced = true
      return decodedBody
    } catch {
      return match
    }
  })

  if (replaced) {
    transformations.push({
      type: 'js-function-constructor',
      description: '展开 Function 构造函数包装'
    })
  }

  return result
}

function resolveStringConcatenation(code: string, transformations: TransformationRecord[]): string {
  const concatPattern = /(['"`])((?:(?!\1)[\s\S])*?)\1\s*\+\s*\1((?:(?!\1)[\s\S])*?)\1/g
  let result = code
  let replaced = false

  let iterations = 0
  while (concatPattern.test(result) && iterations < 50) {
    result = result.replace(concatPattern, (match, quote, str1, str2) => {
      replaced = true
      return quote + str1 + str2 + quote
    })
    iterations++
  }

  if (replaced) {
    transformations.push({
      type: 'string-concat',
      description: '合并被拆分的字符串拼接'
    })
  }

  return result
}

function formatJavaScript(code: string): string {
  if (!code.trim()) return code

  let indent = 0
  const indentSize = 2
  const lines: string[] = []
  let currentLine = ''
  let inString: string | null = null
  let escapeNext = false

  for (let i = 0; i < code.length; i++) {
    const ch = code[i]
    const nextCh = code[i + 1]

    if (escapeNext) {
      currentLine += ch
      escapeNext = false
      continue
    }

    if (inString) {
      currentLine += ch
      if (ch === '\\') escapeNext = true
      else if (ch === inString) inString = null
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      currentLine += ch
      continue
    }

    if (ch === '{') {
      currentLine += ch
      lines.push(currentLine)
      currentLine = ''
      indent += indentSize
      continue
    }

    if (ch === '}') {
      if (currentLine.trim()) {
        lines.push(currentLine)
      }
      indent = Math.max(0, indent - indentSize)
      currentLine = ' '.repeat(indent) + ch
      if (nextCh === ';') {
        currentLine += ';'
        i++
      }
      if (nextCh === ',') {
        currentLine += ','
        i++
      }
      lines.push(currentLine)
      currentLine = ''
      continue
    }

    if (ch === ';') {
      currentLine += ch
      lines.push(currentLine)
      currentLine = ''
      continue
    }

    if (ch === '\n' || ch === '\r') {
      if (currentLine.trim()) {
        lines.push(currentLine)
      }
      currentLine = ''
      continue
    }

    if (ch === ' ' && !currentLine.trim()) {
      continue
    }

    if (!currentLine.trim() && ch !== ' ') {
      currentLine = ' '.repeat(indent) + ch
    } else {
      currentLine += ch
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine)
  }

  return lines
    .map(l => l.replace(/\s+$/g, ''))
    .filter(l => l.length > 0)
    .join('\n')
}

export function generateSampleObfuscatedCode(type: ObfuscationType): string {
  const samples: Record<ObfuscationType, string> = {
    'base64': 'ZXZhbChmdW5jdGlvbihwLGEsYyxrLGUsZCl7aWYoa2V5KHBhcnNlSW50KHBhKSl7cmV0dXJuIHB9fSkoJzEnLDEsMixbJ2FsZXJ0JywnSGVsbG8gV29ybGQnXSwwLHt9KSk=',
    'unicode-escape': '\\u0061\\u006c\\u0065\\u0072\\u0074\\u0028\\u0027\\u0048\\u0065\\u006c\\u006c\\u006f\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0027\\u0029',
    'url-encode': 'eval%28%27alert%28%22Hello%20World%22%29%27%29',
    'hex-escape': '\\x61\\x6c\\x65\\x72\\x74\\x28\\x27\\x48\\x65\\x6c\\x6c\\x6f\\x20\\x57\\x6f\\x72\\x6c\\x64\\x27\\x29',
    'html-entity': '&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#72;&#101;&#108;&#108;&#111;&#32;&#87;&#111;&#114;&#108;&#100;&#39;&#41;',
    'js-eval': "eval('alert(' + '\"Hello World\"' + ')')",
    'js-function-constructor': "new Function('alert(\"Hello World\")')()",
    'string-concat': "var s = 'Hel' + 'lo ' + 'Wor' + 'ld'; alert(s)",
    'array-index-obfuscation': 'var _0xabc=["alert","Hello World"];window[_0xabc[0]](_0xabc[1])',
    'variable-renaming': 'function a(b,c){var d=b+c;return d}alert(a(1,2))',
    'control-flow-flattening': 'var x=1;while(true){switch(x){case 1:alert("Hello");x=2;break;case 2:alert("World");x=3;break;case 3:break}}',
    'dead-code-injection': 'var a=1;if(false){var b=2;console.log(b)}var c=3;alert(c)',
    'jsfuck': '(!![]+[])[+!+[]]',
    'jjencode': 'var _=~[];___=++_;',
    'mixed': 'ZXZhbCgnXHUwMDYxXHUwMDZjXHUwMDY1XHUwMDcyXHUwMDc4KFwnSGVsJysnbG8gV29ybGQnXyknKQ=='
  }

  return samples[type] || ''
}
