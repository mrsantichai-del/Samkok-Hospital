import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { ParameterService } from './parameters.service';
import { SaveParameterDto } from './dto/save-parameter.dto';

@Controller('parameters')
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.parameterService.findAll(category);
  }

  @Post()
  async createParameter(@Body() dto: SaveParameterDto, @Req() req: any) {
    return this.parameterService.saveParameter(dto, req.user?.userId);
  }

  @Put()
  async updateParameter(@Body() dto: SaveParameterDto, @Req() req: any) {
    return this.parameterService.saveParameter(dto, req.user?.userId);
  }
}
