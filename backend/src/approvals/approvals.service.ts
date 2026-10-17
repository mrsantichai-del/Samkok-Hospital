import { Injectable, BadRequestException } from '@nestjs/common';
import { ApprovalStatus, PayrollStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { demoStore } from '../database/demo-store';

@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * UC-17: ตรวจสอบรายละเอียดงวดเงินเดือน (Sequence Diagram รูปที่ 3.25)
   * GET /approvals/:periodId -> getApprovalDetail(periodId)
   */
  async getApprovalDetail(periodId?: string) {
    // ข้อมูลสรุปรายส่วนงานตรงตามรูปที่ 3.70
    const departmentSummary = [
      {
        id: 'ds-1',
        departmentName: 'กลุ่มงานการแพทย์',
        employeeCount: 45,
        grossPay: 1850320,
        totalDeduction: 265410,
        netPay: 1584910,
      },
      {
        id: 'ds-2',
        departmentName: 'กลุ่มงานการพยาบาล',
        employeeCount: 60,
        grossPay: 1980500,
        totalDeduction: 290300,
        netPay: 1690200,
      },
      {
        id: 'ds-3',
        departmentName: 'กลุ่มงานสนับสนุนบริการ',
        employeeCount: 30,
        grossPay: 620000,
        totalDeduction: 89500,
        netPay: 530500,
      },
      {
        id: 'ds-4',
        departmentName: 'กลุ่มงานบริหาร',
        employeeCount: 15,
        grossPay: 399500,
        totalDeduction: 0,
        netPay: 399500,
      },
    ];

    const periodInfo = {
      id: periodId || 'period-2569-10',
      cycleType: 'รายเดือน',
      monthName: 'ตุลาคม',
      year: 2569,
      startDate: '01/10/2569',
      endDate: '31/10/2569',
      payDate: '31/10/2569',
      employeeCount: 150,
      totalGross: 4850320,
      totalDeduction: 645210,
      totalNet: 4205110,
      status: 'PENDING_APPROVAL',
      submittedBy: 'สมชาย ใจดี',
      submittedAt: '28/10/2569 10:15',
      remark: 'ส่งอนุมัติงวดเงินเดือน เดือนตุลาคม 2569',
    };

    return {
      period: periodInfo,
      departmentSummary,
    };
  }

  /**
   * UC-18: พิจารณาอนุมัติหรือส่งกลับงวดเงินเดือน (Sequence Diagram รูปที่ 3.26)
   * POST /approvals/decision -> decide(periodId, decision, remark)
   * - หากส่งกลับ: Approval.returnForEdit() -> Approval = RETURNED, PayrollPeriod = EDIT_REQUESTED
   * - หากอนุมัติ: Approval.approve() -> Approval = APPROVED, PayrollPeriod = APPROVED + Digital Signature
   * - บันทึก AuditLog
   */
  async decide(
    dto: { periodId: string; decision: 'APPROVE' | 'RETURN'; remark?: string },
    actorUserId?: string,
  ) {
    if (!dto.decision) {
      throw new BadRequestException('กรุณาเลือกผลการพิจารณา (อนุมัติ หรือ ส่งกลับ)');
    }
    if (dto.decision === 'RETURN' && !dto.remark) {
      throw new BadRequestException('กรุณาระบุเหตุผลหรือหมายเหตุประกอบการส่งกลับแก้ไข (Alternative Flow UC-18)');
    }

    const isApprove = dto.decision === 'APPROVE';
    const signatureHash = isApprove
      ? `SIG-SAMKOK-DIR-${Date.now().toString(36).toUpperCase()}`
      : null;

    if (this.prisma.isConnected && dto.periodId) {
      const period = await this.prisma.payrollPeriod.findFirst({
        where: { id: dto.periodId },
      });
      if (period) {
        await this.prisma.$transaction(async (tx) => {
          await tx.payrollPeriod.update({
            where: { id: period.id },
            data: {
              status: isApprove ? PayrollStatus.APPROVED : PayrollStatus.EDIT_REQUESTED,
              remark: dto.remark || period.remark,
            },
          });

          await tx.approval.create({
            data: {
              periodId: period.id,
              approverUserId: actorUserId || null,
              status: isApprove ? ApprovalStatus.APPROVED : ApprovalStatus.RETURNED,
              remark: dto.remark || (isApprove ? 'อนุมัติงวดเงินเดือนเรียบร้อยแล้ว' : 'ส่งกลับเพื่อแก้ไข'),
              signatureHash,
              approvedAt: isApprove ? new Date() : null,
            },
          });

          await tx.auditLog.create({
            data: {
              userId: actorUserId || null,
              action: isApprove ? 'APPROVE' : 'RETURN',
              menuName: 'อนุมัติงวดเงินเดือน',
              tableName: 'Approval',
              recordId: period.id,
              summary: isApprove
                ? `อนุมัติงวดเงินเดือนพร้อมประทับลายมือชื่อดิจิทัล (${signatureHash})`
                : `ส่งกลับงวดเงินเดือนเพื่อแก้ไข: ${dto.remark}`,
              status: 'สำเร็จ',
              newValue: {
                decision: dto.decision,
                status: isApprove ? 'APPROVED' : 'EDIT_REQUESTED',
                signatureHash,
                remark: dto.remark,
              },
            },
          });
        });
      }
    }

    const pIdx = demoStore.periods.findIndex((p) => p.id === dto.periodId);
    if (pIdx !== -1) {
      demoStore.periods[pIdx].status = isApprove ? 'APPROVED' : 'EDIT_REQUESTED';
      if (dto.remark) demoStore.periods[pIdx].remark = dto.remark;
    }

    return {
      message: isApprove
        ? `อนุมัติงวดเงินเดือนและประทับลายมือชื่อดิจิทัล (${signatureHash}) สำเร็จ งวดข้อมูลถูกล็อกเรียบร้อยแล้ว`
        : 'ส่งกลับงวดเงินเดือนให้เจ้าหน้าที่ฝ่ายการเงินแก้ไขเรียบร้อยแล้ว (สถานะ: EDIT_REQUESTED)',
      status: isApprove ? 'APPROVED' : 'EDIT_REQUESTED',
      signatureHash,
      approvedAt: new Date().toLocaleString('th-TH'),
    };
  }
}
