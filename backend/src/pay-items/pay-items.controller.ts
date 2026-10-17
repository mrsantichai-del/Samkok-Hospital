import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { PayItemService } from './pay-items.service';

@Controller('pay-items')
export class PayItemController {
  constructor(private readonly payItemService: PayItemService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    return this.payItemService.findAll(type);
  }

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    return this.payItemService.savePayItemType(dto, req.user?.userId);
  }

  @Put()
  async update(@Body() dto: any, @Req() req: any) {
    return this.payItemService.savePayItemType(dto, req.user?.userId);
  }
}
