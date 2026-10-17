import { Module } from '@nestjs/common';
import { ParameterService } from './parameters.service';
import { ParameterController } from './parameters.controller';

@Module({
  controllers: [ParameterController],
  providers: [ParameterService],
  exports: [ParameterService],
})
export class ParametersModule {}
