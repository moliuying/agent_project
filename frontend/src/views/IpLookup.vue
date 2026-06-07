<template>
  <div class="ip-lookup">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <el-steps :active="0" finish-status="wait" simple class="guide-steps">
        <el-step title="输入IP或域名" description="可开启高精度模式获取更精准定位" />
        <el-step title="查看精度分级" description="国家级→省级→城市级→区县级→街道级" />
        <el-step title="对比多源结果" description="结合精度和可信度综合判断" />
      </el-steps>
    </el-card>

    <el-card class="precision-level-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Aim />
          </el-icon>
          <span>定位精度分级说明</span>
          <el-tag size="small" type="info">IP定位并非GPS，无法精确到街道门牌号</el-tag>
        </div>
      </template>
      <div class="precision-levels">
        <div 
          v-for="(lvl, idx) in precisionLevels" 
          :key="lvl.level" 
          class="precision-level-item"
        >
          <div 
            class="level-bar" 
            :style="{ 
              background: precisionGradientColors[idx],
              width: (lvl.score) + '%'
            }"
          >
            <span class="level-label">{{ lvl.label }}</span>
            <span class="level-score">{{ lvl.score }}分</span>
          </div>
          <p class="level-desc">{{ lvl.description }}</p>
        </div>
      </div>
      <el-alert type="info" :closable="false" class="precision-alert">
        <template #title>
          <span><strong>精度与可信度的区别：</strong>
          <br />• <strong>精度</strong> = 能定位到多细的粒度（国家/省/城市/区县/街道），取决于数据源本身的能力
          <br />• <strong>可信度</strong> = 结果正确的可能性，取决于数据源质量 + 多源一致性 + 响应质量
          <br />高精度但低可信度 = 看起来很细但可能不对；低精度但高可信度 = 虽然粗但基本正确
          </span>
        </template>
      </el-alert>
    </el-card>

    <el-card class="data-source-info-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Coin />
          </el-icon>
          <span>数据源精度对比</span>
          <el-tag size="small" type="info">共 {{ dataSources.length }} 个数据源</el-tag>
        </div>
      </template>
      <div class="sources-grid">
        <div 
          v-for="source in dataSources" 
          :key="source.id" 
          class="source-card"
        >
          <div class="source-header">
            <span class="source-name">{{ source.name }}</span>
            <el-tag size="small" :type="precisionTagType(source.nominalPrecision)">
              标称精度：{{ precisionLabel(source.nominalPrecision) }}
            </el-tag>
          </div>
          <p class="source-desc">{{ source.description }}</p>
          <div class="source-meta">
            <div class="meta-item">
              <span class="meta-label">典型误差</span>
              <span class="meta-value highlight">{{ source.typicalAccuracyKm }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">覆盖范围</span>
              <span class="meta-value">{{ source.coverage }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新频率</span>
              <span class="meta-value">{{ source.updateFrequency }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">基础可信度</span>
              <span class="meta-value highlight">{{ source.baseReliability }}分</span>
            </div>
          </div>
          <div class="precision-detail">
            <el-icon color="#722ed1"><Aim /></el-icon>
            <span class="precision-text">{{ source.precisionDescription }}</span>
          </div>
          <div class="source-suitable">
            <div class="suitable-title">适用场景</div>
            <div class="suitable-tags">
              <el-tag 
                v-for="(s, i) in source.suitableScenarios" 
                :key="i" 
                size="small" 
                type="success"
                effect="plain"
                class="suitable-tag"
              >{{ s }}</el-tag>
            </div>
          </div>
          <div class="source-pros-cons">
            <div class="pros">
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
              <span class="pros-cons-title">优势</span>
              <ul>
                <li v-for="(pro, i) in source.pros" :key="i">{{ pro }}</li>
              </ul>
            </div>
            <div class="cons">
              <el-icon color="#f56c6c"><Warning /></el-icon>
              <span class="pros-cons-title">限制</span>
              <ul>
                <li v-for="(con, i) in source.cons" :key="i">{{ con }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <el-alert type="info" :closable="false" class="source-alert">
        <template #title>
          <span><strong>为什么多个数据源结果可能不同？</strong>
          <br />IP地理定位数据库并非实时同步，差异通常来自：数据更新时间不同、IP段分配信息变更、对城市粒度的判断标准差异、代理/VPN/CDN IP的识别差异等。建议结合多数数据源结果综合判断。</span>
        </template>
      </el-alert>
    </el-card>

    <el-card class="lookup-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Location />
          </el-icon>
          <span>IP地址查询</span>
          <el-tag size="small" type="info" class="header-tag">多数据源对比查询</el-tag>
        </div>
      </template>

      <div class="query-settings">
        <div class="query-mode-switch">
          <el-radio-group v-model="queryMode" size="default">
            <el-radio-button label="single">
              <el-icon><Search /></el-icon>
              <span>单个查询</span>
            </el-radio-button>
            <el-radio-button label="batch">
              <el-icon><List /></el-icon>
              <span>批量查询</span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="precision-mode-switch">
          <el-tooltip 
            content="开启后系统将优先采用精度更高的数据源，并对精准数据源赋予1.5倍权重" 
            placement="top"
            :show-after="300"
          >
            <div class="switch-wrapper">
              <span class="switch-label">高精度模式</span>
              <el-switch 
                v-model="highPrecisionMode" 
                active-color="#722ed1"
                inactive-color="#dcdfe6"
              />
              <el-tag 
                size="small" 
                :type="highPrecisionMode ? 'success' : 'info'"
                class="mode-tag"
              >
                {{ highPrecisionMode ? '已启用·精准优先' : '标准模式·多数投票' }}
              </el-tag>
            </div>
          </el-tooltip>
        </div>
      </div>

      <div class="input-section" v-if="queryMode === 'single'">
        <div class="input-header">
          <span class="input-label">IP地址 / 域名</span>
          <el-tooltip content="支持IPv4、IPv6及域名格式" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="input-row">
          <el-input
            v-model="singleInput"
            placeholder="请输入IP地址或域名，例如：8.8.8.8 或 google.com"
            class="input-field"
            clearable
            @keyup.enter="handleSingleLookup"
          >
            <template #prefix>
              <el-icon><Monitor /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" :loading="loading" @click="handleSingleLookup">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="getMyIp">
            <el-icon><User /></el-icon>
            <span>查询本机</span>
          </el-button>
        </div>
        <div class="quick-examples">
          <span class="example-label">快捷示例：</span>
          <el-tag
            v-for="example in quickExamples"
            :key="example"
            size="small"
            class="example-tag"
            effect="plain"
            @click="singleInput = example"
          >
            {{ example }}
          </el-tag>
        </div>
      </div>

      <div class="input-section" v-else>
        <div class="input-header">
          <span class="input-label">批量输入（每行一个）</span>
          <el-tooltip content="支持IP和域名混合，最多20个（多源查询较慢）" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <el-input
          v-model="batchInput"
          type="textarea"
          :rows="8"
          placeholder="请输入IP地址或域名，每行一个，例如：&#10;8.8.8.8&#10;google.com&#10;1.1.1.1"
          resize="vertical"
          class="text-input"
        />
        <div class="batch-actions">
          <div class="batch-info">
            <el-tag size="small" :type="batchItems.length > 20 ? 'danger' : 'info'">
              已输入 {{ batchItems.length }} 项
            </el-tag>
            <span class="batch-tip" v-if="batchItems.length > 20">
              单次最多查询20个，将自动截取前20个
            </span>
          </div>
          <el-button-group>
            <el-button @click="clearBatch">
              <el-icon><Delete /></el-icon>
              <span>清空</span>
            </el-button>
            <el-button @click="pasteFromClipboard">
              <el-icon><Document /></el-icon>
              <span>粘贴</span>
            </el-button>
            <el-button type="primary" :loading="loading" @click="handleBatchLookup">
              <el-icon><Search /></el-icon>
              <span>批量查询</span>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>

    <el-card v-if="singleResult" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>综合查询结果</span>
          <el-tag 
            size="small"
            type="purple"
            effect="dark"
          >
            {{ singleResult.highPrecisionMode ? '高精度模式' : '标准模式' }}
          </el-tag>
          <el-tag 
            size="small" 
            :type="confidenceTagType(singleResult.overallConfidence)"
            class="confidence-tag"
          >
            可信度 {{ singleResult.overallConfidenceScore }}分
            ({{ confidenceText(singleResult.overallConfidence) }})
          </el-tag>
          <el-tag 
            size="small" 
            :type="precisionTagType(singleResult.overallPrecision)"
            class="precision-tag"
          >
            精度 {{ singleResult.overallPrecisionLabel }}
            ({{ singleResult.overallPrecisionScore }}分)
          </el-tag>
          <el-button size="small" text class="copy-btn" @click="copyResult(singleResult)">
            <el-icon><CopyDocument /></el-icon>
            <span>复制结果</span>
          </el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :span="12">
          <div class="confidence-bar-wrapper">
            <div class="confidence-bar-label">
              <span><el-icon color="#165DFF"><Medal /></el-icon> 整体可信度</span>
              <span class="score" :style="{ color: confidenceColor(singleResult.overallConfidence) }">
                {{ singleResult.overallConfidenceScore }} / 100
              </span>
            </div>
            <el-progress
              :percentage="singleResult.overallConfidenceScore"
              :stroke-width="14"
              :color="confidenceColor(singleResult.overallConfidence)"
              :show-text="false"
            />
            <div class="confidence-levels">
              <span class="level low" :class="{ active: singleResult.overallConfidence === 'low' }">低(0-59)</span>
              <span class="level medium" :class="{ active: singleResult.overallConfidence === 'medium' }">中(60-79)</span>
              <span class="level high" :class="{ active: singleResult.overallConfidence === 'high' }">高(80-100)</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="precision-bar-wrapper">
            <div class="confidence-bar-label">
              <span><el-icon color="#722ed1"><Aim /></el-icon> 综合定位精度</span>
              <span class="score" :style="{ color: precisionColor(singleResult.overallPrecision) }">
                {{ singleResult.overallPrecisionLabel }}
                ({{ singleResult.overallPrecisionScore }}分)
              </span>
            </div>
            <el-progress
              :percentage="singleResult.overallPrecisionScore"
              :stroke-width="14"
              :color="precisionColor(singleResult.overallPrecision)"
              :show-text="false"
            />
            <div class="precision-levels-bar">
              <span 
                v-for="lvl in precisionLevels.slice(0, 4)" 
                :key="lvl.level"
                class="level small"
                :class="{ active: lvl.level === singleResult.overallPrecision }"
                :style="{ color: precisionColor(lvl.level) }"
              >{{ lvl.label }}</span>
              <span 
                class="level small"
                :class="{ active: singleResult.overallPrecision === 'street' }"
                :style="{ color: precisionColor('street') }"
              >街道级</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="result-content">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="result-item primary">
              <div class="result-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="result-info">
                <div class="result-label">IP地址</div>
                <div class="result-value">{{ singleResult.ip }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="result-item" :class="singleResult.isLocal ? 'warning' : 'success'">
              <div class="result-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="result-info">
                <div class="result-label">归属地（综合）</div>
                <div class="result-value">
                  {{ formatLocation(singleResult.consensus) }}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card v-if="singleResult && !singleResult.isLocal" class="precision-compare-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Aim />
          </el-icon>
          <span>各数据源精度对比</span>
        </div>
      </template>
      <div class="precision-compare-list">
        <div 
          v-for="item in singleResult.precisionComparison" 
          :key="item.sourceName"
          class="precision-compare-item"
        >
          <div class="compare-header">
            <span class="compare-source">{{ item.sourceName }}</span>
            <el-tag size="small" :type="precisionTagType(item.precision)">
              {{ item.precisionLabel }} ({{ item.score }}分)
            </el-tag>
          </div>
          <el-progress
            :percentage="item.score"
            :stroke-width="10"
            :color="precisionColor(item.precision)"
            :show-text="false"
          />
          <div class="compare-accuracy">
            <el-icon color="#909399"><InfoFilled /></el-icon>
            <span>典型误差范围：{{ item.typicalAccuracy }}</span>
          </div>
        </div>
      </div>
      <el-alert 
        v-if="singleResult.highPrecisionMode"
        type="success" 
        :closable="false" 
        class="mode-alert"
      >
        <template #title>
          <el-icon><CircleCheck /></el-icon>
          <span>高精度模式已启用：结果优先采用精度评分更高的数据源，高精准数据源权重为1.5倍</span>
        </template>
      </el-alert>
      <el-alert 
        v-else
        type="warning" 
        :closable="false" 
        class="mode-alert"
        show-icon
      >
        <template #title>
          <span>当前为标准模式（多数投票）。如需更细粒度定位，建议开启顶部的「高精度模式」</span>
        </template>
      </el-alert>
    </el-card>

    <el-card v-if="singleResult && !singleResult.isLocal" class="field-consensus-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Histogram />
          </el-icon>
          <span>字段一致性与精度分析</span>
          <el-tag 
            size="small" 
            :type="unanimousFields === singleResult.fieldConsensus.length ? 'success' : 'warning'"
          >
            {{ unanimousFields }}/{{ singleResult.fieldConsensus.length }} 字段完全一致
          </el-tag>
        </div>
      </template>

      <div class="consensus-list">
        <div 
          v-for="field in singleResult.fieldConsensus" 
          :key="field.field" 
          class="consensus-item"
          :class="{ disagreed: !field.agreed }"
        >
          <div class="consensus-header">
            <div class="header-left">
              <span class="field-label">{{ field.label }}</span>
              <el-tag 
                size="small" 
                :type="precisionTagType(field.precisionLevel)"
                effect="plain"
                class="precision-mini-tag"
              >
                {{ field.precisionLabel }}
              </el-tag>
            </div>
            <el-tag 
              size="small" 
              :type="field.agreed ? 'success' : (field.confidence === 'high' ? '' : (field.confidence === 'medium' ? 'warning' : 'danger'))"
            >
              {{ field.agreed ? '一致' : (field.confidence === 'high' ? '基本一致' : (field.confidence === 'medium' ? '有分歧' : '差异大')) }}
            </el-tag>
          </div>
          <div class="consensus-value">
            <span class="value-label">综合结果：</span>
            <span class="final-value">{{ field.mostCommon || '未知' }}</span>
          </div>
          <div v-if="!field.agreed && field.values.length > 0" class="consensus-sources">
            <span class="sources-label">各数据源：</span>
            <div class="source-values">
              <span 
                v-for="v in field.values" 
                :key="v.source" 
                class="source-value-tag"
              >
                <strong>{{ v.source }}:</strong> {{ v.value || '未返回' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-if="singleResult && !singleResult.isLocal" class="sources-detail-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Coin />
          </el-icon>
          <span>各数据源详情</span>
        </div>
      </template>

      <el-collapse accordion>
        <el-collapse-item 
          v-for="source in singleResult.sources" 
          :key="source.source.id" 
          :name="source.source.id"
        >
          <template #title>
            <div class="source-title">
              <span class="source-name">{{ source.source.name }}</span>
              <el-tag 
                size="small" 
                :type="source.success ? confidenceTagType(source.confidence) : 'danger'"
              >
                {{ source.success ? `可信度${source.confidenceScore}分` : '查询失败' }}
              </el-tag>
              <el-tag 
                v-if="source.success"
                size="small" 
                :type="precisionTagType(source.actualPrecision)"
                effect="plain"
              >
                {{ source.actualPrecisionLabel }} ({{ source.precisionScore }}分)
              </el-tag>
              <span class="source-time" v-if="source.success">{{ source.responseTime }}ms</span>
              <span class="source-error" v-else>{{ source.error }}</span>
            </div>
          </template>
          <div class="source-detail">
            <div v-if="!source.success" class="source-failed">
              <el-alert type="error" :closable="false" :title="`数据源查询失败：${source.error || '未知原因'}`" />
            </div>
            <template v-else>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="国家/地区">{{ source.data?.country || '未知' }} ({{ source.data?.countryCode }})</el-descriptions-item>
                <el-descriptions-item label="省份/州">{{ source.data?.regionName || source.data?.region || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="城市">{{ source.data?.city || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="邮编">{{ source.data?.zip || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="时区">{{ source.data?.timezone || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="经纬度">{{ source.data?.latitude }}, {{ source.data?.longitude }}</el-descriptions-item>
                <el-descriptions-item label="运营商(ISP)" :span="2">{{ source.data?.isp || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="组织(ORG)" :span="2">{{ source.data?.org || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="AS号" :span="2">{{ source.data?.as || '未知' }}</el-descriptions-item>
              </el-descriptions>
              <div class="confidence-reasons">
                <div class="reasons-title">评分依据（可信度 + 精度）：</div>
                <ul>
                  <li v-for="(reason, i) in source.confidenceReasons" :key="i">{{ reason }}</li>
                </ul>
              </div>
            </template>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-card v-if="singleResult" class="explanation-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Reading />
          </el-icon>
          <span>结果说明与建议</span>
        </div>
      </template>

      <div v-if="singleResult.explanation.precisionExplanation && singleResult.explanation.precisionExplanation.length > 0" class="explanation-section precision-exp">
        <div class="section-title">
          <el-icon color="#722ed1"><Aim /></el-icon>
          <span>精度说明</span>
        </div>
        <ul class="explanation-list">
          <li v-for="(pe, i) in singleResult.explanation.precisionExplanation" :key="i">{{ pe }}</li>
        </ul>
      </div>

      <div v-if="singleResult.explanation.differences && singleResult.explanation.differences.length > 0" class="explanation-section differences">
        <div class="section-title">
          <el-icon color="#f56c6c"><Warning /></el-icon>
          <span>数据差异</span>
        </div>
        <ul class="explanation-list">
          <li v-for="(diff, i) in singleResult.explanation.differences" :key="i">{{ diff }}</li>
        </ul>
      </div>

      <div class="explanation-section recommendations">
        <div class="section-title">
          <el-icon color="#67c23a"><CircleCheck /></el-icon>
          <span>使用建议</span>
        </div>
        <ul class="explanation-list">
          <li v-for="(rec, i) in singleResult.explanation.recommendations" :key="i">{{ rec }}</li>
        </ul>
      </div>

      <div v-if="singleResult.explanation.scenarioAdvice && singleResult.explanation.scenarioAdvice.length > 0" class="explanation-section scenario">
        <div class="section-title">
          <el-icon color="#165DFF"><Collection /></el-icon>
          <span>场景选择建议</span>
        </div>
        <div class="scenario-list">
          <div 
            v-for="(sa, i) in singleResult.explanation.scenarioAdvice" 
            :key="i"
            class="scenario-item"
          >
            <div class="scenario-name">
              <el-icon color="#165DFF"><Flag /></el-icon>
              <span>{{ sa.scenario }}</span>
            </div>
            <div class="scenario-advice">{{ sa.advice }}</div>
            <el-tag size="small" type="info" effect="plain">
              推荐精度：{{ sa.recommendedPrecision }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="explanation-section notes">
        <div class="section-title">
          <el-icon color="#909399"><InfoFilled /></el-icon>
          <span>说明备注</span>
        </div>
        <ul class="explanation-list">
          <li v-for="(note, i) in singleResult.explanation.notes" :key="i">{{ note }}</li>
        </ul>
      </div>
    </el-card>

    <el-card v-if="batchResults.length > 0" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>批量查询结果</span>
          <el-tag size="small" type="purple" effect="dark" class="header-tag" v-if="highPrecisionMode">
            高精度模式
          </el-tag>
          <el-tag size="small" type="success" class="header-tag">
            共 {{ batchResults.length }} 条
          </el-tag>
          <el-button size="small" text class="copy-btn" @click="copyBatchResults">
            <el-icon><CopyDocument /></el-icon>
            <span>复制全部</span>
          </el-button>
        </div>
      </template>

      <div class="batch-table-wrapper">
        <el-table
          :data="batchResults"
          stripe
          border
          style="width: 100%"
          :max-height="500"
        >
          <el-table-column prop="ip" label="IP/域名" width="150">
            <template #default="{ row }">
              <span class="mono-font">{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="归属地" min-width="160">
            <template #default="{ row }">
              <span>{{ formatLocation(row.consensus) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="精度" width="110">
            <template #default="{ row }">
              <el-tag 
                size="small" 
                :type="precisionTagType(row.overallPrecision)"
              >
                {{ row.overallPrecisionLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="城市" width="100">
            <template #default="{ row }">{{ row.consensus.city || '-' }}</template>
          </el-table-column>
          <el-table-column label="运营商" min-width="140">
            <template #default="{ row }">{{ row.consensus.isp || '-' }}</template>
          </el-table-column>
          <el-table-column label="可信度" width="110">
            <template #default="{ row }">
              <el-tag 
                size="small" 
                :type="confidenceTagType(row.overallConfidence)"
              >
                {{ row.overallConfidenceScore }}分
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据源" width="100">
            <template #default="{ row }">
              {{ row.sources.filter(s => s.success).length }}/{{ row.sources.length }} 成功
            </template>
          </el-table-column>
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="row.isLocal ? 'warning' : (row.isError ? 'danger' : 'success')">
                {{ row.isError ? '失败' : (row.isLocal ? '内网' : '公网') }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card v-if="history.length > 0" class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>查询历史</span>
          <el-button size="small" text type="danger" @click="clearHistory">
            清空记录
          </el-button>
        </div>
      </template>

      <div class="history-list">
        <div class="history-item" v-for="(item, index) in displayHistory" :key="index">
          <div class="history-main">
            <span class="history-ip mono-font">{{ item.ip }}</span>
            <span class="history-location">{{ formatLocation(item.result.consensus) }}</span>
            <el-tag size="small" :type="precisionTagType(item.result.overallPrecision)" effect="plain">
              {{ item.result.overallPrecisionLabel }}
            </el-tag>
            <el-tag size="small" :type="confidenceTagType(item.result.overallConfidence)">
              {{ item.result.overallConfidenceScore }}分
            </el-tag>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="history-actions">
            <el-button size="small" text @click="loadHistoryItem(item)">
              <el-icon><Refresh /></el-icon>
              <span>查看</span>
            </el-button>
          </div>
        </div>
      </div>
      <div class="history-footer" v-if="history.length > 20">
        <el-button text size="small" @click="showAllHistory = !showAllHistory">
          {{ showAllHistory ? '收起' : `查看全部 ${history.length} 条记录` }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Location,
  InfoFilled,
  Search,
  List,
  Monitor,
  QuestionFilled,
  User,
  Delete,
  Document,
  DataLine,
  CopyDocument,
  Clock,
  Refresh,
  Coin,
  Histogram,
  Reading,
  Warning,
  CircleCheck,
  Aim,
  Medal,
  Collection,
  Flag
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  ipLookupApi, 
  type IpLookupResult, 
  type DataSourceInfo,
  type IpLookupData,
  type ConfidenceLevel,
  type PrecisionLevel,
  type PrecisionLevelInfo
} from '@/api/ipLookup'

interface HistoryItem {
  ip: string
  result: IpLookupResult
  time: string
}

const STORAGE_KEY = 'ip_lookup_history'

const queryMode = ref<'single' | 'batch'>('single')
const highPrecisionMode = ref(false)
const singleInput = ref('')
const batchInput = ref('')
const loading = ref(false)
const singleResult = ref<IpLookupResult | null>(null)
const batchResults = ref<IpLookupResult[]>([])
const history = ref<HistoryItem[]>([])
const showAllHistory = ref(false)
const dataSources = ref<DataSourceInfo[]>([])
const precisionLevels = ref<PrecisionLevelInfo[]>([])

const precisionGradientColors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#722ed1']

const quickExamples = [
  '8.8.8.8',
  '1.1.1.1',
  'google.com',
  'baidu.com',
  '192.168.1.1'
]

const batchItems = computed(() => {
  return batchInput.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const displayHistory = computed(() => {
  const reversed = history.value.slice().reverse()
  if (showAllHistory.value) {
    return reversed
  }
  return reversed.slice(0, 20)
})

const unanimousFields = computed(() => {
  if (!singleResult.value) return 0
  return singleResult.value.fieldConsensus.filter(f => f.agreed).length
})

const confidenceText = (level: ConfidenceLevel): string => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[level]
}

const confidenceTagType = (level: ConfidenceLevel): 'success' | 'warning' | 'danger' | 'info' => {
  const map = { high: 'success', medium: 'warning', low: 'danger' }
  return map[level]
}

const confidenceColor = (level: ConfidenceLevel): string => {
  const map = { high: '#67c23a', medium: '#e6a23c', low: '#f56c6c' }
  return map[level]
}

const precisionLabel = (level: PrecisionLevel): string => {
  const map = { country: '国家级', province: '省级', city: '城市级', district: '区县级', street: '街道级' }
  return map[level]
}

const precisionTagType = (level: PrecisionLevel): 'danger' | 'warning' | 'primary' | 'success' | 'info' => {
  const map = { country: 'danger', province: 'warning', city: 'primary', district: 'success', street: 'info' }
  return map[level]
}

const precisionColor = (level: PrecisionLevel): string => {
  const map = { country: '#f56c6c', province: '#e6a23c', city: '#409eff', district: '#67c23a', street: '#722ed1' }
  return map[level]
}

const formatLocation = (data: IpLookupData) => {
  const parts = [data.country, data.regionName || data.region, data.city]
  return parts.filter(p => p && p !== '未知').join(' / ') || '未知'
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const addToHistory = (result: IpLookupResult) => {
  const exists = history.value.findIndex(h => h.ip === result.ip)
  if (exists > -1) {
    history.value.splice(exists, 1)
  }
  
  history.value.push({
    ip: result.ip,
    result,
    time: new Date().toISOString()
  })
  
  if (history.value.length > 100) {
    history.value = history.value.slice(-100)
  }
  
  saveHistory()
}

const loadDataSources = async () => {
  try {
    const { data } = await ipLookupApi.getSources()
    dataSources.value = data
  } catch (e) {
    console.error('Failed to load data sources:', e)
  }
}

const loadPrecisionLevels = async () => {
  try {
    const { data } = await ipLookupApi.getPrecisionLevels()
    precisionLevels.value = data
  } catch (e) {
    console.error('Failed to load precision levels:', e)
    precisionLevels.value = [
      { level: 'country', label: '国家级', score: 20, description: '仅能定位到国家，误差可能达数千公里' },
      { level: 'province', label: '省级', score: 40, description: '可定位到省/州一级，误差数百公里' },
      { level: 'city', label: '城市级', score: 60, description: '可定位到城市，误差通常50-200公里' },
      { level: 'district', label: '区县级', score: 80, description: '可定位到区县，误差通常10-50公里' },
      { level: 'street', label: '街道级', score: 95, description: '可定位到街道/商圈，误差通常1-10公里' },
    ]
  }
}

const handleSingleLookup = async () => {
  if (!singleInput.value.trim()) {
    ElMessage.warning('请输入IP地址或域名')
    return
  }
  
  loading.value = true
  singleResult.value = null
  batchResults.value = []
  
  try {
    const { data } = await ipLookupApi.lookup(singleInput.value.trim(), highPrecisionMode.value)
    singleResult.value = data
    addToHistory(data)
    ElMessage.success(`查询完成${highPrecisionMode.value ? '（高精度模式）' : ''}`)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleBatchLookup = async () => {
  const items = batchItems.value
  if (items.length === 0) {
    ElMessage.warning('请输入至少一个IP地址或域名')
    return
  }
  
  if (items.length > 20) {
    ElMessage.warning(`输入了 ${items.length} 项，将仅查询前 20 项（多源查询较慢）`)
  }
  
  loading.value = true
  singleResult.value = null
  batchResults.value = []
  
  try {
    const lookupItems = items.slice(0, 20)
    const { data } = await ipLookupApi.batchLookup(lookupItems, highPrecisionMode.value)
    batchResults.value = data
    
    data.forEach(r => {
      if (!r.isError) {
        addToHistory(r)
      }
    })
    
    const successCount = data.filter(r => !r.isError).length
    ElMessage.success(`查询完成${highPrecisionMode.value ? '（高精度模式）' : ''}，成功 ${successCount} 条，失败 ${data.length - successCount} 条`)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '批量查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getMyIp = async () => {
  loading.value = true
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    singleInput.value = data.ip
    ElMessage.success(`已获取本机IP: ${data.ip}`)
  } catch {
    ElMessage.warning('无法自动获取本机IP，请手动输入')
  } finally {
    loading.value = false
  }
}

const clearBatch = () => {
  batchInput.value = ''
  batchResults.value = []
  ElMessage.success('已清空')
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      batchInput.value += (batchInput.value ? '\n' : '') + text
      ElMessage.success('已从剪贴板粘贴')
    } else {
      ElMessage.warning('剪贴板为空')
    }
  } catch {
    ElMessage.error('无法访问剪贴板，请手动粘贴')
  }
}

const copyResult = (result: IpLookupResult) => {
  const lines: string[] = []
  lines.push('【IP查询结果 - 多源对比】')
  lines.push(`查询模式：${result.highPrecisionMode ? '高精度模式' : '标准模式'}`)
  lines.push(`IP地址：${result.ip}`)
  lines.push(`综合归属地：${formatLocation(result.consensus)}`)
  lines.push(`综合可信度：${result.overallConfidenceScore}分 (${confidenceText(result.overallConfidence)})`)
  lines.push(`综合精度：${result.overallPrecisionLabel} (${result.overallPrecisionScore}分)`)
  lines.push('')
  lines.push('--- 各字段详情 ---')
  result.fieldConsensus.forEach(f => {
    lines.push(`${f.label}（${f.precisionLabel}）：${f.mostCommon || '未知'} ${f.agreed ? '(一致)' : `(${f.confidence === 'high' ? '基本一致' : f.confidence === 'medium' ? '有分歧' : '差异大'})`}`)
  })
  lines.push('')
  lines.push('--- 各数据源精度对比 ---')
  result.precisionComparison.forEach(p => {
    lines.push(`[${p.sourceName}] ${p.precisionLabel}(${p.score}分) | 典型误差: ${p.typicalAccuracy}`)
  })
  lines.push('')
  lines.push('--- 各数据源详情 ---')
  result.sources.forEach(s => {
    if (s.success && s.data) {
      lines.push(`[${s.source.name}] ${formatLocation(s.data)} | 精度${s.actualPrecisionLabel} | 可信度${s.confidenceScore}分 | ${s.responseTime}ms`)
    } else {
      lines.push(`[${s.source.name}] 查询失败: ${s.error}`)
    }
  })
  lines.push('')
  lines.push('--- 精度说明 ---')
  result.explanation.precisionExplanation?.forEach(p => lines.push(`· ${p}`))
  lines.push('')
  lines.push('--- 建议 ---')
  result.explanation.recommendations.forEach(r => lines.push(`· ${r}`))
  lines.push('')
  lines.push('--- 场景建议 ---')
  result.explanation.scenarioAdvice?.forEach(s => lines.push(`· ${s.scenario}: ${s.advice}`))
  lines.push('')
  lines.push('--- 说明 ---')
  result.explanation.notes.slice(0, 4).forEach(n => lines.push(`· ${n}`))
  
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    ElMessage.success('结果已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const copyBatchResults = () => {
  const header = 'IP/域名\t综合归属地\t精度\t城市\t运营商\t可信度\t成功数据源\t类型'
  const rows = batchResults.value.map(r => 
    `${r.ip}\t${formatLocation(r.consensus)}\t${r.overallPrecisionLabel}\t${r.consensus.city || ''}\t${r.consensus.isp || ''}\t${r.overallConfidenceScore}分\t${r.sources.filter(s => s.success).length}/${r.sources.length}\t${r.isError ? '失败' : (r.isLocal ? '内网' : '公网')}`
  )
  const text = [header, ...rows].join('\n')
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('批量结果已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const loadHistoryItem = (item: HistoryItem) => {
  queryMode.value = 'single'
  singleInput.value = item.ip
  highPrecisionMode.value = item.result.highPrecisionMode
  singleResult.value = item.result
  batchResults.value = []
  ElMessage.success('已载入历史记录')
}

const clearHistory = () => {
  history.value = []
  saveHistory()
  ElMessage.success('历史记录已清空')
}

onMounted(() => {
  loadHistoryFromStorage()
  loadDataSources()
  loadPrecisionLevels()
})
</script>

<style scoped>
.ip-lookup {
  max-width: 1100px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.precision-level-card {
  margin-bottom: 24px;
}

.precision-levels {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.precision-level-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level-bar {
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  min-width: 60px;
  transition: width 0.5s ease;
}

.level-bar .level-label {
  font-size: 15px;
}

.level-bar .level-score {
  font-size: 13px;
  opacity: 0.9;
}

.level-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
  padding-left: 4px;
}

.precision-alert {
  margin-top: 8px;
}

.data-source-info-card {
  margin-bottom: 24px;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.source-card {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.source-card:hover {
  border-color: #165DFF;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
  flex-wrap: wrap;
}

.source-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.source-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.source-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-bottom: 12px;
}

.precision-detail {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  background: #f9f0ff;
  border-radius: 6px;
  margin-bottom: 10px;
}

.precision-text {
  font-size: 12px;
  color: #722ed1;
  line-height: 1.6;
}

.source-suitable {
  margin-bottom: 10px;
}

.suitable-title {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
}

.suitable-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suitable-tag {
  font-size: 11px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: #909399;
}

.meta-value {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.meta-value.highlight {
  color: #165DFF;
  font-weight: 600;
}

.source-pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.pros, .cons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pros-cons-title {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pros ul, .cons ul {
  margin: 0;
  padding-left: 20px;
}

.pros li, .cons li {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.source-alert {
  margin-top: 8px;
}

.lookup-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.copy-btn {
  margin-left: auto;
}

.confidence-tag {
  margin-left: auto;
  margin-right: 12px;
  font-weight: 600;
}

.query-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.query-mode-switch {
  flex-shrink: 0;
}

.query-mode-switch :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.precision-mode-switch {
  flex-shrink: 0;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f9f0ff;
  border-radius: 6px;
  border: 1px solid #d3adf7;
}

.switch-label {
  font-size: 14px;
  font-weight: 600;
  color: #722ed1;
}

.mode-tag {
  font-weight: 600;
}

.input-section {
  margin-bottom: 8px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
}

.quick-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 13px;
  color: #909399;
}

.example-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.example-tag:hover {
  color: #165DFF;
  border-color: #165DFF;
}

.text-input :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-tip {
  font-size: 12px;
  color: #f56c6c;
}

.result-card {
  margin-bottom: 24px;
}

.confidence-bar-wrapper,
.precision-bar-wrapper {
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.confidence-bar-wrapper {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.precision-bar-wrapper {
  background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
}

.confidence-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.confidence-bar-label span:first-child {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
}

.confidence-bar-label .score {
  font-size: 18px;
  font-weight: bold;
}

.confidence-levels,
.precision-levels-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.confidence-levels .level,
.precision-levels-bar .level {
  font-size: 11px;
  color: #c0c4cc;
}

.precision-levels-bar .level.small {
  font-size: 11px;
}

.confidence-levels .level.active.low {
  color: #f56c6c;
  font-weight: 600;
}

.confidence-levels .level.active.medium {
  color: #e6a23c;
  font-weight: 600;
}

.confidence-levels .level.active.high {
  color: #67c23a;
  font-weight: 600;
}

.precision-compare-card {
  margin-bottom: 24px;
}

.precision-compare-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
}

.precision-compare-item {
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.compare-source {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.compare-accuracy {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.mode-alert {
  margin-top: 4px;
}

.result-content {
  padding: 4px 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.result-item.primary {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border: 1px solid #b3d8ff;
}

.result-item.success {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border: 1px solid #c2e7b0;
}

.result-item.warning {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border: 1px solid #f5dab1;
}

.result-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  flex-shrink: 0;
}

.result-item.primary .result-icon {
  background: linear-gradient(135deg, #409eff, #165DFF);
}

.result-item.success .result-icon {
  background: linear-gradient(135deg, #67c23a, #529e2e);
}

.result-item.warning .result-icon {
  background: linear-gradient(135deg, #e6a23c, #cf9236);
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.result-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  word-break: break-all;
}

.field-consensus-card {
  margin-bottom: 24px;
}

.consensus-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consensus-item {
  padding: 14px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-left: 4px solid #67c23a;
  border-radius: 6px;
}

.consensus-item.disagreed {
  border-left-color: #e6a23c;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7cc 100%);
}

.consensus-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.precision-mini-tag {
  font-size: 11px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.consensus-value {
  font-size: 14px;
  margin-bottom: 4px;
}

.value-label {
  color: #909399;
}

.final-value {
  font-weight: 600;
  color: #165DFF;
}

.consensus-sources {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}

.sources-label {
  font-size: 12px;
  color: #909399;
  display: block;
  margin-bottom: 6px;
}

.source-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-value-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
}

.sources-detail-card {
  margin-bottom: 24px;
}

.source-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  flex-wrap: wrap;
}

.source-time {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.source-error {
  font-size: 12px;
  color: #f56c6c;
}

.source-detail {
  padding: 4px 0;
}

.source-failed {
  margin-bottom: 12px;
}

.confidence-reasons {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.reasons-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.confidence-reasons ul {
  margin: 0;
  padding-left: 20px;
}

.confidence-reasons li {
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.explanation-card {
  margin-bottom: 24px;
}

.explanation-section {
  margin-bottom: 16px;
}

.explanation-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.explanation-list {
  margin: 0;
  padding-left: 24px;
}

.explanation-list li {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.explanation-section.differences .explanation-list li {
  color: #e6a23c;
}

.explanation-section.recommendations .explanation-list li {
  color: #67c23a;
}

.explanation-section.precision-exp .explanation-list li {
  color: #722ed1;
}

.explanation-section.scenario .scenario-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.scenario-item {
  padding: 14px;
  background: #f5f9ff;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scenario-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #165DFF;
}

.scenario-advice {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.batch-table-wrapper {
  overflow-x: auto;
}

.batch-table-wrapper :deep(.el-table) {
  font-size: 13px;
}

.mono-font {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.history-card {
  margin-bottom: 24px;
}

.history-card .card-header {
  justify-content: space-between;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #ebeef5;
  gap: 16px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.history-ip {
  font-weight: 600;
  color: #165DFF;
  min-width: 140px;
}

.history-location {
  font-size: 13px;
  color: #606266;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  align-items: center;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
