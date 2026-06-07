import { Controller, Get, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IpLookupService, IpLookupResult } from './ip-lookup.service';

@Controller('ip-lookup')
export class IpLookupController {
  constructor(private readonly ipLookupService: IpLookupService) {}

  @Get(':ip')
  async lookup(@Param('ip') ip: string): Promise<IpLookupResult> {
    try {
      return await this.ipLookupService.lookup(ip);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : '查询失败',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('batch')
  async batchLookup(@Body() body: { ips: string[] }): Promise<IpLookupResult[]> {
    if (!body.ips || !Array.isArray(body.ips)) {
      throw new HttpException('请提供IP地址或域名列表', HttpStatus.BAD_REQUEST);
    }
    if (body.ips.length > 50) {
      throw new HttpException('单次最多查询50个IP或域名', HttpStatus.BAD_REQUEST);
    }
    return await this.ipLookupService.batchLookup(body.ips);
  }
}
