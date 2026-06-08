<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用菜单管理系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-icon :size="80" color="#165DFF">
          <HomeFilled />
        </el-icon>
        <h2>系统首页</h2>
        <p>这是一个基于 Vue3 + NestJS + SQLite 的全栈管理系统</p>
        <el-divider />
        <div class="features">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/loan-calculator')" class="feature-card">
                <el-icon :size="40" color="#165DFF">
                  <Money />
                </el-icon>
                <h3>贷款试算</h3>
                <p>房贷/车贷/公积金计算</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/holiday-calendar')" class="feature-card">
                <el-icon :size="40" color="#67c23a">
                  <Calendar />
                </el-icon>
                <h3>节假日查询</h3>
                <p>法定节假日与调休查询</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/audio-clipper')" class="feature-card">
                <el-icon :size="40" color="#e6a23c">
                  <Headset />
                </el-icon>
                <h3>音频剪辑</h3>
                <p>在线音频剪切工具</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/ip-lookup')" class="feature-card">
                <el-icon :size="40" color="#f56c6c">
                  <Location />
                </el-icon>
                <h3>IP地址查询</h3>
                <p>IP归属地信息查询</p>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/word-counter')" class="feature-card">
                <el-icon :size="40" color="#722ed1">
                  <Edit />
                </el-icon>
                <h3>字数统计</h3>
                <p>文本字数详细统计</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/random-picker')" class="feature-card">
                <el-icon :size="40" color="#13c2c2">
                  <Cpu />
                </el-icon>
                <h3>随机选择</h3>
                <p>随机选择/抽奖工具</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/code-deobfuscator')" class="feature-card">
                <el-icon :size="40" color="#eb2f96">
                  <Monitor />
                </el-icon>
                <h3>代码反混淆</h3>
                <p>JS代码混淆还原工具</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/grid-paper')" class="feature-card">
                <el-icon :size="40" color="#fa8c16">
                  <Grid />
                </el-icon>
                <h3>格子纸生成</h3>
                <p>方格/点阵/康奈尔笔记模板</p>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/idiom-chain')" class="feature-card">
                <el-icon :size="40" color="#eb2f96">
                  <ChatDotRound />
                </el-icon>
                <h3>成语接龙对战</h3>
                <p>AI 智能接龙，挑战你的词汇量</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/formula-ocr')" class="feature-card">
                <el-icon :size="40" color="#165DFF">
                  <Camera />
                </el-icon>
                <h3>拍照识别公式</h3>
                <p>数学物理化学公式智能识别</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/ai-art-prompts')" class="feature-card">
                <el-icon :size="40" color="#722ed1">
                  <MagicStick />
                </el-icon>
                <h3>AI 绘画提示词</h3>
                <p>精选提示词快速上手</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/thesis-writer')" class="feature-card">
                <el-icon :size="40" color="#e6a23c">
                  <Reading />
                </el-icon>
                <h3>论文辅助写作</h3>
                <p>学术论文内容自动生成</p>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/excel-formula')" class="feature-card">
                <el-icon :size="40" color="#165DFF">
                  <DataBoard />
                </el-icon>
                <h3>Excel公式查询</h3>
                <p>智能匹配函数与示例公式</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/image-to-prompt')" class="feature-card">
                <el-icon :size="40" color="#722ed1">
                  <PictureFilled />
                </el-icon>
                <h3>图片转提示词</h3>
                <p>AI 分析图片生成绘画提示词</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/picture-writing')" class="feature-card">
                <el-icon :size="40" color="#f56c6c">
                  <Reading />
                </el-icon>
                <h3>看图写话</h3>
                <p>AI 分析图片生成小学生作文</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/system/menu')" class="feature-card">
                <el-icon :size="40" color="#909399">
                  <Setting />
                </el-icon>
                <h3>系统设置</h3>
                <p>菜单与系统管理</p>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/word-ocr')" class="feature-card">
                <el-icon :size="40" color="#13c2c2">
                  <Camera />
                </el-icon>
                <h3>拍照识别单词</h3>
                <p>OCR识别单词·音标·例句</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/english-conversation')" class="feature-card">
                <el-icon :size="40" color="#722ed1">
                  <ChatDotRound />
                </el-icon>
                <h3>英语口语对话</h3>
                <p>AI 英语对话·场景练习·口语提升</p>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" @click="navigateTo('/poetry-recommendation')" class="feature-card">
                <el-icon :size="40" color="#eb2f96">
                  <Reading />
                </el-icon>
                <h3>诗词推荐</h3>
                <p>描述心情场景·智能匹配经典诗句</p>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  height: 100%;
}

.welcome-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-content h2 {
  margin: 20px 0 10px;
  color: #2c3e50;
}

.welcome-content p {
  color: #606266;
  margin-bottom: 30px;
}

.features {
  margin-top: 30px;
}

.features .el-card {
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.features .el-card:hover {
  transform: translateY(-5px);
}

.features h3 {
  margin: 15px 0 10px;
  color: #2c3e50;
  font-size: 16px;
}

.features p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
</style>
