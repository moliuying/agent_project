export interface PythonCodeSample {
  id: number
  title: string
  category: string
  tags: string[]
  code: string
  description: string
  useCase: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  previewEmoji?: string
  pythonVersion: string
  dependencies: string[]
  installCommand?: string
  runCommand: string
  notes?: string
}

export const pythonCategories = [
  { key: 'all', name: '全部', icon: 'Collection' },
  { key: 'basics', name: '基础语法', icon: 'Notebook' },
  { key: 'string', name: '字符串处理', icon: 'EditPen' },
  { key: 'list', name: '列表/数组', icon: 'Grid' },
  { key: 'dict', name: '字典操作', icon: 'Files' },
  { key: 'file', name: '文件操作', icon: 'Folder' },
  { key: 'algorithm', name: '算法题解', icon: 'Cpu' },
  { key: 'oop', name: '面向对象', icon: 'Connection' },
  { key: 'web', name: '网络/爬虫', icon: 'Globe' },
  { key: 'data', name: '数据分析', icon: 'DataLine' }
]

export const pythonCodeSamples: PythonCodeSample[] = [
  {
    id: 1,
    title: '列表推导式',
    category: 'list',
    tags: ['列表', '推导式', 'Pythonic'],
    code: `# 生成 0-9 的平方列表
squares = [x ** 2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 带条件过滤：只保留偶数的平方
even_squares = [x ** 2 for x in range(10) if x % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# 双重循环：生成笛卡尔坐标
coords = [(x, y) for x in range(3) for y in range(2)]
print(coords)  # [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]`,
    description: 'Python 列表推导式是一种简洁优雅的语法，用一行代码替代多行 for 循环创建列表。',
    useCase: '日常开发中快速生成数据列表、数据过滤、格式转换，代码更简洁高效，面试中也常考察对 Pythonic 写法的掌握。',
    difficulty: 'beginner',
    previewEmoji: '📋',
    pythonVersion: 'Python 2.7+ / Python 3.x',
    dependencies: [],
    runCommand: 'python list_comprehension.py',
    notes: '无需安装任何第三方库，Python 内置语法。Python 2 中 print 语句需要加括号才能兼容 3.x。'
  },
  {
    id: 2,
    title: '字典常用操作',
    category: 'dict',
    tags: ['字典', 'dict', '常用技巧'],
    code: `# 安全获取值，避免 KeyError
user = {"name": "Alice", "age": 25}
print(user.get("name"))        # Alice
print(user.get("email"))       # None
print(user.get("email", "N/A")) # N/A

# 合并字典 (Python 3.9+)
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
merged = {**dict1, **dict2}
print(merged)  # {'a': 1, 'b': 3, 'c': 4}

# 遍历键值对
for key, value in user.items():
    print(f"{key}: {value}")

# 字典推导式
names = ["Alice", "Bob", "Charlie"]
name_lengths = {name: len(name) for name in names}
print(name_lengths)  # {'Alice': 5, 'Bob': 3, 'Charlie': 7}

# 统计词频
from collections import Counter
words = ["apple", "banana", "apple", "cherry", "apple", "banana"]
print(Counter(words))  # Counter({'apple': 3, 'banana': 2, 'cherry': 1})`,
    description: '字典是 Python 中最常用的数据结构之一，掌握这些常用操作可以大幅提升编码效率。',
    useCase: '配置读取、JSON 数据处理、统计计数、缓存映射等场景，几乎每个 Python 项目都会用到。',
    difficulty: 'beginner',
    previewEmoji: '📖',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python dict_ops.py',
    notes: 'collections.Counter 是 Python 3.1+ 内置模块。字典推导式 Python 2.7+ 支持。字典合并用 {**a, **b} 需要 Python 3.5+，Python 3.9+ 可用 a | b。'
  },
  {
    id: 3,
    title: '字符串格式化大全',
    category: 'string',
    tags: ['字符串', '格式化', 'f-string'],
    code: `name = "Alice"
age = 25
price = 1234.567

# f-string (Python 3.6+, 最推荐)
print(f"姓名: {name}, 年龄: {age}")
print(f"价格: {price:.2f}")         # 保留2位小数: 1234.57
print(f"大数字: {price:,.2f}")      # 千分位: 1,234.57
print(f"填充: {age:03d}")           # 补零: 025
print(f"百分比: {0.75:.1%}")        # 75.0%

# str.format() 方法
print("{} 今年 {} 岁".format(name, age))
print("{0} 的英文名是 {0}, 今年 {1} 岁".format(name, age))

# 对齐与填充
text = "hello"
print(f"|{text:<10}|")  # 左对齐: |hello     |
print(f"|{text:>10}|")  # 右对齐: |     hello|
print(f"|{text:^10}|")  # 居中:   |  hello   |
print(f"|{text:*>10}|") # 指定字符填充: |*****hello|

# 日期格式化
from datetime import datetime
today = datetime(2024, 1, 15)
print(f"今天是 {today:%Y年%m月%d日}")`,
    description: 'Python 提供多种字符串格式化方式，f-string 是现代 Python 最推荐的写法，简洁且功能强大。',
    useCase: '日志输出、报表生成、数据展示、用户提示信息等，任何需要字符串拼接的场景。',
    difficulty: 'beginner',
    previewEmoji: '✏️',
    pythonVersion: 'Python 3.6+ (f-string)',
    dependencies: [],
    runCommand: 'python string_formatting.py',
    notes: 'f-string 语法仅 Python 3.6+ 支持。如果使用 Python 2 或 3.5 及以下，请改用 str.format() 或 % 格式化。datetime 是标准库，无需安装。'
  },
  {
    id: 4,
    title: '文件读写操作',
    category: 'file',
    tags: ['文件', 'IO', '上下文管理器'],
    code: `# 推荐：使用 with 语句自动关闭文件
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()           # 读取全部内容
    print(content)

# 逐行读取（大文件推荐，避免内存溢出）
with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())      # strip() 去除换行符

# 读取所有行到列表
with open("data.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
print(lines)

# 写入文件（覆盖模式）
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("第一行\\n")
    f.write("第二行\\n")
    f.writelines(["第三行\\n", "第四行\\n"])

# 追加写入
with open("output.txt", "a", encoding="utf-8") as f:
    f.write("追加的内容\\n")

# 读写 JSON 文件
import json
data = {"name": "Alice", "scores": [95, 88, 92]}

# 写入 JSON
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 读取 JSON
with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded)`,
    description: '使用 with 上下文管理器可以自动处理文件关闭，避免资源泄漏。掌握文本和 JSON 文件读写是基础技能。',
    useCase: '配置文件读写、数据导入导出、日志分析、文本处理脚本等日常开发必备。',
    difficulty: 'beginner',
    previewEmoji: '📁',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python file_ops.py',
    notes: 'with 语句需 Python 2.6+ 支持。encoding="utf-8" 参数建议始终加上，Windows 系统默认编码是 GBK，容易乱码。json 是标准库模块。运行前请确保脚本对目录有写权限。'
  },
  {
    id: 5,
    title: '两数之和 (LeetCode #1)',
    category: 'algorithm',
    tags: ['数组', '哈希表', 'LeetCode', '面试'],
    code: `from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    """
    给定一个整数数组 nums 和一个整数目标值 target，
    请你在该数组中找出和为目标值 target 的那两个整数，
    并返回它们的数组下标。
    
    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    num_map = {}  # 值 -> 索引 的映射
    
    for index, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], index]
        num_map[num] = index
    
    return []  # 题目保证有解，不会执行到这里

# 测试用例
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))  # [0, 1]

nums2 = [3, 2, 4]
target2 = 6
print(two_sum(nums2, target2))  # [1, 2]`,
    description: '经典面试题，使用哈希表将 O(n²) 的暴力解法优化到 O(n)，考察数据结构选型能力。',
    useCase: '面试准备、算法练习，理解哈希表空间换时间的核心思想。',
    difficulty: 'beginner',
    previewEmoji: '🧮',
    pythonVersion: 'Python 3.5+',
    dependencies: [],
    runCommand: 'python two_sum.py',
    notes: 'typing.List 类型提示需要 Python 3.5+。如果使用 Python 3.9+，可以直接用 list[int] 替代 List[int]。算法逻辑本身不依赖任何第三方库。'
  },
  {
    id: 6,
    title: '装饰器模式',
    category: 'oop',
    tags: ['装饰器', 'design pattern', 'AOP'],
    code: `import time
from functools import wraps

# 基础装饰器：统计函数执行时间
def timer(func):
    @wraps(func)  # 保留原函数的元信息（名称、文档等）
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"[{func.__name__}] 执行耗时: {end - start:.4f}秒")
        return result
    return wrapper

# 带参数的装饰器：重试机制
def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"第 {attempt} 次尝试失败: {e}")
                    if attempt == max_attempts:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

# 使用装饰器
@timer
def slow_function():
    time.sleep(1)
    return "完成"

@retry(max_attempts=3, delay=0.5)
def unstable_function():
    import random
    if random.random() < 0.7:
        raise ConnectionError("网络波动")
    return "成功"

print(slow_function())
print(unstable_function())`,
    description: '装饰器是 Python 中 AOP（面向切面编程）的实现方式，可以在不修改函数代码的前提下增强功能。',
    useCase: '日志记录、性能监控、重试机制、权限校验、缓存等横切关注点，Python Web 框架（如 Flask、FastAPI）大量使用。',
    difficulty: 'intermediate',
    previewEmoji: '🎭',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python decorators.py',
    notes: 'functools.wraps 是标准库。装饰器语法 @ 需 Python 2.4+ 支持。如报错 NameError: name \'time\' is not defined，请确认是否导入了 time 模块。'
  },
  {
    id: 7,
    title: '生成器与迭代器',
    category: 'basics',
    tags: ['生成器', 'yield', '内存优化'],
    code: `# 生成器函数：使用 yield 惰性求值
def fibonacci(n):
    """生成斐波那契数列的前 n 项"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 每次迭代才计算下一个值，节省内存
for num in fibonacci(10):
    print(num, end=" ")  # 0 1 1 2 3 5 8 13 21 34

# 生成器表达式（类似列表推导式，但是惰性的）
gen = (x ** 2 for x in range(1000000))
print(type(gen))  # <class 'generator'>
# 不会一次性占用大量内存
for val in gen:
    if val > 100:
        break

# 自定义迭代器类
class Countdown:
    def __init__(self, start):
        self.current = start
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

for num in Countdown(5):
    print(num, end=" ")  # 5 4 3 2 1

# 大文件逐行处理示例
def read_large_file(file_path, chunk_size=8192):
    """分块读取超大文件，避免内存溢出"""
    with open(file_path, "r") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk`,
    description: '生成器通过 yield 实现惰性求值，只在需要时才计算值，对于大数据处理可以极大节省内存。',
    useCase: '大数据处理、流式读取、无限序列生成，是 Python 内存优化的重要手段，面试高频考点。',
    difficulty: 'intermediate',
    previewEmoji: '⚡',
    pythonVersion: 'Python 2.3+ (yield)',
    dependencies: [],
    runCommand: 'python generators.py',
    notes: 'yield 关键字 Python 2.2+ 引入，2.3+ 完善。生成器表达式需 Python 2.4+。注意生成器只能遍历一次，如需重复遍历需重新创建。'
  },
  {
    id: 8,
    title: '简易爬虫 (requests + BeautifulSoup)',
    category: 'web',
    tags: ['爬虫', 'requests', 'BeautifulSoup', 'HTML解析'],
    code: `import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict

def scrape_quotes(url: str) -> List[Dict]:
    """
    爬取名言网站的内容（示例：quotes.toscrape.com）
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        # 发送 GET 请求
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # 检查 HTTP 错误
        response.encoding = "utf-8"
        
        # 解析 HTML
        soup = BeautifulSoup(response.text, "html.parser")
        quotes = []
        
        # 提取数据
        for quote_tag in soup.select(".quote"):
            quote = {
                "text": quote_tag.select_one(".text").get_text(strip=True),
                "author": quote_tag.select_one(".author").get_text(strip=True),
                "tags": [tag.get_text() for tag in quote_tag.select(".tag")]
            }
            quotes.append(quote)
        
        return quotes
        
    except requests.RequestException as e:
        print(f"请求失败: {e}")
        return []

# 使用示例
if __name__ == "__main__":
    base_url = "https://quotes.toscrape.com"
    all_quotes = []
    
    # 爬取前 3 页
    for page in range(1, 4):
        print(f"正在爬取第 {page} 页...")
        quotes = scrape_quotes(f"{base_url}/page/{page}/")
        all_quotes.extend(quotes)
        time.sleep(1)  # 礼貌爬取，避免请求过快
    
    # 保存结果
    import json
    with open("quotes.json", "w", encoding="utf-8") as f:
        json.dump(all_quotes, f, ensure_ascii=False, indent=2)
    
    print(f"共爬取 {len(all_quotes)} 条名言")`,
    description: '使用 requests 库发送 HTTP 请求，BeautifulSoup 解析 HTML，是 Python 爬虫最基础也是最实用的组合。',
    useCase: '数据采集、价格监控、内容聚合、学术研究等，是 Python 最受欢迎的应用场景之一。',
    difficulty: 'intermediate',
    previewEmoji: '🕷️',
    pythonVersion: 'Python 3.7+',
    dependencies: ['requests', 'beautifulsoup4'],
    installCommand: 'pip install requests beautifulsoup4',
    runCommand: 'python scraper.py',
    notes: '如报错 ModuleNotFoundError: No module named \'requests\' 或 \'bs4\'，请先运行 installCommand 安装依赖。如遇 SSL 错误，可添加 verify=False 参数临时跳过（不推荐生产环境）。请遵守目标网站 robots.txt，控制爬取频率。'
  },
  {
    id: 9,
    title: '类的继承与多态',
    category: 'oop',
    tags: ['OOP', '继承', '多态', '抽象类'],
    code: `from abc import ABC, abstractmethod

# 抽象基类（接口）
class Animal(ABC):
    def __init__(self, name: str):
        self.name = name
    
    @abstractmethod
    def speak(self) -> str:
        """抽象方法：子类必须实现"""
        pass
    
    def __str__(self) -> str:
        return f"我是{self.name}"

# 子类继承
class Dog(Animal):
    def speak(self) -> str:
        return "汪汪汪！"
    
    def fetch(self) -> str:
        return f"{self.name} 正在捡球"

class Cat(Animal):
    def speak(self) -> str:
        return "喵喵喵～"
    
    def scratch(self) -> str:
        return f"{self.name} 正在磨爪子"

class Duck(Animal):
    def speak(self) -> str:
        return "嘎嘎嘎！"

# 多态：同一接口，不同实现
def make_animal_speak(animal: Animal):
    print(f"{animal}，叫声是：{animal.speak()}")

# 使用示例
if __name__ == "__main__":
    animals = [
        Dog("旺财"),
        Cat("咪咪"),
        Duck("唐老鸭")
    ]
    
    for animal in animals:
        make_animal_speak(animal)
        # 输出:
        # 我是旺财，叫声是：汪汪汪！
        # 我是咪咪，叫声是：喵喵喵～
        # 我是唐老鸭，叫声是：嘎嘎嘎！
    
    # 类型检查
    dog = Dog("小白")
    print(isinstance(dog, Animal))  # True
    print(isinstance(dog, Dog))     # True
    print(issubclass(Dog, Animal))  # True

# super() 调用父类方法
class Puppy(Dog):
    def __init__(self, name: str, age: int):
        super().__init__(name)  # 调用父类构造函数
        self.age = age
    
    def speak(self) -> str:
        return "呜呜呜...（小奶狗）"`,
    description: '面向对象三大特性：封装、继承、多态。抽象基类定义接口规范，子类实现具体行为，多态让代码更灵活可扩展。',
    useCase: '项目架构设计、插件系统、框架开发，理解 OOP 思想是进阶开发的必经之路。',
    difficulty: 'intermediate',
    previewEmoji: '🧬',
    pythonVersion: 'Python 3.4+ (abc)',
    dependencies: [],
    runCommand: 'python oop_example.py',
    notes: 'abc.ABC 抽象基类模块需 Python 3.4+ 支持。Python 2 中需使用 class Animal(object): __metaclass__ = ABCMeta。注意：抽象类不能直接实例化，必须被继承并实现所有抽象方法。'
  },
  {
    id: 10,
    title: 'Pandas 数据处理入门',
    category: 'data',
    tags: ['pandas', '数据分析', 'DataFrame'],
    code: `import pandas as pd
import numpy as np

# 创建 DataFrame
data = {
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "age": [25, 30, 35, 28, 22],
    "city": ["北京", "上海", "北京", "广州", "上海"],
    "salary": [15000, 20000, 25000, 18000, 12000]
}
df = pd.DataFrame(data)
print(df)

# 基本信息查看
print(df.info())        # 数据类型、非空值数量
print(df.describe())    # 数值列统计信息
print(df.head(3))       # 前 3 行
print(df["city"].unique())  # ['北京' '上海' '广州']

# 数据筛选
# 北京地区的员工
beijing_staff = df[df["city"] == "北京"]
print(beijing_staff)

# 多条件筛选：北京 且 工资 > 20000
high_salary = df[(df["city"] == "北京") & (df["salary"] > 20000)]

# 分组统计
city_stats = df.groupby("city").agg({
    "salary": ["mean", "max", "min", "count"],
    "age": "mean"
}).round(2)
print(city_stats)
# 按城市统计工资均值、最高、最低、人数，以及平均年龄

# 排序
df_sorted = df.sort_values("salary", ascending=False)

# 新增列
df["salary_monthly"] = (df["salary"] / 12).round(2)
df["age_group"] = pd.cut(
    df["age"],
    bins=[0, 25, 30, 100],
    labels=["25岁以下", "25-30岁", "30岁以上"]
)

# 读写 CSV / Excel
df.to_csv("employees.csv", index=False, encoding="utf-8-sig")
df_read = pd.read_csv("employees.csv")
# df.to_excel("employees.xlsx", index=False)`,
    description: 'Pandas 是 Python 数据分析的事实标准，提供高效的 DataFrame 结构，支持数据清洗、转换、统计、聚合等操作。',
    useCase: '数据清洗、报表生成、特征工程、商业分析，是数据分析师、算法工程师的必备技能。',
    difficulty: 'intermediate',
    previewEmoji: '📊',
    pythonVersion: 'Python 3.8+ (推荐)',
    dependencies: ['pandas', 'numpy', 'openpyxl (仅Excel读写)'],
    installCommand: 'pip install pandas numpy openpyxl',
    runCommand: 'python pandas_demo.py',
    notes: '如报错 ModuleNotFoundError，请先执行 pip install pandas numpy。读写 Excel 需要额外安装 openpyxl。读写中文 CSV 建议使用 utf-8-sig 编码，否则 Excel 打开可能乱码。建议 Python 3.8 及以上版本，旧版本可能存在兼容问题。'
  },
  {
    id: 11,
    title: '并发编程 (线程/进程/协程)',
    category: 'basics',
    tags: ['并发', '多线程', 'asyncio', '性能优化'],
    code: `import time
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import requests

# ========== 1. 多线程：适合 I/O 密集型任务 ==========
def fetch_url(url: str) -> str:
    """模拟 I/O 密集型任务（网络请求）"""
    start = time.time()
    resp = requests.get(url, timeout=5)
    print(f"获取 {url} 完成，状态码: {resp.status_code}，耗时: {time.time()-start:.2f}s")
    return resp.text

urls = [
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
]

# 顺序执行（约 3 秒）
start = time.time()
for url in urls:
    fetch_url(url)
print(f"顺序执行耗时: {time.time()-start:.2f}s")

# 多线程执行（约 1 秒）
start = time.time()
with ThreadPoolExecutor(max_workers=3) as executor:
    executor.map(fetch_url, urls)
print(f"多线程执行耗时: {time.time()-start:.2f}s")

# ========== 2. 多进程：适合 CPU 密集型任务 ==========
def cpu_heavy(n: int) -> int:
    """模拟 CPU 密集型任务"""
    count = 0
    for i in range(n):
        count += i ** 2
    return count

# 多进程并行计算
if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(cpu_heavy, [10_000_000, 10_000_000, 10_000_000, 10_000_000]))
    print(f"计算结果: {results}")

# ========== 3. 异步编程 (asyncio)：最高效的 I/O 并发 ==========
async def async_fetch(url: str):
    """使用 aiohttp 的异步请求（需 pip install aiohttp）"""
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.text()

async def async_main():
    tasks = [async_fetch(url) for url in urls]
    results = await asyncio.gather(*tasks)
    print(f"异步获取 {len(results)} 个 URL")

# 运行异步任务
# asyncio.run(async_main())`,
    description: 'Python 提供三种并发方案：多线程（I/O密集）、多进程（CPU密集）、asyncio协程（高并发I/O），根据场景选择合适方案。',
    useCase: '爬虫提速、批量文件处理、Web服务优化、高并发系统，是 Python 高级开发者必须掌握的内容。',
    difficulty: 'advanced',
    previewEmoji: '🚀',
    pythonVersion: 'Python 3.6+ (asyncio.run 需要 3.7+)',
    dependencies: ['requests', 'aiohttp (仅异步示例)'],
    installCommand: 'pip install requests aiohttp',
    runCommand: 'python concurrency.py',
    notes: '多进程示例必须放在 if __name__ == "__main__": 中，否则 Windows 会报错。asyncio.run() 需 Python 3.7+。GIL 的存在使多线程无法并行 CPU 计算，所以 CPU 密集任务用多进程。如报错 RuntimeError: This event loop is already running，说明在 Jupyter 等环境中，需改用 asyncio.create_task()。'
  },
  {
    id: 12,
    title: '上下文管理器实现',
    category: 'oop',
    tags: ['上下文管理器', 'with', '资源管理'],
    code: `# 方式1：基于类实现
class FileManager:
    def __init__(self, filename: str, mode: str = "r"):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        """进入 with 块时调用，返回值会被 as 接收"""
        print(f"打开文件: {self.filename}")
        self.file = open(self.filename, self.mode, encoding="utf-8")
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出 with 块时调用，即使异常也会执行"""
        print(f"关闭文件: {self.filename}")
        if self.file:
            self.file.close()
        # 返回 True 表示异常已处理，不向上抛出
        # 返回 False 或 None 表示异常继续抛出
        return False

# 使用自定义上下文管理器
with FileManager("test.txt", "w") as f:
    f.write("Hello Context Manager!")

# 方式2：使用 contextlib 装饰器（更简洁）
from contextlib import contextmanager

@contextmanager
def timer_context(name: str):
    """统计代码块执行时间的上下文管理器"""
    import time
    start = time.time()
    try:
        print(f"[{name}] 开始执行...")
        yield  # 这里的控制权交给 with 块内的代码
    finally:
        elapsed = time.time() - start
        print(f"[{name}] 执行完成，耗时: {elapsed:.4f}秒")

# 使用示例
with timer_context("数据处理"):
    total = sum(range(1_000_000))
    print(f"计算结果: {total}")

# 输出:
# [数据处理] 开始执行...
# 计算结果: 499999500000
# [数据处理] 执行完成，耗时: 0.0321秒

# 其他实用 contextlib 工具
from contextlib import suppress, closing

# suppress: 忽略指定异常
with suppress(FileNotFoundError):
    with open("不存在的文件.txt") as f:
        content = f.read()  # 不会报错，异常被忽略

# closing: 确保 close() 被调用
from urllib.request import urlopen
with closing(urlopen("https://example.com")) as page:
    html = page.read()`,
    description: '上下文管理器通过 __enter__ 和 __exit__ 方法确保资源被正确获取和释放，是 Python 优雅处理资源管理的核心机制。',
    useCase: '数据库连接、文件操作、锁管理、事务管理、临时目录等任何需要清理的资源场景。',
    difficulty: 'advanced',
    previewEmoji: '🔒',
    pythonVersion: 'Python 2.6+',
    dependencies: [],
    runCommand: 'python context_manager.py',
    notes: 'contextlib.contextmanager 装饰器需 Python 2.5+ 支持。with 语句需 Python 2.6+。注意 __exit__ 方法有三个异常参数，返回 True 可以阻止异常继续传播。'
  },
  {
    id: 13,
    title: '有效括号 (LeetCode #20)',
    category: 'algorithm',
    tags: ['栈', 'LeetCode', '面试', '字符串'],
    code: `def is_valid(s: str) -> bool:
    """
    给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s，
    判断字符串是否有效。
    
    有效字符串需满足：
    1. 左括号必须用相同类型的右括号闭合。
    2. 左括号必须以正确的顺序闭合。
    3. 每个右括号都有一个对应的相同类型的左括号。
    
    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    # 右括号到左括号的映射
    bracket_map = {')': '(', ']': '[', '}': '{'}
    stack = []
    
    for char in s:
        # 如果是右括号
        if char in bracket_map:
            # 取出栈顶元素（如果栈为空则用占位符）
            top = stack.pop() if stack else '#'
            # 检查是否匹配
            if bracket_map[char] != top:
                return False
        else:
            # 左括号入栈
            stack.append(char)
    
    # 栈为空说明所有括号都匹配了
    return not stack

# 测试用例
print(is_valid("()"))       # True
print(is_valid("()[]{}"))   # True
print(is_valid("(]"))       # False
print(is_valid("([)]"))     # False
print(is_valid("{[]}"))     # True
print(is_valid(""))         # True`,
    description: '经典栈应用题，利用栈的后进先出特性处理嵌套结构，是考察数据结构的基础题型。',
    useCase: '面试算法练习，代码编辑器语法高亮、HTML标签匹配、表达式求值等实际场景都运用了类似思想。',
    difficulty: 'beginner',
    previewEmoji: '🖇️',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python valid_parentheses.py',
    notes: '纯内置语法，无需安装任何库。Python 中 list 即可作为栈使用，append() 入栈，pop() 出栈。如果字符串包含空格或其他字符，代码会认为是无效输入，可根据需要预处理。'
  },
  {
    id: 14,
    title: '正则表达式常用模式',
    category: 'string',
    tags: ['正则', 're', '文本匹配'],
    code: `import re

text = """
联系方式：
电话: 13812345678, 021-12345678
邮箱: test@example.com, hello.world@company.co.cn
网址: https://www.python.org, http://example.com/path?query=1
身份证: 110101199003071234
日期: 2024-01-15, 2024/01/15
"""

# 匹配手机号（中国大陆 11 位）
phones = re.findall(r"1[3-9]\\d{9}", text)
print("手机号:", phones)

# 匹配邮箱
emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", text)
print("邮箱:", emails)

# 匹配 URL
urls = re.findall(r"https?://[a-zA-Z0-9./?=&_%-]+", text)
print("网址:", urls)

# 匹配日期（支持 - 和 / 分隔）
dates = re.findall(r"\\d{4}[-/]\\d{2}[-/]\\d{2}", text)
print("日期:", dates)

# 替换操作：脱敏手机号
def mask_phone(match):
    phone = match.group()
    return phone[:3] + "****" + phone[7:]

masked_text = re.sub(r"1[3-9]\\d{9}", mask_phone, text)
print("脱敏后包含:", "138****5678" in masked_text)  # True

# 分组提取：从 URL 中提取域名
url_pattern = re.compile(r"https?://(www\\.)?([a-zA-Z0-9.-]+)(/[^\\s]*)?")
for match in url_pattern.finditer(text):
    domain = match.group(2)
    print(f"域名: {domain}")

# 验证：检查是否是合法邮箱
def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))

print(is_valid_email("a@b.com"))   # True
print(is_valid_email("invalid"))   # False`,
    description: '正则表达式是文本处理的瑞士军刀，掌握常用模式可以快速完成匹配、提取、替换等复杂文本操作。',
    useCase: '数据清洗、格式校验、日志分析、爬虫提取、文本搜索，是程序员的通用技能。',
    difficulty: 'intermediate',
    previewEmoji: '🔍',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python regex_demo.py',
    notes: 're 是 Python 标准库模块，无需安装。注意：在 Python 字符串中写正则，反斜杠需要转义（\\\\ 表示 \\），推荐使用原始字符串 r"..." 避免转义。正则表达式复杂时建议分段注释。'
  },
  {
    id: 15,
    title: '排序算法汇总',
    category: 'algorithm',
    tags: ['排序', '算法', '面试', '时间复杂度'],
    code: `from typing import List
import random

# 1. 冒泡排序 O(n²) - 稳定
def bubble_sort(arr: List[int]) -> List[int]:
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:  # 优化：已有序则提前退出
            break
    return arr

# 2. 选择排序 O(n²) - 不稳定
def selection_sort(arr: List[int]) -> List[int]:
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

# 3. 插入排序 O(n²) - 稳定，小规模数据或近似有序时快
def insertion_sort(arr: List[int]) -> List[int]:
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

# 4. 快速排序 O(n log n) - 不稳定（实际最常用）
def quick_sort(arr: List[int]) -> List[int]:
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]  # 选择中间元素作为基准
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 5. 归并排序 O(n log n) - 稳定
def merge_sort(arr: List[int]) -> List[int]:
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # 合并两个有序数组
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

# 测试
if __name__ == "__main__":
    random.seed(42)
    test_arr = [random.randint(0, 100) for _ in range(10)]
    print("原数组:", test_arr)
    print("冒泡排序:", bubble_sort(test_arr.copy()))
    print("选择排序:", selection_sort(test_arr.copy()))
    print("插入排序:", insertion_sort(test_arr.copy()))
    print("快速排序:", quick_sort(test_arr.copy()))
    print("归并排序:", merge_sort(test_arr.copy()))
    print("Python 内置:", sorted(test_arr))  # TimSort，实际最快`,
    description: '面试常考的 5 种基础排序算法，理解各自的时间/空间复杂度、稳定性和适用场景。',
    useCase: '面试准备、算法基础，实际开发中直接用 sorted() 即可（Python 内置 TimSort 算法极其高效）。',
    difficulty: 'intermediate',
    previewEmoji: '📶',
    pythonVersion: 'Python 3.5+',
    dependencies: [],
    runCommand: 'python sorting_algorithms.py',
    notes: 'typing.List 需 Python 3.5+。递归排序（快排、归并）注意 Python 默认递归深度约 1000，对超大数据集会 RecursionError，此时可用迭代版或直接 sorted()。'
  },
  {
    id: 16,
    title: 'FastAPI 快速入门',
    category: 'web',
    tags: ['FastAPI', 'Web', 'API', '后端'],
    code: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

app = FastAPI(title="图书管理 API", version="1.0")

# Pydantic 数据模型（自动类型校验和文档生成）
class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="书名")
    author: str = Field(..., min_length=1, description="作者")
    year: int = Field(..., ge=1000, le=2100, description="出版年份")
    is_available: bool = True

class Book(BookCreate):
    id: int

# 模拟数据库
books_db: dict[int, Book] = {}
next_id = 1

# CRUD 接口

@app.post("/books/", response_model=Book, status_code=201, summary="创建图书")
def create_book(book: BookCreate):
    """
    创建一本新图书
    - **title**: 书名（必填，1-200字符）
    - **author**: 作者（必填）
    - **year**: 出版年份（1000-2100）
    - **is_available**: 是否可借（默认 true）
    """
    global next_id
    new_book = Book(id=next_id, **book.dict())
    books_db[next_id] = new_book
    next_id += 1
    return new_book

@app.get("/books/", response_model=List[Book], summary="查询图书列表")
def list_books(author: Optional[str] = None, available_only: bool = False):
    """支持按作者筛选、只看可借图书"""
    result = list(books_db.values())
    if author:
        result = [b for b in result if author.lower() in b.author.lower()]
    if available_only:
        result = [b for b in result if b.is_available]
    return result

@app.get("/books/{book_id}", response_model=Book, summary="获取单本图书")
def get_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail=f"图书 ID={book_id} 不存在")
    return books_db[book_id]

@app.put("/books/{book_id}", response_model=Book, summary="更新图书")
def update_book(book_id: int, book: BookCreate):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="图书不存在")
    updated = Book(id=book_id, **book.dict())
    books_db[book_id] = updated
    return updated

@app.delete("/books/{book_id}", status_code=204, summary="删除图书")
def delete_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="图书不存在")
    del books_db[book_id]

# 运行: uvicorn main:app --reload
# 文档: http://localhost:8000/docs (Swagger UI)
# 文档: http://localhost:8000/redoc`,
    description: 'FastAPI 是现代 Python Web 框架，基于类型提示自动生成文档和校验，性能媲美 Go/Node，开发效率极高。',
    useCase: '快速构建 RESTful API、微服务、机器学习模型部署，是 Python 后端开发的首选框架之一。',
    difficulty: 'intermediate',
    previewEmoji: '🌐',
    pythonVersion: 'Python 3.8+',
    dependencies: ['fastapi', 'uvicorn', 'pydantic'],
    installCommand: 'pip install fastapi uvicorn',
    runCommand: 'uvicorn main:app --reload',
    notes: '如报错 ModuleNotFoundError，请先 pip install fastapi uvicorn。启动后访问 http://localhost:8000/docs 即可看到交互式 API 文档。dict[int, Book] 类型提示需 Python 3.9+，旧版本可改用 Dict[int, Book]（从 typing 导入）。'
  },
  {
    id: 17,
    title: '类型提示与 mypy',
    category: 'basics',
    tags: ['类型提示', 'typing', 'mypy', '代码质量'],
    code: `from typing import List, Dict, Optional, Union, Callable, Tuple, Set
from typing import TypeVar, Generic

# ========== 基础类型提示 ==========

# 函数参数和返回值
def add(a: int, b: int) -> int:
    return a + b

# 变量类型注解
name: str = "Alice"
age: int = 25
is_active: bool = True
price: float = 99.99

# ========== 容器类型 ==========

# List
def sum_numbers(numbers: List[int]) -> int:
    return sum(numbers)

# Dict
def get_user_info(user_id: int) -> Dict[str, Union[str, int]]:
    return {"name": "Alice", "age": 25, "city": "北京"}

# Tuple (固定长度，每个元素都有类型)
user_tuple: Tuple[str, int, bool] = ("Alice", 25, True)

# Set
unique_tags: Set[str] = {"python", "dev", "ai"}

# ========== 特殊类型 ==========

# Optional: 可以是指定类型，也可以是 None
def find_user(user_id: int) -> Optional[str]:
    if user_id > 0:
        return f"用户{user_id}"
    return None

# Union: 多种类型之一
def process_value(value: Union[int, str]) -> str:
    return str(value)

# Callable: 函数类型
def apply_func(values: List[int], func: Callable[[int], int]) -> List[int]:
    return [func(x) for x in values]

squares = apply_func([1, 2, 3], lambda x: x ** 2)

# ========== 泛型 ==========
T = TypeVar("T")

class Stack(Generic[T]):
    """泛型栈类"""
    def __init__(self) -> None:
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def is_empty(self) -> bool:
        return len(self._items) == 0

# 使用：指定具体类型
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
print(int_stack.pop())  # 2

# ========== 类型别名 ==========
UserId = int
UserName = str
UserDict = Dict[UserId, UserName]

users: UserDict = {1: "Alice", 2: "Bob"}

# 运行: mypy your_file.py 进行静态类型检查`,
    description: 'Python 3.5+ 引入类型提示，配合 mypy 可以在不运行代码的情况下发现类型错误，提升大型项目的可维护性。',
    useCase: '大型项目开发、团队协作、开源库编写，现代 Python 开发的标准实践，FastAPI/Pydantic 等框架都重度依赖。',
    difficulty: 'intermediate',
    previewEmoji: '📝',
    pythonVersion: 'Python 3.5+ (typing 模块)',
    dependencies: ['mypy (仅静态检查)'],
    installCommand: 'pip install mypy',
    runCommand: 'python typing_demo.py  # 运行\nmypy typing_demo.py  # 静态检查',
    notes: '类型提示在运行时不强制，Python 依然是动态语言。Python 3.9+ 支持 list[int]、dict[str, int] 等原生泛型，无需从 typing 导入。如 mypy 报错 No library stub file，可忽略或安装对应库的 types-* 包。'
  },
  {
    id: 18,
    title: '二分查找 (LeetCode #704)',
    category: 'algorithm',
    tags: ['二分查找', 'LeetCode', '面试'],
    code: `from typing import List

def binary_search(nums: List[int], target: int) -> int:
    """
    给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target，
    返回目标值在数组中的索引，如果不存在则返回 -1。
    
    时间复杂度: O(log n)
    空间复杂度: O(1)
    """
    left, right = 0, len(nums) - 1
    
    while left <= right:
        # 防止整数溢出（Python 不会溢出，但这是通用写法）
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1  # 在右半部分查找
        else:
            right = mid - 1  # 在左半部分查找
    
    return -1

# 测试
nums = [-1, 0, 3, 5, 9, 12]
print(binary_search(nums, 9))   # 4
print(binary_search(nums, 2))   # -1
print(binary_search(nums, -1))  # 0
print(binary_search(nums, 12))  # 5

# ========== 变体1：查找左边界 ==========
def search_left_bound(nums: List[int], target: int) -> int:
    """查找第一个等于 target 的位置"""
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] >= target:
            right = mid
        else:
            left = mid + 1
    return left if left < len(nums) and nums[left] == target else -1

# ========== 变体2：查找右边界 ==========
def search_right_bound(nums: List[int], target: int) -> int:
    """查找最后一个等于 target 的位置"""
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] <= target:
            left = mid + 1
        else:
            right = mid
    return left - 1 if left > 0 and nums[left - 1] == target else -1

# 测试边界
nums2 = [1, 2, 2, 2, 3, 4]
print(search_left_bound(nums2, 2))   # 1
print(search_right_bound(nums2, 2))  # 3`,
    description: '二分查找是有序数组查找的最优解，O(log n) 时间复杂度秒杀 O(n) 线性查找，面试高频考点。',
    useCase: '查找搜索、数据库索引、旋转数组、峰值查找等，必须掌握基础模板和左右边界变体。',
    difficulty: 'intermediate',
    previewEmoji: '🔎',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python binary_search.py',
    notes: '纯内置语法无依赖。注意二分查找前提是数组有序。常见坑：1) while 条件 left<=right vs left<right；2) mid 计算防溢出写法；3) 边界条件判断。写代码时建议在纸上走一遍测试用例。'
  },
  {
    id: 19,
    title: '异常处理最佳实践',
    category: 'basics',
    tags: ['异常', 'try-except', '错误处理'],
    code: `# ========== 基本结构 ==========
def divide(a: int, b: int) -> float:
    try:
        result = a / b
    except ZeroDivisionError:
        print("错误：除数不能为零")
        return float("inf")
    except TypeError:
        print("错误：参数必须是数字")
        raise  # 重新抛出异常
    else:
        # 没有异常时执行
        print(f"计算成功: {a} / {b} = {result}")
        return result
    finally:
        # 无论是否异常都会执行，常用于清理资源
        print("执行完成")

# ========== 自定义异常 ==========
class InsufficientBalanceError(Exception):
    """余额不足异常"""
    def __init__(self, balance: float, amount: float):
        self.balance = balance
        self.amount = amount
        self.shortfall = amount - balance
        super().__init__(f"余额不足！当前余额: {balance}，需要: {amount}，差: {self.shortfall}")

class BankAccount:
    def __init__(self, balance: float = 0):
        self.balance = balance
    
    def withdraw(self, amount: float):
        if amount > self.balance:
            raise InsufficientBalanceError(self.balance, amount)
        self.balance -= amount
        print(f"取款 {amount} 成功，余额: {self.balance}")
        return self.balance

# 使用自定义异常
try:
    account = BankAccount(100)
    account.withdraw(200)
except InsufficientBalanceError as e:
    print(f"错误: {e}")
    print(f"还差 {e.shortfall} 元")

# ========== 最佳实践 ==========

# 1. 不要捕获所有异常（避免 except: 裸捕获）
try:
    # do something
    pass
except ValueError:  # 指定具体异常类型
    pass

# 2. 使用 contextlib.suppress 处理预期内的异常
from contextlib import suppress
with suppress(FileNotFoundError):
    with open("temp.txt") as f:
        print(f.read())

# 3. try 块尽量小，只包裹可能出错的代码
# 不好：try 范围太大
# try:
#     process_data()
#     save_to_db()
#     send_email()
# except: ...

# 好：分开处理
try:
    process_data()
except ValueError as e:
    print(f"数据处理失败: {e}")

try:
    save_to_db()
except ConnectionError as e:
    print(f"数据库连接失败: {e}")`,
    description: '良好的异常处理让程序更健壮，区分可预期错误和真正的 Bug，同时自定义异常让错误语义更清晰。',
    useCase: '任何生产级代码都需要完善的错误处理，防止程序崩溃、方便调试、给出友好的错误提示。',
    difficulty: 'intermediate',
    previewEmoji: '⚠️',
    pythonVersion: 'Python 3.x',
    dependencies: [],
    runCommand: 'python exception_handling.py',
    notes: '自定义异常类的 __init__ 中记得调用 super().__init__()。except 后面不指定异常类型会捕获所有异常包括 KeyboardInterrupt，非常危险，永远不要这么写。BaseException 是所有异常的根类，捕获它也同样危险。'
  },
  {
    id: 20,
    title: '虚拟环境与依赖管理',
    category: 'basics',
    tags: ['虚拟环境', 'pip', '依赖', '工程化'],
    code: `# ========== 方法1：venv（Python 内置，推荐简单项目） ==========

# 创建虚拟环境
# python -m venv venv

# 激活虚拟环境
# macOS/Linux:
# source venv/bin/activate
# Windows (PowerShell):
# .\\venv\\Scripts\\Activate.ps1

# 退出虚拟环境
# deactivate

# ========== 方法2：requirements.txt 管理依赖 ==========

# 导出当前环境的所有依赖
# pip freeze > requirements.txt

# 根据 requirements.txt 安装依赖
# pip install -r requirements.txt

# ========== 方法3：现代工具 Poetry（推荐新项目） ==========

# 安装 Poetry
# pip install poetry

# 创建新项目
# poetry new my-project

# 初始化已有项目
# poetry init

# 添加依赖（自动管理版本）
# poetry add requests
# poetry add --dev pytest black  # 开发依赖

# 移除依赖
# poetry remove requests

# 安装所有依赖（根据 poetry.lock）
# poetry install

# 运行脚本
# poetry run python main.py
# poetry shell  # 进入虚拟环境 shell

# ========== Python 多版本管理 ==========

# macOS: pyenv
# brew install pyenv
# pyenv install 3.11.7
# pyenv local 3.11.7  # 当前目录使用该版本
# pyenv global 3.11.7  # 全局默认

# Windows: pyenv-win 或直接安装官方包

# ========== 常见问题 ==========

# 1. 国内镜像加速
# pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pandas
# 或永久配置：
# pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 2. 查看已安装的包
# pip list
# pip show requests  # 查看指定包信息

# 3. 升级包
# pip install --upgrade requests
# pip install --upgrade pip`,
    description: '虚拟环境让每个项目的依赖相互隔离，避免版本冲突，是 Python 工程化的第一步，也是最容易被新手忽视的重要知识。',
    useCase: '任何 Python 项目都应该使用虚拟环境，团队协作时保证每个人的依赖版本一致，避免"在我机器上能跑"问题。',
    difficulty: 'beginner',
    previewEmoji: '🐍',
    pythonVersion: 'Python 3.3+ (venv 内置)',
    dependencies: [],
    installCommand: 'pip install poetry  # 仅使用 Poetry 时需要',
    runCommand: '命令行脚本，逐项执行',
    notes: 'venv 是 Python 3.3+ 内置模块，Python 2 请使用 virtualenv。Windows PowerShell 执行策略可能阻止激活脚本，需先运行 Set-ExecutionPolicy RemoteSigned -Scope CurrentUser。pip 安装慢强烈建议配置国内镜像。'
  }
]
