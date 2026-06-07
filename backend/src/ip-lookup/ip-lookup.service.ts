import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
  message?: string;
}

export interface IpLookupResult {
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
  isLocal: boolean;
}

@Injectable()
export class IpLookupService {
  private readonly LOCAL_IP_RANGES = [
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
    { start: '127.0.0.0', end: '127.255.255.255' },
    { start: '0.0.0.0', end: '0.0.0.0' },
  ];

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
      // ignore and try IPv6
    }
    try {
      const addresses = await resolve6(domain);
      if (addresses.length > 0) return addresses[0];
    } catch {
      // ignore
    }
    throw new Error(`无法解析域名: ${domain}`);
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
      return {
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
        isLocal: true,
      };
    }

    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=66846719`);
      const data: IpApiResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || '查询失败，请稍后重试');
      }

      return {
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
        isLocal: false,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('无法解析') || error.message.includes('无效的')) {
        throw error;
      }
      throw new Error('IP查询服务暂时不可用，请稍后重试');
    }
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
          isLocal: false,
        });
      }
    }
    return results;
  }
}
