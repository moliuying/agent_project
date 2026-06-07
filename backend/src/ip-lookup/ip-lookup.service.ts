import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DataSourceInfo {
  id: string;
  name: string;
  description: string;
  baseReliability: number;
  coverage: string;
  updateFrequency: string;
  pros: string[];
  cons: string[];
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
}

export interface FieldConsensus {
  field: string;
  label: string;
  agreed: boolean;
  values: { source: string; value: string }[];
  mostCommon: string;
  confidence: ConfidenceLevel;
}

export interface IpLookupResult {
  ip: string;
  isLocal: boolean;
  isError?: boolean;
  errorMessage?: string;
  consensus: IpLookupData;
  overallConfidence: ConfidenceLevel;
  overallConfidenceScore: number;
  fieldConsensus: FieldConsensus[];
  sources: SingleSourceResult[];
  explanation: {
    differences: string[];
    recommendations: string[];
    notes: string[];
  };
}

const DATA_SOURCES: DataSourceInfo[] = [
  {
    id: 'ip-api',
    name: 'ip-api.com',
    description: '流行的免费IP地理定位服务，支持多种语言，数据更新较频繁',
    baseReliability: 85,
    coverage: '全球，国内数据较准确',
    updateFrequency: '每日更新',
    pros: ['免费无需注册', '支持中文', '响应速度快', '数据字段丰富'],
    cons: ['限制45次/分钟', '非商业使用', 'IPv6支持有限']
  },
  {
    id: 'ipwhois',
    name: 'ipwho.is',
    description: '提供IP地理定位和Whois信息的免费API服务',
    baseReliability: 80,
    coverage: '全球覆盖',
    updateFrequency: '每周更新',
    pros: ['免费无需Key', '返回Whois信息', '支持IPv6', '无严格速率限制'],
    cons: ['中文支持一般', '字段较少', '响应速度中等']
  },
  {
    id: 'ipapi',
    name: 'ipapi.co',
    description: '轻量级IP地理定位服务，提供企业级数据',
    baseReliability: 82,
    coverage: '全球覆盖，北美欧洲较准',
    updateFrequency: '每周更新',
    pros: ['接口简洁', '数据格式规范', '时区信息准确'],
    cons: ['免费版限制1000次/天', '国内精度一般', '需HTTPS调用']
  }
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
    
    if (responseTime < 500) {
      confidenceScore += 3;
      confidenceReasons.push('响应速度快 +3分');
    } else if (responseTime > 3000) {
      confidenceScore -= 5;
      confidenceReasons.push('响应速度较慢 -5分');
    }

    if (success) {
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
    };
  }

  private calculateFieldConsensus(results: SingleSourceResult[]): FieldConsensus[] {
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
        value: (r.data![field.key] as string) || '未知'
      }));

      const valueCounts = new Map<string, number>();
      values.forEach(v => {
        valueCounts.set(v.value, (valueCounts.get(v.value) || 0) + 1);
      });

      let mostCommon = '未知';
      let maxCount = 0;
      valueCounts.forEach((count, value) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = value;
        }
      });

      const agreed = maxCount === validResults.length && validResults.length > 0;
      
      let confidence: ConfidenceLevel = 'low';
      const ratio = validResults.length > 0 ? maxCount / validResults.length : 0;
      if (ratio >= 0.8) confidence = 'high';
      else if (ratio >= 0.5) confidence = 'medium';

      return {
        field: field.key,
        label: field.label,
        agreed,
        values,
        mostCommon,
        confidence,
      };
    });
  }

  private buildConsensus(results: SingleSourceResult[], ip: string): IpLookupData {
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

    const sortedByConfidence = [...validResults].sort(
      (a, b) => b.confidenceScore - a.confidenceScore
    );

    const fieldConsensus = this.calculateFieldConsensus(results);
    const consensus: IpLookupData = {
      ip,
      country: fieldConsensus.find(f => f.field === 'country')!.mostCommon,
      countryCode: fieldConsensus.find(f => f.field === 'countryCode')!.mostCommon,
      region: sortedByConfidence[0].data!.region,
      regionName: fieldConsensus.find(f => f.field === 'regionName')!.mostCommon,
      city: fieldConsensus.find(f => f.field === 'city')!.mostCommon,
      zip: sortedByConfidence[0].data!.zip,
      latitude: sortedByConfidence[0].data!.latitude,
      longitude: sortedByConfidence[0].data!.longitude,
      timezone: fieldConsensus.find(f => f.field === 'timezone')!.mostCommon,
      isp: fieldConsensus.find(f => f.field === 'isp')!.mostCommon,
      org: fieldConsensus.find(f => f.field === 'org')!.mostCommon,
      as: sortedByConfidence[0].data!.as,
    };

    return consensus;
  }

  private generateExplanation(results: SingleSourceResult[], fieldConsensus: FieldConsensus[]): {
    differences: string[];
    recommendations: string[];
    notes: string[];
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
      differences.push(`${field.label}存在差异：${valueStr}`);
    });

    if (disagreeFields.length === 0) {
      recommendations.push('所有数据源结果完全一致，可信度很高，可直接使用');
    } else if (disagreeFields.length <= 2) {
      recommendations.push('大部分字段一致，仅少数字段存在差异，建议以多数数据源结果为准');
      recommendations.push('存在差异的字段可结合业务场景进一步验证');
    } else {
      recommendations.push('多个字段存在差异，建议优先使用高可信度数据源的结果');
      const bestSource = [...results].filter(r => r.success).sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
      if (bestSource) {
        recommendations.push(`当前可信度最高的数据源是「${bestSource.source.name}」(${bestSource.confidenceScore}分)`);
      }
    }

    notes.push('IP地理定位存在天然误差，城市级精度通常为50-200公里范围');
    notes.push('不同数据源的数据更新频率不同，新IP段可能存在识别偏差');
    notes.push('对于VPN、代理、CDN等IP，地理位置可能指向代理服务器而非真实用户位置');

    results.forEach(r => {
      if (r.success) {
        notes.push(`「${r.source.name}」响应时间 ${r.responseTime}ms，可信度评分 ${r.confidenceScore}分`);
      }
    });

    return { differences, recommendations, notes };
  }

  async lookup(input: string): Promise<IpLookupResult> {
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
          cons: ['仅识别私有IP地址']
        },
        success: true,
        data: localData,
        responseTime: 1,
        confidence: 'high',
        confidenceScore: 100,
        confidenceReasons: ['基于RFC 1918标准判定', '私有IP地址范围固定不变'],
      };

      return {
        ip,
        isLocal: true,
        consensus: localData,
        overallConfidence: 'high',
        overallConfidenceScore: 100,
        fieldConsensus: this.calculateFieldConsensus([localSource]),
        sources: [localSource],
        explanation: {
          differences: [],
          recommendations: ['该IP为局域网私有地址，仅在内网环境中可访问'],
          notes: [
            '私有IP地址范围（RFC 1918）：10.0.0.0/8、172.16.0.0/12、192.168.0.0/16',
            '回环地址：127.0.0.0/8',
          ],
        },
      };
    }

    const results = await Promise.all(
      DATA_SOURCES.map(source => this.querySource(source.id, ip))
    );

    const consensus = this.buildConsensus(results, ip);
    const fieldConsensus = this.calculateFieldConsensus(results);

    const successResults = results.filter(r => r.success);
    let overallConfidenceScore = 0;
    if (successResults.length > 0) {
      const avgScore = successResults.reduce((sum, r) => sum + r.confidenceScore, 0) / successResults.length;
      const agreementBonus = fieldConsensus.filter(f => f.agreed).length / fieldConsensus.length * 15;
      const sourceCountBonus = Math.min(successResults.length * 3, 9);
      overallConfidenceScore = Math.round(avgScore + agreementBonus + sourceCountBonus);
      overallConfidenceScore = Math.min(100, overallConfidenceScore);
    }

    let overallConfidence: ConfidenceLevel = 'low';
    if (overallConfidenceScore >= 80) overallConfidence = 'high';
    else if (overallConfidenceScore >= 60) overallConfidence = 'medium';

    const explanation = this.generateExplanation(results, fieldConsensus);

    return {
      ip,
      isLocal: false,
      consensus,
      overallConfidence,
      overallConfidenceScore,
      fieldConsensus,
      sources: results,
      explanation,
    };
  }

  async batchLookup(inputs: string[]): Promise<IpLookupResult[]> {
    const results: IpLookupResult[] = [];
    for (const input of inputs) {
      try {
        const result = await this.lookup(input);
        results.push(result);
      } catch (error) {
        results.push({
          ip: input,
          isLocal: false,
          isError: true,
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
          fieldConsensus: [],
          sources: [],
          explanation: {
            differences: [],
            recommendations: [],
            notes: [error instanceof Error ? error.message : '查询失败'],
          },
        });
      }
    }
    return results;
  }
}
