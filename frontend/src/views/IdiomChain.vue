<template>
  <div class="idiom-chain">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>游戏规则</span>
        </div>
      </template>
      <el-steps :active="0" finish-status="wait" simple class="guide-steps">
        <el-step title="成语接龙" description="AI 先出一个成语，你用最后一个字接下一个成语" />
        <el-step title="尾字开头" description="你输入的成语必须以上一个成语的最后一个字开头" />
        <el-step title="轮流对战" description="双方轮流接龙，谁先接不上谁就输" />
      </el-steps>
    </el-card>

    <el-card class="game-card" v-loading="loading">
      <template #header>
        <div class="game-header">
          <div class="game-title">
            <el-icon :size="22" color="#722ed1"><ChatDotRound /></el-icon>
            <span>成语接龙对战</span>
            <el-tag size="small" type="success" v-if="!gameState?.gameOver">第 {{ gameState?.round || 1 }} 回合</el-tag>
            <el-tag size="small" type="warning" v-else>游戏结束</el-tag>
          </div>
          <div class="game-actions">
            <el-button size="small" @click="startNewGame">
              <el-icon><Refresh /></el-icon>
              新游戏
            </el-button>
            <el-button size="small" type="primary" @click="showHint" :disabled="gameState?.gameOver">
              <el-icon><Bulb /></el-icon>
              提示
            </el-button>
          </div>
        </div>
      </template>

      <div class="status-bar" v-if="gameState">
        <el-alert
          :title="gameState.message || '游戏开始！'"
          :type="gameState.gameOver ? (gameState.winner === 'user' ? 'success' : 'error') : 'info'"
          :closable="false"
          show-icon
          class="status-alert"
        />
        <div class="tail-hint" v-if="!gameState.gameOver">
          <span class="tail-label">需要以「</span>
          <span class="tail-char">{{ gameState.currentTail }}</span>
          <span class="tail-label">」开头的成语</span>
        </div>
      </div>

      <div class="chain-container" ref="chainContainerRef">
        <div
          v-for="msg in gameState?.chain || []"
          :key="msg.id"
          class="chain-item"
          :class="msg.role"
        >
          <div class="avatar">
            <el-avatar :size="36" :class="msg.role">
              <el-icon v-if="msg.role === 'ai'"><Cpu /></el-icon>
              <el-icon v-else><User /></el-icon>
            </el-avatar>
          </div>
          <div class="bubble-wrapper">
            <div class="bubble">
              <div class="idiom-word">{{ msg.word }}</div>
            </div>
            <div class="idiom-meta" v-if="msg.pinyin || msg.meaning">
              <span class="pinyin" v-if="msg.pinyin">{{ msg.pinyin }}</span>
              <span class="meaning" v-if="msg.meaning">— {{ msg.meaning }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-section" v-if="gameState && !gameState.gameOver">
        <el-input
          v-model="userInput"
          size="large"
          placeholder="请输入成语..."
          :maxlength="10"
          clearable
          @keyup.enter="submitWord"
          class="idiom-input"
        >
          <template #prefix>
            <el-icon><Edit /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" @click="submitWord" :disabled="submitting || !userInput.trim()">
          <el-icon><Promotion /></el-icon>
          接龙
        </el-button>
      </div>

      <div class="game-over-section" v-if="gameState?.gameOver">
        <el-result
          :icon="gameState.winner === 'user' ? 'success' : 'info'"
          :title="gameState.winner === 'user' ? '恭喜你赢了！' : '再接再厉！'"
          :sub-title="`本次对战共进行了 ${gameState.round} 回合`"
        >
          <template #extra>
            <el-button type="primary" @click="startNewGame">
              <el-icon><Refresh /></el-icon>
              再来一局
            </el-button>
          </template>
        </el-result>
      </div>
    </el-card>

    <el-card class="stats-card" v-if="gameState && gameState.chain.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon :size="18" color="#165DFF"><DataLine /></el-icon>
          <span>对战统计</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value primary">{{ gameState.chain.filter(c => c.role === 'user').length }}</div>
            <div class="stat-label">你的回合</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value success">{{ gameState.chain.filter(c => c.role === 'ai').length }}</div>
            <div class="stat-label">AI 的回合</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value warning">{{ gameState.usedWords.length }}</div>
            <div class="stat-label">已用成语</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import {
  InfoFilled,
  ChatDotRound,
  Refresh,
  Bulb,
  Cpu,
  User,
  Edit,
  Promotion,
  DataLine
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { idiomChainApi, type GameState, type IdiomInfo } from '@/api/idiomChain'

const loading = ref(false)
const submitting = ref(false)
const userInput = ref('')
const gameState = ref<GameState | null>(null)
const chainContainerRef = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chainContainerRef.value) {
    chainContainerRef.value.scrollTop = chainContainerRef.value.scrollHeight
  }
}

const startNewGame = async () => {
  loading.value = true
  try {
    const res = await idiomChainApi.newGame()
    gameState.value = res.data
    userInput.value = ''
    await scrollToBottom()
  } catch (e) {
    ElMessage.error('启动游戏失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const submitWord = async () => {
  const word = userInput.value.trim()
  if (!word) {
    ElMessage.warning('请输入成语')
    return
  }
  if (!gameState.value) {
    ElMessage.warning('请先开始游戏')
    return
  }
  submitting.value = true
  try {
    const res = await idiomChainApi.submit({
      userWord: word,
      currentState: gameState.value!
    })
    gameState.value = res.data
    userInput.value = ''
    await scrollToBottom()
    if (res.data.gameOver) {
      if (res.data.winner === 'user') {
        ElMessage.success('🎉 恭喜获胜！')
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const showHint = async () => {
  if (!gameState.value) return
  try {
    const res = await idiomChainApi.getHint(
      gameState.value.currentTail,
      gameState.value.usedWords
    )
    if (res.data.hint) {
      const hint = res.data.hint as IdiomInfo
      ElMessage({
        message: `提示：试试「${hint.word}」（${hint.meaning}）`,
        type: 'info',
        duration: 5000,
        showClose: true
      })
    } else {
      ElMessage.info(res.data.message || '没有可用的提示')
    }
  } catch {
    ElMessage.error('获取提示失败')
  }
}

watch(() => gameState, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  startNewGame()
})
</script>

<style scoped>
.idiom-chain {
  max-width: 900px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.game-card {
  margin-bottom: 24px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.game-title .el-tag {
  margin-left: 8px;
  font-weight: normal;
}

.game-actions {
  display: flex;
  gap: 8px;
}

.status-bar {
  margin-bottom: 20px;
}

.status-alert {
  margin-bottom: 12px;
}

.tail-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-radius: 8px;
  font-size: 14px;
}

.tail-label {
  color: #606266;
  font-weight: 500;
}

.tail-char {
  font-size: 24px;
  font-weight: bold;
  color: #165DFF;
  padding: 0 6px;
}

.chain-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chain-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  gap: 12px;
}

.chain-item:last-child {
  margin-bottom: 0;
}

.chain-item.ai {
  flex-direction: row;
}

.chain-item.user {
  flex-direction: row-reverse;
}

.chain-item.user .bubble-wrapper {
  align-items: flex-end;
}

.avatar .el-avatar {
  flex-shrink: 0;
}

.avatar .el-avatar.ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar .el-avatar.user {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.bubble {
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chain-item.ai .bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid #ebeef5;
}

.chain-item.user .bubble {
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
}

.chain-item.user .idiom-word {
  color: #fff;
}

.idiom-word {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 2px;
}

.chain-item.ai .idiom-word {
  color: #303133;
}

.idiom-meta {
  font-size: 12px;
  color: #909399;
  padding: 0 8px;
}

.idiom-meta .pinyin {
  font-style: italic;
  margin-right: 4px;
}

.input-section {
  display: flex;
  gap: 12px;
}

.idiom-input {
  flex: 1;
}

.game-over-section {
  padding: 20px 0;
}

.stats-card {
  margin-bottom: 24px;
}

.stats-card .card-header {
  font-size: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-value.primary {
  color: #165DFF;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}
</style>
