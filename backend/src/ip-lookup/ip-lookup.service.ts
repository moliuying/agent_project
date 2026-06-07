import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type PrecisionLevel = 'country' | 'province' | 'city' | 'district' | 'street';

export const PRECISION_LEVELS: { level: PrecisionLevel; label: string; score: number; description: string }[] = [
  { level: 'country', label: '国家级', score: 20, description: '仅能定位到国家，误差可能达数千公里' },
  { level: 'province', label: '省级', score: 40, description: '可定位到省/州一级，误差数百公里' },
  { level: 'city', label: '城市级', score: 60, description: '可定位到城市，误差通常50-200公里' },
  { level: 'district', label: '区县级', score: 80, description: '可定位到区县，误差通常10-50公里' },
  { level: 'street', label: '街道级', score: 95, description: '可定位到街道/商圈，误差通常1-10公里' },
];

export interface DataSourceInfo {
  id: string;
  name: string;
  description: string;
  baseReliability: number;
  coverage: string;
  updateFrequency: string;
  pros: string[];
  cons: string[];
  nominalPrecision: PrecisionLevel;
  precisionDescription: string;
  typicalAccuracyKm: string;
  suitableScenarios: string[];
}

export interface SingleSourceResult {
  source: DataSourceInfo;
  success: boolean;
  data?: IpLookupData;
  error?: string;
  responseTime: number;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  confidenceReasons: string[];
  actualPrecision: PrecisionLevel;
  actualPrecisionLabel: string;
  precisionScore: number;
}

export interface IpLookupData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  district?: string;
}

export interface FieldConsensus {
  field: string;
  label: string;
  agreed: boolean;
  values: { source: string; value: string }[];
  mostCommon: string;
  confidence: ConfidenceLevel;
  precisionLevel: PrecisionLevel;
  precisionLabel: string;
}

export interface PrecisionComparison {
  sourceName: string;
  precision: PrecisionLevel;
  precisionLabel: string;
  score: number;
  typicalAccuracy: string;
}

export interface IpLookupResult {
  ip: string;
  isLocal: boolean;
  isError?: boolean;
  errorMessage?: string;
  highPrecisionMode: boolean;
  consensus: IpLookupData;
  overallConfidence: ConfidenceLevel;
  overallConfidenceScore: number;
  overallPrecision: PrecisionLevel;
  overallPrecisionLabel: string;
  overallPrecisionScore: number;
  fieldConsensus: FieldConsensus[];
  sources: SingleSourceResult[];
  precisionComparison: PrecisionComparison[];
  explanation: {
    differences: string[];
    recommendations: string[];
    notes: string[];
    precisionExplanation: string[];
    scenarioAdvice: { scenario: string; advice: string; recommendedPrecision: string }[];
  };
}

const DATA_SOURCES: DataSourceInfo[] = [
  {
    id: 'ip-api',
    name: 'ip-api.com',
    description: '流行的免费IP地理定位服务，支持多种语言，国内数据较准确',
    baseReliability: 85,
    coverage: '全球覆盖，中国地区数据质量较好',
    updateFrequency: '每日更新数据库',
    pros: ['免费无需注册', '支持中文', '响应速度快', '数据字段丰富', '国内城市级精度较好'],
    cons: ['限制45次/分钟', '非商业使用', 'IPv6支持有限', '极少达到区县级'],
    nominalPrecision: 'city',
    precisionDescription: '标称城市级精度，国内大城市可接近区县级',
    typicalAccuracyKm: '50-200公里（国内主要城市可达10-50公里）',
    suitableScenarios: ['国内网站访问统计', '一般性用户地域分析', '内容地区适配'],
  },
  {
    id: 'ipwhois',
    name: 'ipwho.is',
    description: '提供IP地理定位和Whois信息的免费API服务，数据来自多个路由注册机构',
    baseReliability: 78,
    coverage: '全球覆盖，欧美地区精度较高',
    updateFrequency: '每周更新一次',
    pros: ['免费无需Key', '返回Whois注册信息', '支持IPv6', '无严格速率限制', 'AS号信息准确'],
    cons: ['中文支持一般', '国内精度一般', '响应速度中等', '城市级数据可能缺失'],
    nominalPrecision: 'province',
    precisionDescription: '标称省级精度，北美欧洲可达到城市级，国内通常仅省级',
    typicalAccuracyKm: '200-500公里（欧美可达50-100公里）',
    suitableScenarios: ['AS号/ISP查询', '国际流量分析', 'Whois注册信息查询'],
  },
  {
    id: 'ipapi',
    name: 'ipapi.co',
    description: '轻量级IP地理定位服务，企业级数据质量，北美欧洲数据精确',
    baseReliability: 82,
    coverage: '全球覆盖，北美欧洲数据质量高',
    updateFrequency: '每周更新，主要IP段每日校验',
    pros: ['接口简洁规范', '时区信息准确', '企业级数据源', '北美欧洲精度高'],
    cons: ['免费版限制1000次/天', '国内精度一般', '需HTTPS调用', '中文字段有限'],
    nominalPrecision: 'city',
    precisionDescription: '标称城市级精度，北美欧洲主要城市可达到区县级',
    typicalAccuracyKm: '50-200公里（北美欧洲可达10-50公里）',
    suitableScenarios: ['欧美用户分析', '国际业务地域定位', '时区精准查询'],
  },
];

@Injectable()
export class IpLookupService {
  private readonly LOCAL_IP_RANGES = [
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
    { start: '127.0.0.0', end: '127.255.255.255' },
    { start: '0.0.0.0', end: '0.0.0.0' },
  ];

  getAvailableSources(): DataSourceInfo[] {
    return DATA_SOURCES;
  }

  getPrecisionLevels() {
    return PRECISION_LEVELS;
  }

  private ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet, index) => {
      return acc + (parseInt(octet) << (24 - index * 8));
    }, 0) >>> 0;
  }

  private isPrivateIp(ip: string): boolean {
    if (ip === '::1' || ip === 'localhost') return true;
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return false;
    const ipLong = this.ipToLong(ip);
    return this.LOCAL_IP_RANGES.some(range => {
      return ipLong >= this.ipToLong(range.start) && ipLong <= this.ipToLong(range.end);
    });
  }

  private isValidIp(ip: string): boolean {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const ipv6ShortPattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip) || ipv6ShortPattern.test(ip);
  }

  private isValidDomain(domain: string): boolean {
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(domain) && domain.length <= 253;
  }

  private async resolveDomain(domain: string): Promise<string> {
    try {
      const addresses = await resolve4(domain);
      if (addresses.length > 0) return addresses[0];
    } catch {
      // ignore
    }
    try {
      const addresses = await resolve6(domain);
      if (addresses.length > 0) return addresses[0];
    } catch {
      // ignore
    }
    throw new Error(`无法解析域名: ${domain}`);
  }

  private determineActualPrecision(data: IpLookupData, sourceInfo: DataSourceInfo): { level: PrecisionLevel; label: string; score: number } {
    const hasCountry = !!data.country && data.country.length > 0;
    const hasProvince = !!data.regionName && data.regionName.length > 0;
    const hasCity = !!data.city && data.city.length > 0;
    const hasZip = !!data.zip && data.zip.length > 0;
    const hasCoords = Math.abs(data.latitude) > 0.01 || Math.abs(data.longitude) > 0.01;
    const hasDistrict = !!data.district && data.district.length > 0;

    const nominal = PRECISION_LEVELS.find(p => p.level === sourceInfo.nominalPrecision)!;
    let score = nominal.score;

    if (sourceInfo.id === 'ip-api') {
      const isCN = data.countryCode === 'CN' || data.country?.includes('中国');
      if (isCN && hasCity) score = 70;
      if (isCN && hasCity && hasZip) score = 78;
    } else if (sourceInfo.id === 'ipapi') {
      const isWestern = ['US', 'CA', 'GB', 'DE', 'FR', 'JP'].includes(data.countryCode || '');
      if (isWestern && hasCity) score = 75;
      if (isWestern && hasCity && hasZip) score = 82;
    }

    if (!hasCountry) return { level: 'country', label: '国家级（信息缺失）', score: 10 };
    if (!hasProvince) return { level: 'country', label: '国家级', score: Math.min(score, 25) };
    if (!hasCity) return { level: 'province', label: '省级', score: Math.min(score, 45) };
    if (!hasZip && !hasCoords) return { level: 'city', label: '城市级', score: Math.min(score, 62) };
    if (hasDistrict) return { level: 'street', label: '街道级', score: Math.min(score + 5, 92) };
    if (hasZip && hasCoords) return { level: 'district', label: '区县级', score: Math.min(score + 3, 83) };

    return { level: 'city', label: '城市级', score: Math.min(score, 60) };
  }

  private getPrecisionLabel(level: PrecisionLevel): string {
    return PRECISION_LEVELS.find(p => p.level === level)?.label || '未知';
  }

  private getFieldPrecision(field: string, data: IpLookupData): { level: PrecisionLevel; label: string } {
    const value = (data as any)[field];
    if (!value || value.length === 0) {
      return { level: 'country', label: '无数据' };
    }
    switch (field) {
      case 'country':
      case 'countryCode':
        return { level: 'country', label: '国家级' };
      case 'regionName':
      case 'region':
        return { level: 'province', label: '省级' };
      case 'city':
        return { level: 'city', label: '城市级' };
      case 'zip':
      case 'timezone':
        return { level: 'district', label: '区县级' };
      case 'latitude':
      case 'longitude':
        if (Math.abs(Number(value)) > 0.01) {
          return { level: 'district', label: '区县级' };
        }
        return { level: 'country', label: '无数据' };
      case 'isp':
      case 'org':
      case 'as':
        return { level: 'city', label: '城市级（ISP数据与位置关联）' };
      default:
        return { level: 'city', label: '城市级' };
    }
  }

  private async queryIpApi(ip: string): Promise<IpLookupData | null> {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=66846719`, { signal: AbortSignal.timeout(5000) });
      const data = await response.json();
      if (data.status !== 'success') return null;
      return {
        ip: data.query,
        country: data.country || '',
        countryCode: data.countryCode || '',
        region: data.region || '',
        regionName: data.regionName || '',
        city: data.city || '',
        zip: data.zip || '',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || '',
        isp: data.isp || '',
        org: data.org || '',
        as: data.as || '',
        district: data.district || '',
      };
    } catch {
      return null;
    }
  }

  private async queryIpWhoIs(ip: string): Promise<IpLookupData | null> {
    try {
      const response = await fetch(`https://ipwho.is/${ip}?lang=zh`, { signal: AbortSignal.timeout(5000) });
      const data = await response.json();
      if (!data.success) return null;
      return {
        ip: data.ip,
        country: data.country || '',
        countryCode: data.country_code || '',
        region: data.region_code || '',
        regionName: data.region || '',
        city: data.city || '',
        zip: data.postal || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone?.id || data.timezone || '',
        isp: data.connection?.isp || data.isp || '',
        org: data.connection?.org || data.org || '',
        as: data.connection?.asn ? `AS${data.connection.asn} ${data.connection.org || ''}`.trim() : (data.as || ''),
        district: '',
      };
    } catch {
      return null;
    }
  }

  private async queryIpApiCo(ip: string): Promise<IpLookupData | null> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(5000) });
      if (response.status === 429) return null;
      const data = await response.json();
      if (data.error) return null;
      return {
        ip: data.ip,
        country: data.country_name || '',
        countryCode: data.country_code || '',
        region: data.region_code || '',
        regionName: data.region || '',
        city: data.city || '',
        zip: data.postal || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || '',
        isp: data.org || '',
        org: data.org || '',
        as: data.asn || '',
        district: '',
      };
    } catch {
      return null;
    }
  }

  private async querySource(sourceId: string, ip: string): Promise<SingleSourceResult> {
    const sourceInfo = DATA_SOURCES.find(s => s.id === sourceId)!;
    const startTime = Date.now();
    
    let data: IpLookupData | null = null;
    let error: string | undefined;

    try {
      switch (sourceId) {
        case 'ip-api':
          data = await this.queryIpApi(ip);
          break;
        case 'ipwhois':
          data = await this.queryIpWhoIs(ip);
          break;
        case 'ipapi':
          data = await this.queryIpApiCo(ip);
          break;
      }
    } catch (e: any) {
      error = e?.message || '查询异常';
    }

    const responseTime = Date.now() - startTime;
    const success = !!data && !error;

    let confidenceScore = sourceInfo.baseReliability;
    const confidenceReasons: string[] = [];
    
    confidenceReasons.push(`数据源基础可信度: ${sourceInfo.baseReliability}分`);
    confidenceReasons.push(`标称精度: ${this.getPrecisionLabel(sourceInfo.nominalPrecision)}（${sourceInfo.typicalAccuracyKm}）`);
    
    if (responseTime < 500) {
      confidenceScore += 3;
      confidenceReasons.push('响应速度快 +3分');
    } else if (responseTime > 3000) {
      confidenceScore -= 5;
      confidenceReasons.push('响应速度较慢 -5分');
    }

    let actualPrecision: { level: PrecisionLevel; label: string; score: number };

    if (success) {
      actualPrecision = this.determineActualPrecision(data!, sourceInfo);
      confidenceReasons.push(`实际达到精度: ${actualPrecision.label}（精度分${actualPrecision.score}）`);

      if (data!.city && data!.city.length > 0) {
        confidenceScore += 2;
        confidenceReasons.push('返回城市级数据 +2分');
      }
      if (data!.isp && data!.isp.length > 0) {
        confidenceScore += 2;
        confidenceReasons.push('返回运营商信息 +2分');
      }
      if (Math.abs(data!.latitude) > 0.01 || Math.abs(data!.longitude) > 0.01) {
        confidenceScore += 1;
        confidenceReasons.push('返回经纬度坐标 +1分');
      }
    } else {
      confidenceScore = 0;
      confidenceReasons.push('查询失败');
      actualPrecision = { level: 'country', label: '查询失败', score: 0 };
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    let confidence: ConfidenceLevel = 'low';
    if (confidenceScore >= 80) confidence = 'high';
    else if (confidenceScore >= 60) confidence = 'medium';

    return {
      source: sourceInfo,
      success,
      data: data || undefined,
      error,
      responseTime,
      confidence,
      confidenceScore,
      confidenceReasons,
      actualPrecision: actualPrecision.level,
      actualPrecisionLabel: actualPrecision.label,
      precisionScore: actualPrecision.score,
    };
  }

  private calculateFieldConsensus(results: SingleSourceResult[], highPrecisionMode: boolean): FieldConsensus[] {
    const validResults = results.filter(r => r.success && r.data);
    const fields: { key: keyof IpLookupData; label: string }[] = [
      { key: 'country', label: '国家/地区' },
      { key: 'countryCode', label: '国家代码' },
      { key: 'regionName', label: '省份/州' },
      { key: 'city', label: '城市' },
      { key: 'timezone', label: '时区' },
      { key: 'isp', label: '运营商' },
      { key: 'org', label: '组织' },
    ];

    return fields.map(field => {
      const values = validResults.map(r => ({
        source: r.source.name,
        value: (r.data![field.key] as string) || '未知',
        precisionScore: r.precisionScore,
        weight: highPrecisionMode ? (r.precisionScore / 100 + 0.5) : 1,
      }));

      const weightedCounts = new Map<string, number>();
      values.forEach(v => {
        weightedCounts.set(v.value, (weightedCounts.get(v.value) || 0) + v.weight);
      });

      let mostCommon = '未知';
      let maxWeight = 0;
      weightedCounts.forEach((weight, value) => {
        if (weight > maxWeight) {
          maxWeight = weight;
          mostCommon = value;
        }
      });

      const simpleCounts = new Map<string, number>();
      values.forEach(v => {
        simpleCounts.set(v.value, (simpleCounts.get(v.value) || 0) + 1);
      });
      const simpleMax = Math.max(...simpleCounts.values());

      const agreed = simpleMax === validResults.length && validResults.length > 0;
      
      let confidence: ConfidenceLevel = 'low';
      const totalWeight = values.reduce((s, v) => s + v.weight, 0);
      const ratio = totalWeight > 0 ? maxWeight / totalWeight : 0;
      if (ratio >= 0.8) confidence = 'high';
      else if (ratio >= 0.5) confidence = 'medium';

      const bestPrecisionResult = validResults.length > 0 
        ? [...validResults].sort((a, b) => b.precisionScore - a.precisionScore)[0] 
        : null;
      const fieldPrecision = bestPrecisionResult 
        ? this.getFieldPrecision(field.key, bestPrecisionResult.data!)
        : { level: 'country' as PrecisionLevel, label: '无数据' };

      return {
        field: field.key,
        label: field.label,
        agreed,
        values: values.map(v => ({ source: v.source, value: v.value })),
        mostCommon,
        confidence,
        precisionLevel: fieldPrecision.level,
        precisionLabel: fieldPrecision.label,
      };
    });
  }

  private buildConsensus(results: SingleSourceResult[], ip: string, highPrecisionMode: boolean): IpLookupData {
    const validResults = results.filter(r => r.success && r.data);
    if (validResults.length === 0) {
      return {
        ip,
        country: '',
        countryCode: '',
        region: '',
        regionName: '',
        city: '',
        zip: '',
        latitude: 0,
        longitude: 0,
        timezone: '',
        isp: '',
        org: '',
        as: '',
      };
    }

    const sortedByPrecision = [...validResults].sort((a, b) => {
      if (highPrecisionMode) {
        return b.precisionScore * 1.5 + b.confidenceScore - (a.precisionScore * 1.5 + a.confidenceScore);
      }
      return b.confidenceScore - a.confidenceScore;
    });

    const fieldConsensus = this.calculateFieldConsensus(results, highPrecisionMode);
    const consensus: IpLookupData = {
      ip,
      country: fieldConsensus.find(f => f.field === 'country')!.mostCommon,
      countryCode: fieldConsensus.find(f => f.field === 'countryCode')!.mostCommon,
      region: sortedByPrecision[0].data!.region,
      regionName: fieldConsensus.find(f => f.field === 'regionName')!.mostCommon,
      city: fieldConsensus.find(f => f.field === 'city')!.mostCommon,
      zip: sortedByPrecision[0].data!.zip,
      latitude: sortedByPrecision[0].data!.latitude,
      longitude: sortedByPrecision[0].data!.longitude,
      timezone: fieldConsensus.find(f => f.field === 'timezone')!.mostCommon,
      isp: fieldConsensus.find(f => f.field === 'isp')!.mostCommon,
      org: fieldConsensus.find(f => f.field === 'org')!.mostCommon,
      as: sortedByPrecision[0].data!.as,
    };

    return consensus;
  }

  private generatePrecisionExplanation(results: SingleSourceResult[], highPrecisionMode: boolean, overallPrecisionScore: number): {
    precisionExplanation: string[];
    scenarioAdvice: { scenario: string; advice: string; recommendedPrecision: string }[];
  } {
    const precisionExplanation: string[] = [];
    const scenarioAdvice: { scenario: string; advice: string; recommendedPrecision: string }[] = [];

    const successSources = results.filter(r => r.success);
    if (successSources.length > 0) {
      const best = [...successSources].sort((a, b) => b.precisionScore - a.precisionScore)[0];
      const worst = [...successSources].sort((a, b) => a.precisionScore - b.precisionScore)[0];
      precisionExplanation.push(`本次查询精度范围：${worst.actualPrecisionLabel} ~ ${best.actualPrecisionLabel}`);
      precisionExplanation.push(`精度最高数据源：「${best.source.name}」达到 ${best.actualPrecisionLabel}（${best.source.typicalAccuracyKm}）`);
      precisionExplanation.push(`精度最低数据源：「${worst.source.name}」为 ${worst.actualPrecisionLabel}（${worst.source.typicalAccuracyKm}）`);
    }

    if (highPrecisionMode) {
      precisionExplanation.push('当前为高精度模式：结果优先采用精度评分更高的数据源，并对高精准度数据源赋予1.5倍权重');
    } else {
      precisionExplanation.push('当前为标准模式：结果基于多数投票，综合考虑可信度和精度。切换高精度模式可获得更细粒度定位');
    }

    precisionExplanation.push('IP地理定位并非GPS，无法获取街道门牌号级精确位置。"街道级"通常指可定位到城市内主要商圈/行政区范围');

    scenarioAdvice.push({
      scenario: '网站访问统计 / 内容地区推荐',
      advice: '省级或城市级精度足够，可使用标准模式',
      recommendedPrecision: '省级 ~ 城市级',
    });
    scenarioAdvice.push({
      scenario: '安全风控 / 异常登录检测',
      advice: '建议使用高精度模式，重点关注城市级一致性判断异常',
      recommendedPrecision: '城市级以上',
    });
    scenarioAdvice.push({
      scenario: '广告精准投放 / LBS营销',
      advice: '需要区县级精度，但应考虑IP定位天然误差，建议配合其他维度',
      recommendedPrecision: '区县级（仍需注意5-50公里误差）',
    });
    scenarioAdvice.push({
      scenario: '合规审核 / 司法取证',
      advice: 'IP定位仅作辅助参考，不具备法律效力，不能作为用户实际位置的唯一证据',
      recommendedPrecision: '仅作参考，需配合其他数据',
    });
    scenarioAdvice.push({
      scenario: 'CDN加速 / 就近路由',
      advice: '城市级或省级精度通常足够，运营商(ISP)信息比地理位置更重要',
      recommendedPrecision: '省级 + ISP信息',
    });

    return { precisionExplanation, scenarioAdvice };
  }

  private generateExplanation(
    results: SingleSourceResult[], 
    fieldConsensus: FieldConsensus[],
    highPrecisionMode: boolean,
    overallPrecisionScore: number,
  ): {
    differences: string[];
    recommendations: string[];
    notes: string[];
    precisionExplanation: string[];
    scenarioAdvice: { scenario: string; advice: string; recommendedPrecision: string }[];
  } {
    const differences: string[] = [];
    const recommendations: string[] = [];
    const notes: string[] = [];

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    notes.push(`共查询 ${totalCount} 个数据源，成功 ${successCount} 个，失败 ${totalCount - successCount} 个`);

    if (totalCount - successCount > 0) {
      const failed = results.filter(r => !r.success);
      failed.forEach(r => {
        notes.push(`数据源「${r.source.name}」查询失败: ${r.error || '未知原因'}`);
      });
    }

    const disagreeFields = fieldConsensus.filter(f => !f.agreed && f.values.length > 1);
    disagreeFields.forEach(field => {
      const valueStr = field.values.map(v => `${v.source}: ${v.value || '未知'}`).join(' / ');
      differences.push(`${field.label}存在差异（${field.precisionLabel}）：${valueStr}`);
    });

    if (disagreeFields.length === 0) {
      recommendations.push('所有数据源结果完全一致，可信度很高，可直接使用');
    } else if (disagreeFields.length <= 2) {
      recommendations.push('大部分字段一致，仅少数字段存在差异，建议以多数数据源结果为准');
      if (highPrecisionMode) {
        recommendations.push('高精度模式下已优先采用精度更高的数据源结果');
      } else {
        recommendations.push('如需更高精度，可切换到「高精度模式」，系统将对精准数据源加权');
      }
      recommendations.push('存在差异的字段可结合业务场景进一步验证');
    } else {
      recommendations.push('多个字段存在差异，建议优先使用高可信度数据源的结果');
      if (!highPrecisionMode) {
        recommendations.push('建议切换到「高精度模式」以获得更可靠的细粒度定位');
      }
      const bestSource = [...results].filter(r => r.success).sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
      if (bestSource) {
        recommendations.push(`当前可信度最高的数据源是「${bestSource.source.name}」(${bestSource.confidenceScore}分，${bestSource.actualPrecisionLabel})`);
      }
    }

    notes.push('IP地理定位存在天然误差：国家级数千公里、省级数百公里、城市级50-200公里、区县级10-50公里');
    notes.push('不同数据源的数据更新频率不同（每日~每周），新分配IP段可能存在识别偏差');
    notes.push('对于VPN、代理、CDN、移动网络等IP，地理位置可能指向代理服务器出口而非真实用户位置');
    notes.push('移动网络（4G/5G）通常定位到地市核心网机房，精度一般为城市级');

    results.forEach(r => {
      if (r.success) {
        notes.push(`「${r.source.name}」响应 ${r.responseTime}ms，可信度${r.confidenceScore}分，精度${r.actualPrecisionLabel}`);
      }
    });

    const { precisionExplanation, scenarioAdvice } = this.generatePrecisionExplanation(results, highPrecisionMode, overallPrecisionScore);

    return { differences, recommendations, notes, precisionExplanation, scenarioAdvice };
  }

  async lookup(input: string, highPrecisionMode: boolean = false): Promise<IpLookupResult> {
    const trimmedInput = input.trim().toLowerCase();

    if (!trimmedInput) {
      throw new Error('请输入IP地址或域名');
    }

    let ip: string;

    if (this.isValidIp(trimmedInput)) {
      ip = trimmedInput;
    } else if (this.isValidDomain(trimmedInput)) {
      ip = await this.resolveDomain(trimmedInput);
    } else {
      throw new Error('无效的IP地址或域名格式');
    }

    if (this.isPrivateIp(ip)) {
      const localData: IpLookupData = {
        ip,
        country: '局域网',
        countryCode: 'LAN',
        region: '内网',
        regionName: '内网地址',
        city: '本地',
        zip: '',
        latitude: 0,
        longitude: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: '本地网络',
        org: '局域网',
        as: 'AS-LOCAL',
      };

      const localSource: SingleSourceResult = {
        source: {
          id: 'local',
          name: '本地检测',
          description: '基于RFC 1918标准的私有IP地址检测',
          baseReliability: 100,
          coverage: '标准私有IP段',
          updateFrequency: '不适用',
          pros: ['判定准确率100%', '基于国际标准'],
          cons: ['仅识别私有IP地址'],
          nominalPrecision: 'street',
          precisionDescription: '精确判定为私有地址',
          typicalAccuracyKm: '不适用',
          suitableScenarios: ['内网IP识别'],
        },
        success: true,
        data: localData,
        responseTime: 1,
        confidence: 'high',
        confidenceScore: 100,
        confidenceReasons: ['基于RFC 1918标准判定', '私有IP地址范围固定不变'],
        actualPrecision: 'street',
        actualPrecisionLabel: '局域网（私有地址）',
        precisionScore: 100,
      };

      const fieldConsensus = this.calculateFieldConsensus([localSource], highPrecisionMode);

      return {
        ip,
        isLocal: true,
        highPrecisionMode,
        consensus: localData,
        overallConfidence: 'high',
        overallConfidenceScore: 100,
        overallPrecision: 'street',
        overallPrecisionLabel: '局域网（私有地址）',
        overallPrecisionScore: 100,
        fieldConsensus,
        sources: [localSource],
        precisionComparison: [{
          sourceName: localSource.source.name,
          precision: localSource.actualPrecision,
          precisionLabel: localSource.actualPrecisionLabel,
          score: localSource.precisionScore,
          typicalAccuracy: '不适用',
        }],
        explanation: {
          differences: [],
          recommendations: ['该IP为局域网私有地址，仅在内网环境中可访问，公网无法路由到该地址'],
          notes: [
            '私有IP地址范围（RFC 1918）：10.0.0.0/8、172.16.0.0/12、192.168.0.0/16',
            '回环地址：127.0.0.0/8',
            '此类IP不对应真实地理位置，仅表示本地/内网环境',
          ],
          precisionExplanation: ['私有IP地址由RFC 1918标准定义，不属于公网可路由地址，无实际地理位置意义'],
          scenarioAdvice: [{
            scenario: '该IP为内网地址',
            advice: '无需进行地理定位，仅用于内网环境',
            recommendedPrecision: '不适用',
          }],
        },
      };
    }

    const results = await Promise.all(
      DATA_SOURCES.map(source => this.querySource(source.id, ip))
    );

    const consensus = this.buildConsensus(results, ip, highPrecisionMode);
    const fieldConsensus = this.calculateFieldConsensus(results, highPrecisionMode);

    const successResults = results.filter(r => r.success);
    let overallConfidenceScore = 0;
    let overallPrecisionScore = 0;
    if (successResults.length > 0) {
      if (highPrecisionMode) {
        const weightedConfidenceSum = successResults.reduce((sum, r) => sum + r.confidenceScore * (r.precisionScore / 100 + 0.5), 0);
        const weightSum = successResults.reduce((sum, r) => sum + (r.precisionScore / 100 + 0.5), 0);
        overallConfidenceScore = Math.round(weightedConfidenceSum / weightSum);
      } else {
        overallConfidenceScore = Math.round(
          successResults.reduce((sum, r) => sum + r.confidenceScore, 0) / successResults.length
        );
      }

      const agreementBonus = fieldConsensus.filter(f => f.agreed).length / fieldConsensus.length * 15;
      const sourceCountBonus = Math.min(successResults.length * 3, 9);
      overallConfidenceScore = Math.min(100, overallConfidenceScore + agreementBonus + sourceCountBonus);

      overallPrecisionScore = Math.round(
        successResults.reduce((sum, r) => sum + r.precisionScore, 0) / successResults.length
      );
      if (highPrecisionMode) {
        overallPrecisionScore = Math.min(100, overallPrecisionScore + 5);
      }
    }

    let overallConfidence: ConfidenceLevel = 'low';
    if (overallConfidenceScore >= 80) overallConfidence = 'high';
    else if (overallConfidenceScore >= 60) overallConfidence = 'medium';

    let overallPrecision: PrecisionLevel = 'country';
    let overallPrecisionLabel = '国家级';
    for (let i = PRECISION_LEVELS.length - 1; i >= 0; i--) {
      if (overallPrecisionScore >= PRECISION_LEVELS[i].score) {
        overallPrecision = PRECISION_LEVELS[i].level;
        overallPrecisionLabel = PRECISION_LEVELS[i].label;
        break;
      }
    }

    const explanation = this.generateExplanation(results, fieldConsensus, highPrecisionMode, overallPrecisionScore);

    const precisionComparison: PrecisionComparison[] = successResults.map(r => ({
      sourceName: r.source.name,
      precision: r.actualPrecision,
      precisionLabel: r.actualPrecisionLabel,
      score: r.precisionScore,
      typicalAccuracy: r.source.typicalAccuracyKm,
    }));

    return {
      ip,
      isLocal: false,
      highPrecisionMode,
      consensus,
      overallConfidence,
      overallConfidenceScore,
      overallPrecision,
      overallPrecisionLabel,
      overallPrecisionScore,
      fieldConsensus,
      sources: results,
      precisionComparison,
      explanation,
    };
  }

  async batchLookup(inputs: string[], highPrecisionMode: boolean = false): Promise<IpLookupResult[]> {
    const results: IpLookupResult[] = [];
    for (const input of inputs) {
      try {
        const result = await this.lookup(input, highPrecisionMode);
        results.push(result);
      } catch (error) {
        results.push({
          ip: input,
          isLocal: false,
          isError: true,
          highPrecisionMode,
          errorMessage: error instanceof Error ? error.message : '未知错误',
          consensus: {
            ip: input,
            country: '查询失败',
            countryCode: 'ERR',
            region: '',
            regionName: error instanceof Error ? error.message : '未知错误',
            city: '',
            zip: '',
            latitude: 0,
            longitude: 0,
            timezone: '',
            isp: '',
            org: '',
            as: '',
          },
          overallConfidence: 'low',
          overallConfidenceScore: 0,
          overallPrecision: 'country',
          overallPrecisionLabel: '未知',
          overallPrecisionScore: 0,
          fieldConsensus: [],
          sources: [],
          precisionComparison: [],
          explanation: {
            differences: [],
            recommendations: [],
            notes: [error instanceof Error ? error.message : '查询失败'],
            precisionExplanation: [],
            scenarioAdvice: [],
          },
        });
      }
    }
    return results;
  }
}
