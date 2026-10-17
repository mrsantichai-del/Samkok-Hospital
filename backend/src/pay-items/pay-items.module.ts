import { Module } from '@nestjs/common';
import { PayItemService } from './pay-items.service';
import { PayItemController } from './pay-items.controller';

@Module({
  controllers: [PayItemController],
  providers: [PayItemService],
  exports: [PayItemService],
})
export class PayItemsModule {}
