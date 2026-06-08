import { Injectable } from '@nestjs/common';

export type ExcelVersion =
  | 'all'
  | '2010+'
  | '2016+'
  | '2019+'
  | '365+'
  | '2021+';

export const VERSION_INFO: Record<ExcelVersion, { label: string; tip: string; level: 'common' | 'low' | 'high' | 'newest' }> = {
  'all': { label: '所有版本', tip: 'Excel 2007 及以上版本均支持，兼容性最好', level: 'common' },
  '2010+': { label: 'Excel 2010+', tip: '需要 Excel 2010 及以上版本', level: 'low' },
  '2016+': { label: 'Excel 2016+', tip: '需要 Excel 2016 及以上版本', level: 'low' },
  '2019+': { label: 'Excel 2019+', tip: '需要 Excel 2019 及以上版本，旧版本需用替代方案', level: 'high' },
  '365+': { label: 'Excel 365/2021+', tip: '需要 Excel 365 订阅版或 Excel 2021 及以上，属于动态数组函数', level: 'newest' },
  '2021+': { label: 'Excel 2021+', tip: '需要 Excel 2021 及以上版本', level: 'newest' },
};

export interface FormulaExample {
  description: string;
  formula: string;
  result?: string;
  scenario: string;
}

export interface ExcelFormula {
  id: string;
  name: string;
  category: string;
  version: ExcelVersion;
  syntax: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
  examples: FormulaExample[];
  keywords: string[];
  relatedFormulas: string[];
  tips: string[];
  compatibility?: string;
}

export type FormulaCategory =
  | 'math'
  | 'text'
  | 'date'
  | 'logical'
  | 'lookup'
  | 'statistical'
  | 'financial';

export const CATEGORY_INFO: Record<FormulaCategory, { label: string; icon: string; description: string }> = {
  math: { label: '数学计算', icon: 'Calculator', description: '求和、平均值、四舍五入等数学运算' },
  text: { label: '文本处理', icon: 'EditPen', description: '字符串拼接、截取、替换、查找等' },
  date: { label: '日期时间', icon: 'Calendar', description: '日期计算、格式化、工作日计算等' },
  logical: { label: '逻辑判断', icon: 'CircleCheck', description: '条件判断、多条件分支、错误处理' },
  lookup: { label: '查找引用', icon: 'Search', description: 'VLOOKUP、INDEX/MATCH、跨表查询等' },
  statistical: { label: '统计分析', icon: 'DataLine', description: '计数、排名、百分位等统计函数' },
  financial: { label: '财务函数', icon: 'Money', description: '利率、折旧、投资回报等财务计算' },
};

const EXCEL_FORMULAS: ExcelFormula[] = [
  {
    id: 'sum',
    name: 'SUM',
    category: 'math',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'SUM(number1, [number2], ...)',
    description: '返回所有参数的和',
    arguments: [
      { name: 'number1', description: '要相加的第一个数字或单元格区域', required: true },
      { name: 'number2,...', description: '要相加的其他数字或单元格区域，最多255个', required: false },
    ],
    examples: [
      { description: '计算A1到A10的总和', formula: '=SUM(A1:A10)', scenario: '基础数据汇总' },
      { description: '计算多个区域的和', formula: '=SUM(A1:A10, C1:C10, E5)', scenario: '跨列汇总' },
      { description: '条件求和（配合IF）', formula: '=SUM(IF(A1:A10>100, A1:A10, 0))', scenario: '数组公式，按Ctrl+Shift+Enter', result: '大于100的数值之和' },
    ],
    keywords: ['求和', '合计', '总和', '加', 'sum', '汇总', '累加', '总计'],
    relatedFormulas: ['SUMIF', 'SUMIFS', 'SUMPRODUCT'],
    tips: ['文本格式的数字会被忽略，需先用VALUE转换', '空单元格会被忽略，不会当作0计算'],
  },
  {
    id: 'sumif',
    name: 'SUMIF',
    category: 'math',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'SUMIF(range, criteria, [sum_range])',
    description: '对满足条件的单元格求和',
    arguments: [
      { name: 'range', description: '用于条件判断的单元格区域', required: true },
      { name: 'criteria', description: '求和的条件，可以是数字、文本或表达式', required: true },
      { name: 'sum_range', description: '要求和的实际单元格区域，省略则使用range', required: false },
    ],
    examples: [
      { description: '销售额大于1000的订单合计', formula: '=SUMIF(B:B, ">1000", B:B)', scenario: '单条件汇总' },
      { description: '统计"华东"区域的销售总额', formula: '=SUMIF(A:A, "华东", B:B)', scenario: '文本条件匹配' },
      { description: '计算包含"产品"关键词的金额之和', formula: '=SUMIF(A:A, "*产品*", B:B)', scenario: '通配符模糊匹配' },
    ],
    keywords: ['条件求和', '按条件', '单条件', '筛选求和', '分类汇总', 'sumif'],
    relatedFormulas: ['SUMIFS', 'SUM', 'COUNTIF'],
    tips: ['criteria支持通配符*和?，*匹配任意多个字符，?匹配单个字符', '条件中的文本不区分大小写'],
  },
  {
    id: 'sumifs',
    name: 'SUMIFS',
    category: 'math',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    description: '对同时满足多个条件的单元格求和',
    arguments: [
      { name: 'sum_range', description: '要求和的单元格区域', required: true },
      { name: 'criteria_range1', description: '第一个条件判断的区域', required: true },
      { name: 'criteria1', description: '第一个条件', required: true },
      { name: 'criteria_range2, criteria2', description: '附加条件区域和条件，最多127对', required: false },
    ],
    examples: [
      { description: '华东区域且销售额>1000的订单合计', formula: '=SUMIFS(B:B, A:A, "华东", B:B, ">1000")', scenario: '多条件同时满足' },
      { description: '2024年1月的产品A销售额', formula: '=SUMIFS(C:C, A:A, "产品A", B:B, ">="&DATE(2024,1,1), B:B, "<="&DATE(2024,1,31))', scenario: '日期区间+文本条件' },
    ],
    keywords: ['多条件求和', '多个条件', '同时满足', '交叉汇总', 'sumifs', '复合条件'],
    relatedFormulas: ['SUMIF', 'COUNTIFS', 'SUMPRODUCT'],
    tips: ['条件数量最多支持127个', '所有criteria_range的大小和形状必须与sum_range一致'],
  },
  {
    id: 'average',
    name: 'AVERAGE',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'AVERAGE(number1, [number2], ...)',
    description: '返回参数的算术平均值',
    arguments: [
      { name: 'number1', description: '要计算平均值的第一个数字或单元格区域', required: true },
      { name: 'number2,...', description: '其他数字或单元格区域', required: false },
    ],
    examples: [
      { description: '计算A1到A20的平均分', formula: '=AVERAGE(A1:A20)', scenario: '班级成绩统计' },
      { description: '排除0值求平均', formula: '=AVERAGEIF(A1:A20, "<>0")', scenario: '跳过0值的平均' },
    ],
    keywords: ['平均值', '平均', '平均分', '算术平均', 'average'],
    relatedFormulas: ['AVERAGEIF', 'AVERAGEIFS', 'MEDIAN'],
    tips: ['空单元格和文本会被忽略，但0值会被计算在内', '要忽略0值请使用AVERAGEIF'],
  },
  {
    id: 'count',
    name: 'COUNT',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'COUNT(value1, [value2], ...)',
    description: '计算区域中包含数字的单元格个数',
    arguments: [
      { name: 'value1', description: '要计数的第一个区域或值', required: true },
      { name: 'value2,...', description: '其他区域或值', required: false },
    ],
    examples: [
      { description: '统计A列有多少个数字', formula: '=COUNT(A:A)', scenario: '数字单元格计数' },
      { description: '统计A1到A100的数值个数', formula: '=COUNT(A1:A100)', scenario: '有效数据行数' },
    ],
    keywords: ['计数', '统计个数', '行数', '数量', 'count'],
    relatedFormulas: ['COUNTA', 'COUNTIF', 'COUNTIFS'],
    tips: ['只统计数字，文本和空单元格不计入', '要统计非空单元格用COUNTA'],
  },
  {
    id: 'countif',
    name: 'COUNTIF',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'COUNTIF(range, criteria)',
    description: '计算区域中满足条件的单元格个数',
    arguments: [
      { name: 'range', description: '要计数的单元格区域', required: true },
      { name: 'criteria', description: '计数的条件', required: true },
    ],
    examples: [
      { description: '统计"优秀"出现的次数', formula: '=COUNTIF(B:B, "优秀")', scenario: '文本匹配计数' },
      { description: '统计分数大于90的人数', formula: '=COUNTIF(C:C, ">90")', scenario: '数值条件计数' },
      { description: '统计非空单元格数量', formula: '=COUNTIF(A:A, "<>")', scenario: '统计有内容的行' },
      { description: '统计以"张"开头的姓名', formula: '=COUNTIF(A:A, "张*")', scenario: '通配符前缀匹配' },
    ],
    keywords: ['条件计数', '按条件统计', '次数', 'countif', '满足条件的个数'],
    relatedFormulas: ['COUNTIFS', 'COUNT', 'SUMIF'],
    tips: ['支持通配符*和?', '条件不区分大小写'],
  },
  {
    id: 'countifs',
    name: 'COUNTIFS',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    description: '计算同时满足多个条件的单元格个数',
    arguments: [
      { name: 'criteria_range1', description: '第一个条件区域', required: true },
      { name: 'criteria1', description: '第一个条件', required: true },
      { name: 'criteria_range2, criteria2', description: '附加条件区域和条件，最多127对', required: false },
    ],
    examples: [
      { description: '华东区域销售额>1000的订单数', formula: '=COUNTIFS(A:A, "华东", B:B, ">1000")', scenario: '多条件计数' },
      { description: '部门为技术部且评分>85的人数', formula: '=COUNTIFS(B:B, "技术部", C:C, ">85")', scenario: '部门+绩效统计' },
    ],
    keywords: ['多条件计数', '多个条件统计', 'countifs', '交叉统计'],
    relatedFormulas: ['COUNTIF', 'SUMIFS', 'COUNT'],
    tips: ['最多支持127个条件对', '所有条件区域大小必须相同'],
  },
  {
    id: 'vlookup',
    name: 'VLOOKUP',
    category: 'lookup',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    description: '在表格首列查找指定值，返回对应行指定列的值',
    arguments: [
      { name: 'lookup_value', description: '要查找的值', required: true },
      { name: 'table_array', description: '查找范围，查找值必须在第一列', required: true },
      { name: 'col_index_num', description: '返回值所在的列号（从1开始）', required: true },
      { name: 'range_lookup', description: '匹配方式：TRUE=近似匹配，FALSE=精确匹配', required: false },
    ],
    examples: [
      { description: '根据学号查找学生姓名', formula: '=VLOOKUP(D2, A:B, 2, FALSE)', scenario: '精确匹配，推荐使用' },
      { description: '根据分数查找等级（近似匹配）', formula: '=VLOOKUP(C2, F:G, 2, TRUE)', scenario: '分段查找，查找列需升序排列' },
      { description: '找不到时显示空值', formula: '=IFERROR(VLOOKUP(D2, A:B, 2, FALSE), "")', scenario: '配合IFERROR优雅处理错误' },
    ],
    keywords: ['查找', '匹配', 'vlookup', '跨表', '根据...找', '查询', '引用'],
    relatedFormulas: ['XLOOKUP', 'INDEX+MATCH', 'HLOOKUP'],
    tips: ['精确匹配建议始终使用FALSE', '查找不到时返回#N/A，建议配合IFERROR使用', '查找值必须在查找范围的第一列，否则用INDEX+MATCH'],
  },
  {
    id: 'xlookup',
    name: 'XLOOKUP',
    category: 'lookup',
    version: '365+',
    compatibility: '需要 Excel 365 订阅版或 Excel 2021 及以上版本，旧版本不支持动态数组功能',
    syntax: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    description: '更强大的查找函数（Excel 365/2021+），支持任意列查找和反向查找',
    arguments: [
      { name: 'lookup_value', description: '要查找的值', required: true },
      { name: 'lookup_array', description: '查找的数组或区域', required: true },
      { name: 'return_array', description: '返回值的数组或区域', required: true },
      { name: 'if_not_found', description: '找不到时返回的值，默认#N/A', required: false },
      { name: 'match_mode', description: '0=精确匹配(默认)，1=近似匹配，-1=向下近似，2=通配符', required: false },
      { name: 'search_mode', description: '1=从前往后(默认)，-1=从后往前，2=升序二分，-2=降序二分', required: false },
    ],
    examples: [
      { description: '根据学号查找姓名（精确匹配）', formula: '=XLOOKUP(D2, A:A, B:B, "未找到")', scenario: '自带错误处理，更简洁' },
      { description: '反向查找：根据姓名查学号', formula: '=XLOOKUP(E2, B:B, A:A, "不存在")', scenario: '从右向左查找，无需重排列' },
      { description: '查找最后一次出现的记录', formula: '=XLOOKUP(D2, A:A, C:C, "", 0, -1)', scenario: '从后往前搜索' },
      { description: '返回整行数据', formula: '=XLOOKUP(D2, A:A, A:D)', scenario: '一次返回多列结果' },
    ],
    keywords: ['查找', 'xlookup', '新函数', '反向查找', '精确查找', '更强大的vlookup'],
    relatedFormulas: ['VLOOKUP', 'INDEX+MATCH', 'FILTER'],
    tips: ['仅支持 Excel 365 和 Excel 2021 及以上版本', '默认精确匹配，无需额外参数', '支持返回数组，可一次返回多个单元格'],
  },
  {
    id: 'index-match',
    name: 'INDEX+MATCH',
    category: 'lookup',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'INDEX(return_range, MATCH(lookup_value, lookup_range, match_type))',
    description: '经典组合，比VLOOKUP更灵活，支持任意列查找和反向查找',
    arguments: [
      { name: 'return_range', description: 'INDEX：要返回值的区域', required: true },
      { name: 'lookup_value', description: 'MATCH：要查找的值', required: true },
      { name: 'lookup_range', description: 'MATCH：查找的区域', required: true },
      { name: 'match_type', description: '0=精确匹配，1=小于等于，-1=大于等于', required: true },
    ],
    examples: [
      { description: '根据产品编码查找价格', formula: '=INDEX(C:C, MATCH(E2, A:A, 0))', scenario: '精确查找，查找列不在第一列也可以' },
      { description: '反向查找：根据姓名查工号', formula: '=INDEX(A:A, MATCH(F2, B:B, 0))', scenario: '从右向左查找' },
      { description: '双向查找（行+列）', formula: '=INDEX(B2:E10, MATCH(H2, A2:A10, 0), MATCH(H3, B1:E1, 0))', scenario: '二维表交叉查询，类似VLOOKUP+MATCH' },
    ],
    keywords: ['index match', '组合查找', '反向查找', '交叉查询', '二维查找', '比vlookup好'],
    relatedFormulas: ['VLOOKUP', 'XLOOKUP', 'OFFSET'],
    tips: ['MATCH的最后一个参数推荐使用0（精确匹配）', '比VLOOKUP更高效，因为只需加载查找列和结果列', '支持从右向左查找，无需调整列顺序'],
  },
  {
    id: 'if',
    name: 'IF',
    category: 'logical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'IF(logical_test, [value_if_true], [value_if_false])',
    description: '判断条件是否成立，成立返回一个值，否则返回另一个值',
    arguments: [
      { name: 'logical_test', description: '判断条件，结果为TRUE或FALSE', required: true },
      { name: 'value_if_true', description: '条件成立时返回的值', required: false },
      { name: 'value_if_false', description: '条件不成立时返回的值', required: false },
    ],
    examples: [
      { description: '分数>=60及格，否则不及格', formula: '=IF(C2>=60, "及格", "不及格")', scenario: '基础条件判断' },
      { description: '多层嵌套：分数>=90优秀，>=80良好，>=60及格，否则不及格', formula: '=IF(C2>=90, "优秀", IF(C2>=80, "良好", IF(C2>=60, "及格", "不及格")))', scenario: '多分支分级（嵌套IF）' },
      { description: '多条件同时满足', formula: '=IF(AND(A2="是", B2>=1000), "达标", "未达标")', scenario: 'AND组合多条件' },
    ],
    keywords: ['如果', '判断', '条件', 'if', '逻辑', '分级', '是否'],
    relatedFormulas: ['IFS', 'IFERROR', 'AND', 'OR'],
    tips: ['嵌套IF不要超过7层，复杂场景建议用IFS或VLOOKUP', '建议总是提供value_if_false，否则返回FALSE'],
  },
  {
    id: 'ifs',
    name: 'IFS',
    category: 'logical',
    version: '2019+',
    compatibility: '需要 Excel 2019 及以上版本，旧版本请用替代方案（参考 tips）',
    syntax: 'IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)',
    description: '多条件判断，按顺序检查条件，返回第一个成立条件对应的值（Excel 2019+）',
    arguments: [
      { name: 'logical_test1', description: '第一个条件', required: true },
      { name: 'value_if_true1', description: '条件1成立时返回的值', required: true },
      { name: 'logical_test2, value_if_true2', description: '后续条件和对应返回值，最多127对', required: false },
    ],
    examples: [
      { description: '成绩等级判定', formula: '=IFS(C2>=90, "优秀", C2>=80, "良好", C2>=60, "及格", TRUE, "不及格")', scenario: '替代嵌套IF，更易读' },
      { description: '客户等级：年消费>=50000钻石，>=20000白金，>=10000金卡，其他普通', formula: '=IFS(B2>=50000, "钻石", B2>=20000, "白金", B2>=10000, "金卡", TRUE, "普通")', scenario: '分段条件判定' },
    ],
    keywords: ['多条件', 'ifs', '多分支', '多个如果', '不嵌套'],
    relatedFormulas: ['IF', 'SWITCH', 'IFERROR'],
    tips: ['条件是按顺序判断的，第一个满足的条件生效', '最后用TRUE作为默认值类似ELSE', '仅Excel 2019及以上版本支持'],
  },
  {
    id: 'iferror',
    name: 'IFERROR',
    category: 'logical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'IFERROR(value, value_if_error)',
    description: '如果公式计算结果错误则返回指定值，否则返回公式结果',
    arguments: [
      { name: 'value', description: '要检查错误的公式或值', required: true },
      { name: 'value_if_error', description: '公式出错时返回的值', required: true },
    ],
    examples: [
      { description: 'VLOOKUP找不到时显示"无数据"', formula: '=IFERROR(VLOOKUP(D2, A:B, 2, FALSE), "无数据")', scenario: '查找错误处理' },
      { description: '除以0时显示空值', formula: '=IFERROR(A2/B2, "")', scenario: '避免#DIV/0!错误' },
      { description: '日期转换错误时显示提示', formula: '=IFERROR(DATEVALUE(A2), "日期格式错误")', scenario: '数据格式异常处理' },
    ],
    keywords: ['错误处理', '防错', 'iferror', '避免#N/A', '隐藏错误', '出错显示'],
    relatedFormulas: ['IFNA', 'IF', 'ISERROR'],
    tips: ['可以捕获所有错误类型：#N/A、#VALUE!、#REF!、#DIV/0!、#NUM!、#NAME?、#NULL!', '如果只想处理#N/A错误，使用IFNA更精准'],
  },
  {
    id: 'and-or',
    name: 'AND/OR',
    category: 'logical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'AND(logical1, [logical2], ...) 或 OR(logical1, [logical2], ...)',
    description: 'AND：所有条件都成立返回TRUE；OR：任一条件成立返回TRUE',
    arguments: [
      { name: 'logical1', description: '第一个条件', required: true },
      { name: 'logical2,...', description: '其他条件，最多255个', required: false },
    ],
    examples: [
      { description: '年龄在18到60岁之间', formula: '=AND(A2>=18, A2<=60)', scenario: '区间判断' },
      { description: '部门是技术部或产品部', formula: '=OR(B2="技术部", B2="产品部")', scenario: '多选一判断' },
      { description: '综合判断：本科以上且工作3年以上，或者有相关证书', formula: '=IF(OR(AND(C2="本科", D2>=3), E2="是"), "符合", "不符合")', scenario: 'AND+OR+IF组合' },
    ],
    keywords: ['并且', '或者', 'and', 'or', '同时满足', '任一满足', '多条件逻辑'],
    relatedFormulas: ['IF', 'IFS', 'NOT'],
    tips: ['AND中所有条件都为TRUE时才返回TRUE', 'OR中只要有一个条件为TRUE就返回TRUE', '常与IF组合使用'],
  },
  {
    id: 'left-right-mid',
    name: 'LEFT/RIGHT/MID',
    category: 'text',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'LEFT(text, [num_chars]) / RIGHT(text, [num_chars]) / MID(text, start_num, num_chars)',
    description: '从文本左侧/右侧/中间提取指定长度的字符',
    arguments: [
      { name: 'text', description: '要提取的文本', required: true },
      { name: 'num_chars', description: 'LEFT/RIGHT：提取的字符数，默认1', required: false },
      { name: 'start_num', description: 'MID：起始位置（从1开始）', required: true },
    ],
    examples: [
      { description: '提取手机号前3位（运营商号段）', formula: '=LEFT(A2, 3)', scenario: '前缀提取' },
      { description: '提取身份证后4位', formula: '=RIGHT(A2, 4)', scenario: '后缀提取' },
      { description: '从身份证第7位开始提取8位出生日期', formula: '=MID(A2, 7, 8)', scenario: '中间截取' },
      { description: '提取姓名（去除前缀"姓名："）', formula: '=MID(A2, FIND("：", A2)+1, 99)', scenario: '配合FIND动态定位' },
    ],
    keywords: ['截取', '提取', 'left', 'right', 'mid', '子串', '取前几位', '取后几位', '字符串'],
    relatedFormulas: ['LEN', 'FIND', 'SUBSTITUTE', 'TEXTJOIN'],
    tips: ['中文和英文都按1个字符计算', 'MID的start_num从1开始，不是0'],
  },
  {
    id: 'len',
    name: 'LEN',
    category: 'text',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'LEN(text)',
    description: '返回文本字符串中的字符个数',
    arguments: [
      { name: 'text', description: '要计算长度的文本', required: true },
    ],
    examples: [
      { description: '验证手机号是否为11位', formula: '=IF(LEN(A2)=11, "正确", "错误")', scenario: '数据格式校验' },
      { description: '提取除最后1位外的所有字符', formula: '=LEFT(A2, LEN(A2)-1)', scenario: '动态截取' },
    ],
    keywords: ['长度', '字符数', '字数', 'len', '多少位', '位数'],
    relatedFormulas: ['LEFT', 'RIGHT', 'MID', 'FIND'],
    tips: ['空格也会计入字符数，可用TRIM去除首尾空格', '中文字符按1个字符计算'],
  },
  {
    id: 'find-search',
    name: 'FIND/SEARCH',
    category: 'text',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'FIND(find_text, within_text, [start_num]) / SEARCH(find_text, within_text, [start_num])',
    description: '查找文本在另一个文本中的起始位置。FIND区分大小写，SEARCH不区分且支持通配符',
    arguments: [
      { name: 'find_text', description: '要查找的文本', required: true },
      { name: 'within_text', description: '在哪段文本中查找', required: true },
      { name: 'start_num', description: '从第几个字符开始查找，默认1', required: false },
    ],
    examples: [
      { description: '查找@在邮箱中的位置', formula: '=FIND("@", A2)', scenario: '精确位置定位' },
      { description: '提取邮箱用户名（@之前的部分）', formula: '=LEFT(A2, FIND("@", A2)-1)', scenario: '配合LEFT截取' },
      { description: '判断文本是否包含"产品"（不区分大小写）', formula: '=ISNUMBER(SEARCH("产品", A2))', scenario: '包含判断，返回TRUE/FALSE' },
    ],
    keywords: ['查找位置', '包含', 'find', 'search', '定位', '是否含有', '第几个字符'],
    relatedFormulas: ['LEFT', 'RIGHT', 'MID', 'SUBSTITUTE', 'ISNUMBER'],
    tips: ['找不到时返回#VALUE!，建议配合ISNUMBER+IFERROR使用', 'SEARCH支持通配符*和?，FIND不支持', 'SEARCH不区分大小写，FIND区分'],
  },
  {
    id: 'substitute',
    name: 'SUBSTITUTE',
    category: 'text',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'SUBSTITUTE(text, old_text, new_text, [instance_num])',
    description: '将文本中的指定字符串替换为新字符串',
    arguments: [
      { name: 'text', description: '要进行替换的文本', required: true },
      { name: 'old_text', description: '要被替换的旧文本', required: true },
      { name: 'new_text', description: '替换后的新文本', required: true },
      { name: 'instance_num', description: '替换第几次出现的，省略则替换所有', required: false },
    ],
    examples: [
      { description: '将手机号中的-删除', formula: '=SUBSTITUTE(A2, "-", "")', scenario: '清洗特殊字符' },
      { description: '将空格替换为逗号', formula: '=SUBSTITUTE(A2, " ", ",")', scenario: '格式转换' },
      { description: '只替换第一个出现的"产品"', formula: '=SUBSTITUTE(A2, "产品", "商品", 1)', scenario: '指定替换次数' },
      { description: '去除文本中的所有空格', formula: '=SUBSTITUTE(A2, " ", "")', scenario: '空格清理（包含中间空格）' },
    ],
    keywords: ['替换', 'substitute', '清洗', '删除字符', '去掉', 'replace', '字符替换'],
    relatedFormulas: ['REPLACE', 'TRIM', 'CLEAN', 'TEXTJOIN'],
    tips: ['区分大小写', '要去除首尾空格用TRIM，去除中间空格用SUBSTITUTE'],
  },
  {
    id: 'trim',
    name: 'TRIM',
    category: 'text',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'TRIM(text)',
    description: '去除文本首尾的空格，并将文本中间的多个连续空格合并为一个',
    arguments: [
      { name: 'text', description: '要清理空格的文本', required: true },
    ],
    examples: [
      { description: '清理用户输入的姓名空格', formula: '=TRIM(A2)', scenario: '数据清洗，去除首尾空格' },
      { description: '先清理空格再查找', formula: '=VLOOKUP(TRIM(D2), A:B, 2, FALSE)', scenario: '避免因空格导致VLOOKUP匹配失败' },
    ],
    keywords: ['去空格', 'trim', '清洗', '清理空格', '首尾空格', '空白字符'],
    relatedFormulas: ['SUBSTITUTE', 'CLEAN', 'VALUE'],
    tips: ['TRIM只处理ASCII空格(字符码32)，如果是其他空白字符用CLEAN或SUBSTITUTE', '不会删除中间的单个空格，只会合并多个连续空格'],
  },
  {
    id: 'textjoin-concat',
    name: 'TEXTJOIN/CONCAT',
    category: 'text',
    version: '2019+',
    compatibility: '需要 Excel 2019 及以上版本，旧版本请用替代方案（参考 tips）',
    syntax: 'TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...) / CONCAT(text1, [text2], ...)',
    description: '连接多个文本字符串。TEXTJOIN支持指定分隔符和忽略空值（Excel 2019+）',
    arguments: [
      { name: 'delimiter', description: 'TEXTJOIN：连接文本之间的分隔符', required: true },
      { name: 'ignore_empty', description: 'TEXTJOIN：是否忽略空单元格，TRUE/FALSE', required: true },
      { name: 'text1, text2,...', description: '要连接的文本，最多252个参数', required: true },
    ],
    examples: [
      { description: '用逗号连接A1到A10的姓名', formula: '=TEXTJOIN(",", TRUE, A1:A10)', scenario: '批量合并，自动跳过空值' },
      { description: '拼接省市区地址', formula: '=TEXTJOIN("", TRUE, A2, B2, C2)', scenario: '多字段组合' },
      { description: 'CONCAT简单拼接', formula: '=CONCAT(A2, "-", B2)', scenario: '类似&A2&"-"&B2' },
    ],
    keywords: ['拼接', '合并', '连接', 'textjoin', 'concat', '合并单元格内容', '组合'],
    relatedFormulas: ['LEFT', 'RIGHT', 'MID', 'SUBSTITUTE'],
    tips: ['TEXTJOIN仅Excel 2019及以上版本支持', '旧版本可用&运算符：=A1&","&B1&","&C1'],
  },
  {
    id: 'today-now',
    name: 'TODAY/NOW',
    category: 'date',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'TODAY() 或 NOW()',
    description: 'TODAY返回当前日期，NOW返回当前日期和时间',
    arguments: [],
    examples: [
      { description: '显示今天的日期', formula: '=TODAY()', scenario: '动态显示当前日期' },
      { description: '计算年龄（假设A2是出生日期）', formula: '=DATEDIF(A2, TODAY(), "Y")', scenario: '配合DATEDIF计算周岁' },
      { description: '计算还剩多少天到期（A2为截止日期）', formula: '=A2-TODAY()', scenario: '倒计时计算' },
    ],
    keywords: ['今天', '现在', '当前日期', 'today', 'now', '系统日期'],
    relatedFormulas: ['DATE', 'DATEDIF', 'YEAR', 'MONTH', 'DAY'],
    tips: ['日期是动态的，每次打开文件或按F9都会刷新', '日期存储为序列号，1代表1900年1月1日'],
  },
  {
    id: 'datedif',
    name: 'DATEDIF',
    category: 'date',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'DATEDIF(start_date, end_date, unit)',
    description: '计算两个日期之间的间隔（年/月/日），隐藏函数但兼容性极好',
    arguments: [
      { name: 'start_date', description: '开始日期', required: true },
      { name: 'end_date', description: '结束日期', required: true },
      { name: 'unit', description: '"Y"=整年，"M"=整月，"D"=天数，"MD"=忽略年月的日差，"YM"=忽略日年的月差，"YD"=忽略年的日差', required: true },
    ],
    examples: [
      { description: '计算周岁年龄', formula: '=DATEDIF(A2, TODAY(), "Y")', scenario: '年龄计算' },
      { description: '计算两个日期相差多少个月', formula: '=DATEDIF(A2, B2, "M")', scenario: '工龄、合同期' },
      { description: '计算相差多少天', formula: '=DATEDIF(A2, B2, "D")', scenario: '项目工期' },
      { description: '格式化显示年龄：X岁X月X天', formula: '=DATEDIF(A2,TODAY(),"Y")&"岁"&DATEDIF(A2,TODAY(),"YM")&"月"&DATEDIF(A2,TODAY(),"MD")&"天"', scenario: '详细时间跨度' },
    ],
    keywords: ['日期差', '间隔', 'datedif', '年龄', '相差多少天', '工龄', '周数'],
    relatedFormulas: ['TODAY', 'YEAR', 'MONTH', 'DAY', 'EOMONTH'],
    tips: ['DATEDIF是隐藏函数，不会出现在公式提示中，但可以直接输入使用', 'unit参数必须加引号'],
  },
  {
    id: 'year-month-day',
    name: 'YEAR/MONTH/DAY',
    category: 'date',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'YEAR(date) / MONTH(date) / DAY(date)',
    description: '从日期中提取年、月、日',
    arguments: [
      { name: 'date', description: '要提取的日期', required: true },
    ],
    examples: [
      { description: '提取出生日期的年份', formula: '=YEAR(A2)', scenario: '获取年份' },
      { description: '按月份分组统计', formula: '=MONTH(A2)', scenario: '数据按月汇总' },
      { description: '生成YYYY-MM格式', formula: '=TEXT(A2, "YYYY-MM")', scenario: '年月格式化显示' },
      { description: '判断是否是当月生日', formula: '=AND(MONTH(A2)=MONTH(TODAY()), DAY(A2)=DAY(TODAY()))', scenario: '生日提醒' },
    ],
    keywords: ['提取年份', '提取月份', '提取日期', 'year', 'month', 'day', '年月日'],
    relatedFormulas: ['DATE', 'DATEDIF', 'TODAY', 'TEXT'],
    tips: ['返回值为数字，YEAR返回4位数年份如2024'],
  },
  {
    id: 'eomonth',
    name: 'EOMONTH',
    category: 'date',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'EOMONTH(start_date, months)',
    description: '返回指定日期往前/往后N个月的月份最后一天日期',
    arguments: [
      { name: 'start_date', description: '起始日期', required: true },
      { name: 'months', description: '月数偏移量，0=当月，1=下月，-1=上月', required: true },
    ],
    examples: [
      { description: '本月最后一天', formula: '=EOMONTH(TODAY(), 0)', scenario: '月末结算' },
      { description: '本月第一天', formula: '=EOMONTH(TODAY(), -1)+1', scenario: '月初起始' },
      { description: '计算本月有多少天', formula: '=DAY(EOMONTH(TODAY(), 0))', scenario: '当月天数' },
      { description: '季度末最后一天（Q3结束）', formula: '=EOMONTH(DATE(2024,1,1), 8)', scenario: '9月底' },
    ],
    keywords: ['月末', '月初', '最后一天', 'eomonth', '月底', '月第一天', '当月天数'],
    relatedFormulas: ['DATE', 'DAY', 'WORKDAY', 'NETWORKDAYS'],
    tips: ['返回的是日期序列号，需要设置单元格格式为日期才能正常显示'],
  },
  {
    id: 'workday-networkdays',
    name: 'WORKDAY/NETWORKDAYS',
    category: 'date',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'WORKDAY(start_date, days, [holidays]) / NETWORKDAYS(start_date, end_date, [holidays])',
    description: 'WORKDAY：计算N个工作日后的日期；NETWORKDAYS：计算两个日期间的工作日天数',
    arguments: [
      { name: 'start_date', description: '起始日期', required: true },
      { name: 'days', description: 'WORKDAY：工作日天数（不含周末和节假日）', required: true },
      { name: 'end_date', description: 'NETWORKDAYS：结束日期', required: true },
      { name: 'holidays', description: '自定义节假日区域（可选）', required: false },
    ],
    examples: [
      { description: '从今天开始15个工作日后的日期', formula: '=WORKDAY(TODAY(), 15)', scenario: '项目交付日期估算' },
      { description: '排除自定义节假日计算工作日', formula: '=WORKDAY(A2, 10, $F$2:$F$20)', scenario: '考虑法定假日' },
      { description: '计算项目实际工作日天数', formula: '=NETWORKDAYS(A2, B2)', scenario: '工期统计' },
      { description: '考虑节假日的工作日统计', formula: '=NETWORKDAYS(A2, B2, $F$2:$F$20)', scenario: '精确工期计算' },
    ],
    keywords: ['工作日', '排除周末', 'workday', 'networkdays', '上班天数', '交付日期', '节假日'],
    relatedFormulas: ['TODAY', 'DATEDIF', 'EOMONTH'],
    tips: ['自动排除周六周日', 'holidays参数需要是包含节假日日期的单元格区域'],
  },
  {
    id: 'round',
    name: 'ROUND/ROUNDUP/ROUNDDOWN',
    category: 'math',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'ROUND(number, num_digits) / ROUNDUP(number, num_digits) / ROUNDDOWN(number, num_digits)',
    description: '按指定位数四舍五入/向上取整/向下取整',
    arguments: [
      { name: 'number', description: '要取整的数字', required: true },
      { name: 'num_digits', description: '保留的小数位数，0=整数，负数=向整数位取整', required: true },
    ],
    examples: [
      { description: '保留2位小数（四舍五入）', formula: '=ROUND(A2, 2)', scenario: '金额显示' },
      { description: '向上取整到整数', formula: '=ROUNDUP(A2, 0)', scenario: '材料采购：不足1件按1件算' },
      { description: '向下取整到整数', formula: '=ROUNDDOWN(A2, 0)', scenario: '折扣抹零' },
      { description: '取整到十位（如1234→1230）', formula: '=ROUNDDOWN(A2, -1)', scenario: '十位数取整' },
    ],
    keywords: ['四舍五入', '取整', 'round', 'roundup', 'rounddown', '向上取整', '向下取整', '保留小数'],
    relatedFormulas: ['INT', 'MROUND', 'CEILING', 'FLOOR'],
    tips: ['num_digits为正表示保留小数位，为负表示对整数位取整（如-1=十位，-2=百位）', 'INT和ROUNDDOWN的区别在负数时体现：INT(-2.5)=-3，ROUNDDOWN(-2.5,0)=-2'],
  },
  {
    id: 'max-min',
    name: 'MAX/MIN',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'MAX(number1, [number2], ...) / MIN(number1, [number2], ...)',
    description: '返回一组数值中的最大值/最小值',
    arguments: [
      { name: 'number1', description: '第一个数字或区域', required: true },
      { name: 'number2,...', description: '其他数字或区域', required: false },
    ],
    examples: [
      { description: '找出销售最高值', formula: '=MAX(B:B)', scenario: '最大值查找' },
      { description: '找出销售最低值', formula: '=MIN(B:B)', scenario: '最小值查找' },
      { description: '限制最低值不低于0', formula: '=MAX(B2, 0)', scenario: '防止负数显示' },
    ],
    keywords: ['最大值', '最小值', 'max', 'min', '最高', '最低', '最大', '最小'],
    relatedFormulas: ['LARGE', 'SMALL', 'MAXIFS', 'MINIFS'],
    tips: ['忽略文本和空单元格', '如果区域全是非数字，返回0'],
  },
  {
    id: 'rank',
    name: 'RANK',
    category: 'statistical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'RANK(number, ref, [order])',
    description: '返回一个数字在数字列表中的排名',
    arguments: [
      { name: 'number', description: '要排名的数字', required: true },
      { name: 'ref', description: '数字列表区域', required: true },
      { name: 'order', description: '0=降序(默认，大数在前)，非0=升序(小数在前)', required: false },
    ],
    examples: [
      { description: '按成绩排名（分数高的排前面）', formula: '=RANK(C2, C$2:C$100, 0)', scenario: '班级排名' },
      { description: '不跳过并列名次排名', formula: '=RANK(C2, C$2:C$100)+COUNTIF(C$2:C2, C2)-1', scenario: '中国式排名（并列不占名额）' },
    ],
    keywords: ['排名', '名次', 'rank', '排序', '第几名', '排行榜'],
    relatedFormulas: ['LARGE', 'SMALL', 'PERCENTRANK'],
    tips: ['相同数字排名相同，会跳过后续名次（如两个第2名，下一个是第4名）', '排名区域要用绝对引用$，避免下拉时偏移'],
  },
  {
    id: 'sumproduct',
    name: 'SUMPRODUCT',
    category: 'math',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'SUMPRODUCT(array1, [array2], [array3], ...)',
    description: '将多个数组对应元素相乘后求和，强大的多条件计算工具',
    arguments: [
      { name: 'array1', description: '第一个数组或区域', required: true },
      { name: 'array2, array3,...', description: '其他数组，维度必须相同', required: false },
    ],
    examples: [
      { description: '计算总金额（单价×数量直接求和）', formula: '=SUMPRODUCT(B2:B10, C2:C10)', scenario: '对应相乘后相加' },
      { description: '多条件计数（替代COUNTIFS）', formula: '=SUMPRODUCT((A2:A100="华东")*(B2:B100>1000))', scenario: '数组多条件计数' },
      { description: '多条件求和（替代SUMIFS）', formula: '=SUMPRODUCT((A2:A100="华东")*(B2:B100>1000)*C2:C100)', scenario: '数组多条件求和' },
    ],
    keywords: ['sumproduct', '乘积和', '数组求和', '数组条件', '高级条件汇总', '多条件计算'],
    relatedFormulas: ['SUMIFS', 'COUNTIFS', 'SUM'],
    tips: ['SUMPRODUCT在旧版本Excel中比SUMIFS更灵活，支持数组运算', '条件表达式会自动将TRUE/FALSE转为1/0', '所有数组区域的行数和列数必须相同'],
  },
  {
    id: 'filter',
    name: 'FILTER',
    category: 'lookup',
    version: '365+',
    compatibility: '需要 Excel 365 订阅版或 Excel 2021 及以上版本，旧版本不支持动态数组功能',
    syntax: 'FILTER(array, include, [if_empty])',
    description: '根据条件筛选区域，返回符合条件的所有行（Excel 365/2021+，动态数组）',
    arguments: [
      { name: 'array', description: '要筛选的区域或数组', required: true },
      { name: 'include', description: '筛选条件，返回TRUE/FALSE的数组', required: true },
      { name: 'if_empty', description: '无匹配结果时返回的值', required: false },
    ],
    examples: [
      { description: '筛选出所有华东区域的记录', formula: '=FILTER(A:D, A:A="华东", "无数据")', scenario: '单条件筛选，返回整行' },
      { description: '多条件筛选：华东且销售额>1000', formula: '=FILTER(A:D, (A:A="华东")*(B:B>1000), "无匹配")', scenario: '多条件同时满足' },
      { description: '筛选后指定返回列', formula: '=FILTER(B:B, A:A="华东")', scenario: '只返回销售额列' },
    ],
    keywords: ['筛选', '过滤', 'filter', '动态数组', '提取符合条件的行', '数据筛选'],
    relatedFormulas: ['XLOOKUP', 'INDEX+MATCH', 'SORT', 'UNIQUE'],
    tips: ['仅Excel 365和Excel 2021及以上版本支持', '属于动态数组函数，结果会自动溢出到相邻单元格', '支持返回多行多列'],
  },
  {
    id: 'unique',
    name: 'UNIQUE',
    category: 'lookup',
    version: '365+',
    compatibility: '需要 Excel 365 订阅版或 Excel 2021 及以上版本，旧版本不支持动态数组功能',
    syntax: 'UNIQUE(array, [by_col], [exactly_once])',
    description: '返回区域中的唯一值列表（Excel 365/2021+，动态数组）',
    arguments: [
      { name: 'array', description: '要去重的区域或数组', required: true },
      { name: 'by_col', description: 'FALSE=按行去重(默认)，TRUE=按列去重', required: false },
      { name: 'exactly_once', description: 'TRUE=只返回出现一次的值，FALSE=返回所有不重复值(默认)', required: false },
    ],
    examples: [
      { description: '提取A列所有不重复的部门名称', formula: '=UNIQUE(A:A)', scenario: '去重提取唯一值' },
      { description: '找出只出现过一次的客户', formula: '=UNIQUE(A:A, FALSE, TRUE)', scenario: '排查唯一记录' },
      { description: '多列联合去重', formula: '=UNIQUE(A:B)', scenario: 'A列和B列组合的唯一行' },
    ],
    keywords: ['去重', '唯一值', 'unique', '不重复', '提取不重复', '去重复'],
    relatedFormulas: ['FILTER', 'SORT', 'COUNTIF'],
    tips: ['仅Excel 365和Excel 2021及以上版本支持', '旧版本可用数据透视表或高级筛选实现去重'],
  },
  {
    id: 'pmt',
    name: 'PMT',
    category: 'financial',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'PMT(rate, nper, pv, [fv], [type])',
    description: '计算贷款的每期还款额（等额本息）',
    arguments: [
      { name: 'rate', description: '每期利率，注意：年利率除以12得月利率', required: true },
      { name: 'nper', description: '还款总期数', required: true },
      { name: 'pv', description: '贷款本金（现值），一般为负数', required: true },
      { name: 'fv', description: '未来值，默认0', required: false },
      { name: 'type', description: '0=期末还款(默认)，1=期初还款', required: false },
    ],
    examples: [
      { description: '贷款100万，年利率4.5%，30年，计算月还款额', formula: '=PMT(4.5%/12, 360, -1000000)', scenario: '房贷月供计算' },
      { description: '贷款50万，年利率5%，5年（60期），月供', formula: '=PMT(5%/12, 60, -500000)', scenario: '车贷/消费贷月供' },
    ],
    keywords: ['月供', '还款额', 'pmt', '贷款计算', '等额本息', '每月还款'],
    relatedFormulas: ['IPMT', 'PPMT', 'PV', 'RATE', 'NPER'],
    tips: ['rate和nper单位要一致，都按月或都按年', 'pv为负表示借入（现金流出），这样计算出的还款额为正'],
  },
  {
    id: 'offset',
    name: 'OFFSET',
    category: 'lookup',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'OFFSET(reference, rows, cols, [height], [width])',
    description: '以指定引用为基点，偏移指定行数和列数，返回新的引用区域',
    arguments: [
      { name: 'reference', description: '基准单元格或区域', required: true },
      { name: 'rows', description: '向下偏移的行数（负数向上）', required: true },
      { name: 'cols', description: '向右偏移的列数（负数向左）', required: true },
      { name: 'height', description: '返回区域的行数', required: false },
      { name: 'width', description: '返回区域的列数', required: false },
    ],
    examples: [
      { description: 'A1向下移动2行，向右移动1列', formula: '=OFFSET(A1, 2, 1)', scenario: '动态引用B3单元格' },
      { description: '动态汇总最近7天数据', formula: '=SUM(OFFSET(A1, COUNTA(A:A)-7, 0, 7, 1))', scenario: '滚动汇总最新N条数据' },
      { description: '创建动态下拉列表区域', formula: '=OFFSET($A$1, 1, 0, COUNTA($A:$A)-1, 1)', scenario: '数据验证中的动态数据源' },
    ],
    keywords: ['偏移', 'offset', '动态引用', '动态区域', '间接引用', '滚动汇总'],
    relatedFormulas: ['INDEX', 'INDIRECT', 'MATCH'],
    tips: ['OFFSET是易失性函数，每次编辑单元格都会重新计算，数据量大时可能影响性能', '动态引用场景优先考虑INDEX，性能更好'],
  },
  {
    id: 'indirect',
    name: 'INDIRECT',
    category: 'lookup',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'INDIRECT(ref_text, [a1])',
    description: '将文本字符串转换为实际的单元格引用，常用于跨表动态引用',
    arguments: [
      { name: 'ref_text', description: '表示单元格引用的文本', required: true },
      { name: 'a1', description: 'TRUE=A1样式(默认)，FALSE=R1C1样式', required: false },
    ],
    examples: [
      { description: '根据单元格内容动态引用', formula: '=INDIRECT(A2&"!B2")', scenario: 'A2中输入"Sheet2"，则引用Sheet2!B2' },
      { description: '跨工作表汇总：多表相同单元格求和', formula: '=SUM(INDIRECT("Sheet"&ROW(1:3)&"!A1"))', scenario: '汇总Sheet1到Sheet3的A1单元格' },
      { description: '引用列号字母拼接', formula: '=INDIRECT("B"&C2)', scenario: '根据C2的行号引用B列对应行' },
    ],
    keywords: ['跨表引用', 'indirect', '动态拼接', '文本转引用', '多表汇总', '间接引用'],
    relatedFormulas: ['OFFSET', 'INDEX', 'ADDRESS'],
    tips: ['工作表名包含空格或特殊字符时，需要加单引号：=INDIRECT("\'"&A2&"\'!B2")', 'INDIRECT也是易失性函数，注意性能影响'],
  },
  {
    id: 'conditional-formatting',
    name: '条件格式常用公式',
    category: 'logical',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: '在条件格式→使用公式确定要设置格式的单元格中输入',
    description: '用于条件格式的常用公式模式，让单元格满足条件时自动变色',
    arguments: [],
    examples: [
      { description: '标记重复值', formula: '=COUNTIF($A:$A, $A1)>1', scenario: '选中A列，A列重复值高亮' },
      { description: '标记大于平均值的单元格', formula: '=A1>AVERAGE($A:$A)', scenario: '高于平均值高亮显示' },
      { description: '标记周末日期', formula: '=WEEKDAY(A1, 2)>5', scenario: '周六周日自动标红' },
      { description: '到期前7天提醒', formula: '=AND(A1-TODAY()<=7, A1-TODAY()>0)', scenario: '合同到期/生日提醒' },
    ],
    keywords: ['条件格式', '高亮', '标色', '重复值', '自动变色', '提醒', '周末', '到期'],
    relatedFormulas: ['IF', 'AND', 'COUNTIF', 'WEEKDAY'],
    tips: ['公式中的单元格引用要注意锁定（$符号），通常列锁行不锁', '公式结果要返回TRUE或FALSE'],
  },
  {
    id: 'choose',
    name: 'CHOOSE',
    category: 'lookup',
    version: 'all',
    compatibility: '所有版本通用，兼容性最好',
    syntax: 'CHOOSE(index_num, value1, [value2], ...)',
    description: '根据索引号从参数列表中选择一个值返回',
    arguments: [
      { name: 'index_num', description: '索引数字，1到254之间', required: true },
      { name: 'value1, value2,...', description: '候选值列表，最多254个', required: true },
    ],
    examples: [
      { description: '根据数字返回对应等级', formula: '=CHOOSE(A1, "一级", "二级", "三级", "四级")', scenario: '简单数字映射' },
      { description: '根据月份返回季度', formula: '=CHOOSE(MONTH(A1), 1,1,1, 2,2,2, 3,3,3, 4,4,4)', scenario: '月份转季度' },
      { description: '周几转中文星期', formula: '=CHOOSE(WEEKDAY(A1,2), "星期一","星期二","星期三","星期四","星期五","星期六","星期日")', scenario: '日期转星期文字' },
    ],
    keywords: ['choose', '映射', '枚举', '转换', '对应关系', '数字转文本'],
    relatedFormulas: ['IF', 'IFS', 'VLOOKUP', 'SWITCH'],
    tips: ['index_num必须是1到254之间的整数', '候选值较少时比VLOOKUP更简洁，值多时建议用VLOOKUP+对照表'],
  },
];

@Injectable()
export class ExcelFormulaService {
  getAllCategories() {
    return Object.entries(CATEGORY_INFO).map(([key, info]) => ({
      id: key,
      ...info,
      count: EXCEL_FORMULAS.filter(f => f.category === key).length,
    }));
  }

  getAllFormulas(): ExcelFormula[] {
    return EXCEL_FORMULAS;
  }

  getFormulasByCategory(category: FormulaCategory): ExcelFormula[] {
    return EXCEL_FORMULAS.filter(f => f.category === category);
  }

  getFormulaById(id: string): ExcelFormula | undefined {
    return EXCEL_FORMULAS.find(f => f.id === id);
  }

  searchFormulas(query: string): ExcelFormula[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return EXCEL_FORMULAS;

    const scored = EXCEL_FORMULAS.map(formula => ({
      formula,
      score: this.calculateRelevance(formula, trimmed),
    })).filter(item => item.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.formula);
  }

  private calculateRelevance(formula: ExcelFormula, query: string): number {
    let score = 0;
    const q = query.toLowerCase();

    if (formula.name.toLowerCase() === q) score += 100;
    if (formula.name.toLowerCase().includes(q)) score += 60;
    if (formula.id.toLowerCase() === q) score += 80;

    for (const keyword of formula.keywords) {
      const kw = keyword.toLowerCase();
      if (kw === q) score += 50;
      else if (kw.includes(q)) score += 25;
      else if (q.includes(kw)) score += 20;
    }

    if (formula.description.toLowerCase().includes(q)) score += 10;

    for (const example of formula.examples) {
      if (example.description.toLowerCase().includes(q)) score += 15;
      if (example.scenario.toLowerCase().includes(q)) score += 20;
      if (example.formula.toLowerCase().includes(q)) score += 5;
    }

    for (const tip of formula.tips) {
      if (tip.toLowerCase().includes(q)) score += 5;
    }

    return score;
  }

  getSmartRecommendations(scenario: string): {
    formulas: ExcelFormula[];
    explanation: string;
    steps: string[];
  } {
    const normalized = scenario.trim().toLowerCase();
    const matchedFormulas = this.searchFormulas(scenario);
    const topFormulas = matchedFormulas.slice(0, 5);

    let explanation = '';
    const steps: string[] = [];

    if (/求和|合计|汇总|总计|加.*总|累.*加/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行数据汇总/求和操作。根据数据复杂度，推荐以下方案：';
      steps.push(
        '1. 确认数据范围：是单列汇总，还是需要按条件筛选后汇总？',
        '2. 简单单列求和直接使用 SUM 函数',
        '3. 有一个筛选条件使用 SUMIF',
        '4. 有多个筛选条件（如按区域+日期）使用 SUMIFS',
        '5. 需要对应相乘后汇总（如单价×数量）使用 SUMPRODUCT',
      );
    } else if (/查找|匹配|查询|根据.*找|vlookup|引用|跨表/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行数据查找/匹配。根据Excel版本和场景选择：';
      steps.push(
        '1. 确认查找值和返回值的位置关系',
        '2. Excel 365/2021+ 优先使用 XLOOKUP（更简洁，自带错误处理）',
        '3. 旧版本或需要兼容性使用 VLOOKUP 或 INDEX+MATCH',
        '4. 如果查找值不在第一列，使用 INDEX+MATCH 或 XLOOKUP',
        '5. 从右向左查找必须使用 INDEX+MATCH 或 XLOOKUP',
        '6. 建议配合 IFERROR 处理找不到的情况，避免显示#N/A',
      );
    } else if (/条件|判断|如果|是否|分级|级别|等级/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行条件判断或分级处理：';
      steps.push(
        '1. 梳理判断条件：有几个条件分支？',
        '2. 2个分支用基础 IF 函数',
        '3. 多个分支（3个以上）推荐用 IFS（Excel 2019+）或嵌套IF',
        '4. 多个条件同时满足用 AND，只要满足一个用 OR',
        '5. 始终考虑错误处理，用 IFERROR 包装可能出错的公式',
      );
    } else if (/日期|时间|年龄|工龄|到期|工作日|星期|月份|天数/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要处理日期时间相关计算：';
      steps.push(
        '1. 确保数据是标准日期格式（不是文本）',
        '2. 计算年龄/工龄用 DATEDIF + TODAY',
        '3. 计算工作日（排除周末）用 NETWORKDAYS',
        '4. 推算N个工作日后的日期用 WORKDAY',
        '5. 月末/月初计算用 EOMONTH',
        '6. 提取年月日分别用 YEAR/MONTH/DAY',
      );
    } else if (/文本|字符串|截取|提取|替换|拼接|合并|清洗|空格|去空格|长度/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要处理文本/字符串操作：';
      steps.push(
        '1. 明确操作类型：提取/替换/拼接/清洗？',
        '2. 提取：LEFT取左，RIGHT取右，MID取中间',
        '3. 动态定位配合 FIND 或 SEARCH',
        '4. 替换字符用 SUBSTITUTE',
        '5. 拼接多单元格用 TEXTJOIN（Excel 2019+）或 & 运算符',
        '6. 清洗数据用 TRIM（去首尾空格）+ SUBSTITUTE（去中间空格）+ CLEAN',
      );
    } else if (/去重|唯一|重复|不重复|筛选|过滤/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要去重或筛选数据：';
      steps.push(
        '1. Excel 365/2021+ 直接用 UNIQUE 提取唯一值，用 FILTER 按条件筛选',
        '2. 旧版本可使用：数据→删除重复值 功能',
        '3. 条件格式标记重复值：=COUNTIF($A:$A, $A1)>1',
        '4. 提取不重复值（旧版）：高级筛选→复制到其他位置→勾选"选择不重复的记录"',
      );
    } else if (/计数|个数|数量|统计.*次|多少.*条|多少人/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要统计数量/次数：';
      steps.push(
        '1. 统计数字单元格个数：COUNT',
        '2. 统计非空单元格个数：COUNTA',
        '3. 满足一个条件的个数：COUNTIF',
        '4. 同时满足多个条件的个数：COUNTIFS',
        '5. 去重后计数：=SUMPRODUCT(1/COUNTIF(A:A, A:A))（旧版）或=COUNTA(UNIQUE(A:A))（365+）',
      );
    } else if (/排名|名次|排序|最大|最小|最高|最低/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行排名或极值查找：';
      steps.push(
        '1. 简单排名用 RANK 函数',
        '2. 取前N大/前N小用 LARGE/SMALL',
        '3. 条件排名（如分组排名）用 SUMPRODUCT 构建条件',
        '4. 找最大值/最小值用 MAX/MIN',
        '5. 中国式排名（并列不占名额）需要用 SUMPRODUCT 数组公式',
      );
    } else if (/贷款|月供|还款|利率|财务|折旧|投资|回报/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行财务计算：';
      steps.push(
        '1. 计算月供（等额本息）用 PMT 函数',
        '2. 计算每期利息部分用 IPMT，本金部分用 PPMT',
        '3. 注意利率和期数的单位统一，年利率转月利率要除以12',
        '4. 贷款本金（pv）一般用负数表示现金流出',
      );
    } else if (/四舍五入|取整|保留|小数|向上取整|向下取整/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要进行数值取整处理：';
      steps.push(
        '1. 标准四舍五入：ROUND',
        '2. 向上取整（不管小数多少都进1）：ROUNDUP',
        '3. 向下取整（舍去小数）：ROUNDDOWN',
        '4. 取整参数：正数=保留小数位，0=整数，负数=十位/百位取整',
      );
    } else if (/平均|均值/.test(normalized)) {
      explanation = '根据您的需求，我理解您需要计算平均值：';
      steps.push(
        '1. 简单算术平均：AVERAGE',
        '2. 忽略0值求平均：AVERAGEIF(range, "<>0")',
        '3. 单条件平均：AVERAGEIF',
        '4. 多条件平均：AVERAGEIFS',
      );
    } else if (normalized.length > 0) {
      explanation = `我已为您搜索相关的Excel函数方案（关键词："${scenario}"），以下是最匹配的函数：`;
      steps.push(
        '1. 查看下方匹配的函数列表，点击卡片查看详情',
        '2. 仔细阅读每个函数的语法和参数说明',
        '3. 复制示例公式后，将单元格引用（如A2、B:B）替换为您的实际数据位置',
        '4. 建议配合 IFERROR 使用，避免查找不到或计算错误时显示#N/A等错误',
        '5. 如果没有找到合适的方案，可以尝试更换搜索关键词',
      );
    } else {
      explanation = '请在上方输入您想解决的数据问题，或浏览下方的函数分类：';
      steps.push(
        '1. 您可以直接描述问题，如"统计各部门的销售总额"、"根据学号查找姓名"等',
        '2. 也可以直接搜索函数名，如"VLOOKUP"、"SUMIF"',
        '3. 或者点击下方的分类卡片浏览相关函数',
      );
    }

    return {
      formulas: topFormulas,
      explanation,
      steps,
    };
  }
}