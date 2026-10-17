import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('เชื่อมต่อฐานข้อมูล Supabase PostgreSQL ผ่าน Prisma ORM สำเร็จ');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        'ยังไม่สามารถเชื่อมต่อ Supabase PostgreSQL ได้ (กรุณาตรวจสอบ DATABASE_URL ในไฟล์ .env) ระบบจะสลับใช้ชุดข้อมูลสำรองในหน่วยความจำชั่วคราวเพื่อให้ทดสอบ API ได้ต่อเนื่อง',
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
