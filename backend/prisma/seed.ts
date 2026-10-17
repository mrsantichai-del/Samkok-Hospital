import {
  PrismaClient,
  EmployeeStatus,
  PayrollStatus,
  ApprovalStatus,
  PayItemCategory,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 เริ่มต้นการจำลองข้อมูลพื้นฐาน โรงพยาบาลสามโคก (Samkok Hospital Payroll Seed)...');

  // 1. สร้างข้อมูลบทบาท (Roles - 4 บทบาทหลักตาม RBAC และหน้าจอรูปที่ 3.72)
  const defaultPermissions = {
    ADMIN: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      employees: { view: true, create: true, edit: true, delete: true, approve: false, export: true },
      periods: { view: true, create: true, edit: true, delete: true, approve: false, export: true },
      calculate: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      approvals: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      settings: { view: true, create: true, edit: true, delete: true, approve: false, export: true },
    },
    FINANCE: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      employees: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      periods: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      calculate: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      approvals: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
    EXECUTIVE: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      employees: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      periods: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      calculate: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      approvals: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
    EMPLOYEE: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      employees: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      periods: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      calculate: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      approvals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      reports: { view: false, create: false, edit: false, delete: false, approve: false, export: true },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  };

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      displayName: 'ผู้ดูแลระบบ',
      roleType: 'บทบาทภายใน',
      description: 'รับผิดชอบการบริหารจัดการบัญชีผู้ใช้งาน กำหนดบทบาทและสิทธิ์การเข้าถึง และตรวจสอบ Audit Logs',
      permissions: defaultPermissions.ADMIN,
    },
  });

  const roleFinance = await prisma.role.upsert({
    where: { name: 'FINANCE' },
    update: {},
    create: {
      name: 'FINANCE',
      displayName: 'เจ้าหน้าที่ฝ่ายการเงิน',
      roleType: 'บทบาทภายใน',
      description: 'ดูแลข้อมูลบุคลากร จัดการงวดเงินเดือน ประมวลผลเงินเดือน และจัดทำรายงานที่เกี่ยวข้อง',
      permissions: defaultPermissions.FINANCE,
    },
  });

  const roleExecutive = await prisma.role.upsert({
    where: { name: 'EXECUTIVE' },
    update: {},
    create: {
      name: 'EXECUTIVE',
      displayName: 'ผู้บริหาร',
      roleType: 'บทบาทภายใน',
      description: 'ตรวจสอบรายงานสรุปยอดจ่ายเงินเดือนเปรียบเทียบเชิงบริหาร และพิจารณาอนุมัติงวดเงินเดือนด้วยลายมือชื่อดิจิทัล',
      permissions: defaultPermissions.EXECUTIVE,
    },
  });

  const roleEmployee = await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      displayName: 'บุคลากรทั่วไป',
      roleType: 'บทบาทภายใน',
      description: 'เข้าถึงพอร์ทัลบริการตนเองเพื่อตรวจสอบสลิปเงินเดือนอิเล็กทรอนิกส์ย้อนหลังและพิมพ์ PDF ตามกฎหมาย PDPA',
      permissions: defaultPermissions.EMPLOYEE,
    },
  });

  // 2. สร้างประเภทการจ้างงาน 5 ประเภทหลัก (ตามหัวข้อ 3.1 และ 3.3.1.4)
  const empTypesData = [
    { name: 'ข้าราชการ', description: 'ข้าราชการสังกัดสำนักงานปลัดกระทรวงสาธารณสุข' },
    { name: 'พนักงานราชการ', description: 'พนักงานราชการทั่วไปและเฉพาะทาง' },
    { name: 'พนักงานกระทรวงสาธารณสุข', description: 'พนักงานกระทรวงสาธารณสุข (พกส.)' },
    { name: 'ลูกจ้างประจำ', description: 'ลูกจ้างประจำนอกงบประมาณและในงบประมาณ' },
    { name: 'ลูกจ้างชั่วคราว', description: 'ลูกจ้างชั่วคราวรายเดือน/รายวัน' },
  ];

  const empTypes: Record<string, any> = {};
  for (const et of empTypesData) {
    empTypes[et.name] = await prisma.employeeType.upsert({
      where: { name: et.name },
      update: {},
      create: et,
    });
  }

  // 3. สร้างหน่วยงานและเชื่อมโยงกับ 7 อาคารหลัก (ตามรูปที่ 3.1, 3.70, 3.80, 3.81)
  const departmentsData = [
    { name: 'ฝ่ายการเงิน', buildingName: '1. อาคารผู้ป่วยนอก', description: 'งานการเงินและบัญชี โรงพยาบาลสามโคก' },
    { name: 'ฝ่ายทรัพยากรบุคคล', buildingName: '1. อาคารผู้ป่วยนอก', description: 'งานบริหารทรัพยากรบุคคลและสวัสดิการ' },
    { name: 'กลุ่มงานการแพทย์', buildingName: '1. อาคารผู้ป่วยนอก / 2. อาคารอุบัติเหตุฉุกเฉิน', description: 'บริการตรวจรักษาผู้ป่วยนอกและฉุกเฉิน' },
    { name: 'กลุ่มงานการพยาบาล', buildingName: '3. อาคารผู้ป่วยใน / 4. ตึก IMC', description: 'บริการพยาบาลผู้ป่วยใน ผู้ป่วยนอก และตึก IMC' },
    { name: 'กลุ่มงานเภสัชกรรม', buildingName: '1. อาคารผู้ป่วยนอก', description: 'งานเภสัชกรรมและจ่ายยา' },
    { name: 'ฝ่ายสนับสนุนบริการ', buildingName: '5. จ่ายกลางหรือ IC / 6. โภชนาการ / 7. ซักฟอก', description: 'งานจ่ายกลาง โภชนาการ และซักฟอก' },
    { name: 'ฝ่ายบริหารทั่วไป', buildingName: '1. อาคารผู้ป่วยนอก', description: 'งานธุรการ พัสดุ และบริหารทั่วไป' },
  ];

  const departments: Record<string, any> = {};
  for (const dept of departmentsData) {
    departments[dept.name] = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  // 4. สร้างตำแหน่งงาน (Positions)
  const positionsData = [
    { name: 'ผู้อำนวยการโรงพยาบาล', dept: 'ฝ่ายบริหารทั่วไป' },
    { name: 'นักการเงิน', dept: 'ฝ่ายการเงิน' },
    { name: 'นักวิชาการเงินและบัญชี', dept: 'ฝ่ายการเงิน' },
    { name: 'เจ้าหน้าที่การเงิน', dept: 'ฝ่ายการเงิน' },
    { name: 'พยาบาลวิชาชีพ', dept: 'กลุ่มงานการพยาบาล' },
    { name: 'แพทย์', dept: 'กลุ่มงานการแพทย์' },
    { name: 'เภสัชกร', dept: 'กลุ่มงานเภสัชกรรม' },
    { name: 'นักวิชาการสาธารณสุข', dept: 'ฝ่ายสนับสนุนบริการ' },
    { name: 'เจ้าหน้าที่ธุรการ', dept: 'ฝ่ายบริหารทั่วไป' },
    { name: 'พนักงานขับรถ', dept: 'ฝ่ายสนับสนุนบริการ' },
    { name: 'เจ้าหน้าที่เวชระเบียน', dept: 'กลุ่มงานการแพทย์' },
  ];

  const positions: Record<string, any> = {};
  for (const pos of positionsData) {
    const existing = await prisma.position.findFirst({
      where: { name: pos.name, departmentId: departments[pos.dept].id },
    });
    if (existing) {
      positions[pos.name] = existing;
    } else {
      positions[pos.name] = await prisma.position.create({
        data: {
          name: pos.name,
          departmentId: departments[pos.dept].id,
          description: `ตำแหน่ง${pos.name} สังกัด${pos.dept}`,
        },
      });
    }
  }

  // 5. สร้างรายการประเภทเงินได้และรายการหัก (ตามรูปที่ 3.73 และ 3.75)
  const payItemsData = [
    {
      code: 'IN001',
      name: 'เงินเดือน',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้ประจำ',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: 'baseSalary',
      includeTax: true,
      includeSocialSecurity: true,
      remark: 'เงินเดือนประจำตามสัญญาจ้าง',
    },
    {
      code: 'IN002',
      name: 'ค่าตำแหน่ง',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้ประจำ',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: '3000',
      includeTax: true,
      includeSocialSecurity: true,
      remark: 'เงินประจำตำแหน่งวิชาชีพ',
    },
    {
      code: 'IN003',
      name: 'ค่าล่วงเวลา (OT)',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้อื่น',
      calcMethod: 'ตามชั่วโมง/อัตรา',
      defaultFormula: 'hours * 150',
      includeTax: true,
      includeSocialSecurity: false,
      remark: 'ค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ (OT / ค่าเวรผลัด)',
    },
    {
      code: 'IN004',
      name: 'ค่าวิชาชีพเฉพาะ (พ.ต.ส.)',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้ประจำ',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: '4000',
      includeTax: true,
      includeSocialSecurity: false,
      remark: 'เงินค่าตอบแทนพิเศษสำหรับผู้ปฏิบัติงานทางการแพทย์และสาธารณสุข (พ.ต.ส.)',
    },
    {
      code: 'IN005',
      name: 'เบี้ยเลี้ยงเหมาจ่าย (ฉบับที่ 11)',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้อื่น',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: '2000',
      includeTax: true,
      includeSocialSecurity: false,
      remark: 'เงินค่าตอบแทนเบี้ยเลี้ยงเหมาจ่ายสำหรับเจ้าหน้าที่ในหน่วยบริการสาธารณสุข (ฉบับที่ 11)',
    },
    {
      code: 'IN006',
      name: 'เงินเพิ่มพิเศษ',
      type: PayItemCategory.INCOME,
      subCategory: 'เงินได้อื่น',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: '500',
      includeTax: true,
      includeSocialSecurity: false,
      remark: 'เงินตอบแทนพิเศษอื่นๆ',
    },
    {
      code: 'DE001',
      name: 'ภาษีเงินได้บุคคลธรรมดา',
      type: PayItemCategory.DEDUCTION,
      subCategory: 'รายการหักตามกฎหมาย',
      calcMethod: 'คำนวณตามอัตราร้อยละ',
      defaultFormula: 'grossPay * 0.05',
      includeTax: false,
      includeSocialSecurity: false,
      remark: 'ภาษีเงินได้หัก ณ ที่จ่าย',
    },
    {
      code: 'DE002',
      name: 'ประกันสังคม',
      type: PayItemCategory.DEDUCTION,
      subCategory: 'รายการหักตามกฎหมาย',
      calcMethod: 'คำนวณตามอัตราร้อยละ',
      defaultFormula: 'min(baseSalary * 0.05, 750)',
      includeTax: false,
      includeSocialSecurity: false,
      remark: 'เงินสมทบกองทุนประกันสังคม (สูงสุด 750 บาท)',
    },
    {
      code: 'DE003',
      name: 'กองทุนสำรองเลี้ยงชีพ / กบข.',
      type: PayItemCategory.DEDUCTION,
      subCategory: 'รายการหักตามกฎหมาย',
      calcMethod: 'คำนวณตามอัตราร้อยละ',
      defaultFormula: 'baseSalary * 0.03',
      includeTax: false,
      includeSocialSecurity: false,
      remark: 'เงินสะสม กบข. / กสจ. / กองทุนสำรองเลี้ยงชีพ',
    },
    {
      code: 'DE004',
      name: 'หักอื่น ๆ',
      type: PayItemCategory.DEDUCTION,
      subCategory: 'รายการหักอื่น',
      calcMethod: 'จำนวนเงินคงที่',
      defaultFormula: '0',
      includeTax: false,
      includeSocialSecurity: false,
      remark: 'รายการหักสหกรณ์ออมทรัพย์ หรืออื่นๆ',
    },
  ];

  const payItems: Record<string, any> = {};
  for (const item of payItemsData) {
    payItems[item.code] = await prisma.payItemType.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }

  // 6. สร้างบุคลากรตัวอย่างให้ตรงกับรูปที่ 3.66, 3.71, 3.77, 3.78, 3.91, 3.93
  // หมายเหตุ: เลขบัตรประชาชนทุกเลขผ่านการคำนวณ Modulo 11 Check Digit ถูกต้อง 100%
  const employeesData = [
    {
      employeeCode: 'E0001',
      titleName: 'นางสาว',
      firstName: 'กมลวรรณ',
      lastName: 'ใจดี',
      citizenId: '1100400256893', // Modulo 11 valid
      birthDate: new Date('1992-05-15'),
      gender: 'หญิง',
      phone: '0812345678',
      email: 'kamonwan@samkokhosp.go.th',
      hireDate: new Date('2017-04-01'),
      baseSalary: 25000,
      levelName: 'ชำนาญการ',
      dept: 'ฝ่ายการเงิน',
      pos: 'นักการเงิน',
      type: 'ข้าราชการ',
      bankNo: '123-4-56789-0',
    },
    {
      employeeCode: 'E0002',
      titleName: 'นางสาว',
      firstName: 'สุภาพร',
      lastName: 'มีสุข',
      citizenId: '1130100045215', // Modulo 11 valid
      birthDate: new Date('1990-08-20'),
      gender: 'หญิง',
      phone: '0823456789',
      email: 'suda@example.com',
      hireDate: new Date('2016-10-01'),
      baseSalary: 28500,
      levelName: 'ชำนาญการ',
      dept: 'ฝ่ายการเงิน',
      pos: 'นักวิชาการเงินและบัญชี',
      type: 'พนักงานราชการ',
      bankNo: '123-4-56790-1',
    },
    {
      employeeCode: 'E0003',
      titleName: 'นาย',
      firstName: 'สมชาย',
      lastName: 'รักงาน',
      citizenId: '1100500342117', // Modulo 11 valid
      birthDate: new Date('1988-03-12'),
      gender: 'ชาย',
      phone: '0834567890',
      email: 'somchai.r@samkokhosp.go.th',
      hireDate: new Date('2015-05-01'),
      baseSalary: 26500,
      levelName: 'ปฏิบัติการ',
      dept: 'ฝ่ายการเงิน',
      pos: 'เจ้าหน้าที่การเงิน',
      type: 'ลูกจ้างประจำ',
      bankNo: '123-4-56791-2',
    },
    {
      employeeCode: 'E0012',
      titleName: 'นางสาว',
      firstName: 'ศิริพร',
      lastName: 'แสงทอง',
      citizenId: '1100700198234', // Modulo 11 valid
      birthDate: new Date('1991-11-05'),
      gender: 'หญิง',
      phone: '0845678901',
      email: 'siriporn@samkokhosp.go.th',
      hireDate: new Date('2018-01-15'),
      baseSalary: 35250,
      levelName: 'ชำนาญการ',
      dept: 'กลุ่มงานการพยาบาล',
      pos: 'พยาบาลวิชาชีพ',
      type: 'ข้าราชการ',
      bankNo: '123-4-56792-3',
    },
    {
      employeeCode: 'E0018',
      titleName: 'นาย',
      firstName: 'วิทยา',
      lastName: 'กิตติศักดิ์',
      citizenId: '1100800541225', // Modulo 11 valid
      birthDate: new Date('1993-02-18'),
      gender: 'ชาย',
      phone: '0856789012',
      email: 'wittaya@samkokhosp.go.th',
      hireDate: new Date('2019-06-01'),
      baseSalary: 27000,
      levelName: 'ปฏิบัติการ',
      dept: 'ฝ่ายสนับสนุนบริการ',
      pos: 'นักวิชาการสาธารณสุข',
      type: 'พนักงานกระทรวงสาธารณสุข',
      bankNo: '123-4-56793-4',
    },
    {
      employeeCode: 'E0025',
      titleName: 'นางสาว',
      firstName: 'กัญญา',
      lastName: 'พิมพา',
      citizenId: '1100900321459', // Modulo 11 valid
      birthDate: new Date('1994-07-22'),
      gender: 'หญิง',
      phone: '0867890123',
      email: 'kanya@samkokhosp.go.th',
      hireDate: new Date('2020-03-01'),
      baseSalary: 24000,
      levelName: 'ปฏิบัติงาน',
      dept: 'ฝ่ายบริหารทั่วไป',
      pos: 'เจ้าหน้าที่ธุรการ',
      type: 'พนักงานราชการ',
      bankNo: '123-4-56794-5',
    },
    {
      employeeCode: 'E0031',
      titleName: 'นาย',
      firstName: 'ณัฐพล',
      lastName: 'ใจมั่น',
      citizenId: '1101400231552', // Modulo 11 valid
      birthDate: new Date('1987-09-30'),
      gender: 'ชาย',
      phone: '0878901234',
      email: 'nattapon@samkokhosp.go.th',
      hireDate: new Date('2014-11-01'),
      baseSalary: 20000,
      levelName: 'ทั่วไป',
      dept: 'ฝ่ายสนับสนุนบริการ',
      pos: 'พนักงานขับรถ',
      type: 'ลูกจ้างประจำ',
      bankNo: '123-4-56795-6',
    },
    {
      employeeCode: 'E0040',
      titleName: 'นางสาว',
      firstName: 'พรทิพย์',
      lastName: 'กันยา',
      citizenId: '1101500765432', // Modulo 11 valid
      birthDate: new Date('1985-12-10'),
      gender: 'หญิง',
      phone: '0889012345',
      email: 'pornthip@samkokhosp.go.th',
      hireDate: new Date('2012-04-01'),
      baseSalary: 100000,
      levelName: 'ชำนาญการพิเศษ',
      dept: 'กลุ่มงานการแพทย์',
      pos: 'แพทย์',
      type: 'ข้าราชการ',
      bankNo: '123-4-56796-7',
    },
    {
      employeeCode: 'E0045',
      titleName: 'นาย',
      firstName: 'เอกชัย',
      lastName: 'ยั่งยืน',
      citizenId: '1102000432198', // Modulo 11 valid
      birthDate: new Date('1995-04-14'),
      gender: 'ชาย',
      phone: '0890123456',
      email: 'ekachai@samkokhosp.go.th',
      hireDate: new Date('2021-08-01'),
      baseSalary: 22500,
      levelName: 'ปฏิบัติงาน',
      dept: 'กลุ่มงานการแพทย์',
      pos: 'เจ้าหน้าที่เวชระเบียน',
      type: 'ลูกจ้างชั่วคราว',
      bankNo: '123-4-56797-8',
    },
    {
      employeeCode: 'EMP00125',
      titleName: 'นาย',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      citizenId: '1234567890121', // Modulo 11 valid (1-2345-67890-12-1)
      birthDate: new Date('1992-05-15'),
      gender: 'ชาย',
      phone: '0812345678',
      email: 'somchai@example.com',
      hireDate: new Date('2017-04-01'),
      baseSalary: 28000,
      levelName: 'ชำนาญการ',
      dept: 'กลุ่มงานการพยาบาล',
      pos: 'พยาบาลวิชาชีพ',
      type: 'ข้าราชการ',
      bankNo: '123-4-56799-0',
    },
  ];

  const employees: Record<string, any> = {};
  for (const emp of employeesData) {
    const created = await prisma.employee.upsert({
      where: { employeeCode: emp.employeeCode },
      update: {
        titleName: emp.titleName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        baseSalary: emp.baseSalary,
        departmentId: departments[emp.dept].id,
        positionId: positions[emp.pos].id,
        employeeTypeId: empTypes[emp.type].id,
      },
      create: {
        employeeCode: emp.employeeCode,
        titleName: emp.titleName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        citizenId: emp.citizenId,
        birthDate: emp.birthDate,
        gender: emp.gender,
        phone: emp.phone,
        email: emp.email,
        hireDate: emp.hireDate,
        employmentStatus: EmployeeStatus.ACTIVE,
        baseSalary: emp.baseSalary,
        levelName: emp.levelName,
        departmentId: departments[emp.dept].id,
        positionId: positions[emp.pos].id,
        employeeTypeId: empTypes[emp.type].id,
      },
    });
    employees[emp.employeeCode] = created;

    const existingBank = await prisma.employeeBankAccount.findFirst({
      where: { employeeId: created.id },
    });
    if (!existingBank) {
      await prisma.employeeBankAccount.create({
        data: {
          employeeId: created.id,
          bankName: 'กรุงไทย',
          accountNo: emp.bankNo,
          accountName: `${emp.titleName}${emp.firstName} ${emp.lastName}`,
          isPrimary: true,
        },
      });
    }
  }

  // 7. สร้างบัญชีผู้ใช้งาน (Users - รหัสผ่านเริ่มต้น: password123 เข้ารหัสด้วย Bcrypt Salt Round 10)
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      username: 'somchai',
      empCode: 'EMP00125',
      roleId: roleAdmin.id,
      isActive: true,
      remark: 'ผู้ดูแลระบบหลัก (System Administrator)',
    },
    {
      username: 'suda',
      empCode: 'E0002',
      roleId: roleFinance.id,
      isActive: true,
      remark: 'เจ้าหน้าที่ฝ่ายการเงิน (Finance Officer)',
    },
    {
      username: 'executive',
      empCode: 'E0040',
      roleId: roleExecutive.id,
      isActive: true,
      remark: 'ผู้อำนวยการโรงพยาบาล / ผู้บริหาร (Director)',
    },
    {
      username: 'anucha',
      empCode: null,
      roleId: roleExecutive.id,
      isActive: true,
      remark: 'นายอนุชา รักงาน (ผู้อนุมัติ)',
    },
    {
      username: 'panya',
      empCode: 'E0001',
      roleId: roleEmployee.id,
      isActive: true,
      remark: 'บุคลากรทั่วไป (Hospital Employee)',
    },
    {
      username: 'wipada',
      empCode: 'E0025',
      roleId: roleFinance.id,
      isActive: true,
      remark: 'เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล',
    },
    {
      username: 'thanakrit',
      empCode: 'E0003',
      roleId: roleFinance.id,
      isActive: true,
      remark: 'นายธนกฤต นันทศิริ (เจ้าหน้าที่ฝ่ายการเงิน)',
    },
  ];

  const users: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        isActive: u.isActive,
        remark: u.remark,
      },
      create: {
        username: u.username,
        passwordHash,
        employeeId: u.empCode ? employees[u.empCode]?.id : null,
        isActive: u.isActive,
        remark: u.remark,
      },
    });
    users[u.username] = user;

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: u.roleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: u.roleId,
      },
    });
  }

  // 8. สร้างค่าพื้นฐานและพารามิเตอร์ระบบ (SystemParameter - UC-04)
  const paramsData = [
    {
      code: 'SSO_RATE',
      name: 'อัตราเงินสมทบประกันสังคม (%)',
      category: 'SOCIAL_SECURITY',
      value: '5',
      remark: 'คิดร้อยละ 5 ของฐานเงินเดือน สูงสุดไม่เกิน 750 บาท',
    },
    {
      code: 'SSO_MAX_AMOUNT',
      name: 'เพดานเงินสมทบประกันสังคมสูงสุด (บาท)',
      category: 'SOCIAL_SECURITY',
      value: '750',
      remark: 'ฐานเงินเดือนสูงสุด 15,000 บาท',
    },
    {
      code: 'GPF_DEFAULT_RATE',
      name: 'อัตราเงินสะสม กบข. / กองทุนสำรองเลี้ยงชีพ (%)',
      category: 'FUND',
      value: '3',
      remark: 'อัตราเริ่มต้นร้อยละ 3 ของเงินเดือนฐาน',
    },
    {
      code: 'TAX_WITHHOLDING_RATE',
      name: 'อัตราภาษีหัก ณ ที่จ่ายเฉลี่ย (%)',
      category: 'TAX',
      value: '5',
      remark: 'อัตราคำนวณภาษีหัก ณ ที่จ่ายเบื้องต้น',
    },
    {
      code: 'OT_HOURLY_RATE',
      name: 'อัตราค่าล่วงเวลามาตรฐาน (บาท/ชั่วโมง)',
      category: 'PAYROLL',
      value: '150',
      remark: 'ใช้คำนวณค่าล่วงเวลา (OT) มาตรฐาน',
    },
    {
      code: 'SHIFT_ALLOWANCE_RATE',
      name: 'อัตราค่าเวรผลัดบ่าย/ดึก (บาท/เวร)',
      category: 'PAYROLL',
      value: '600',
      remark: 'ค่าตอบแทนการปฏิบัติงานนอกเวลาราชการ (ฉบับที่ 11 / ค่าเวร)',
    },
    {
      code: 'HOSPITAL_BUDGET_YEARLY',
      name: 'งบประมาณค่าใช้จ่ายบุคลากรประจำปี (บาท)',
      category: 'PAYROLL',
      value: '15295000',
      remark: 'งบประมาณหมวดบุคลากร โรงพยาบาลสามโคก',
    },
  ];

  for (const p of paramsData) {
    await prisma.systemParameter.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        category: p.category,
        value: p.value,
        remark: p.remark,
        updatedById: users['somchai'].id,
      },
      create: {
        code: p.code,
        name: p.name,
        category: p.category,
        value: p.value,
        remark: p.remark,
        updatedById: users['somchai'].id,
      },
    });
  }

  // 9. สร้างงวดเงินเดือน (PayrollPeriod - ตามรูปที่ 3.69, 3.70, 3.76, 3.79)
  const periodsData = [
    {
      month: 7,
      year: 2569,
      round: 1,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-31'),
      payDate: new Date('2026-07-31'),
      status: PayrollStatus.EDIT_REQUESTED,
      remark: 'พบรายการเงินได้ของราชการรักษาการไม่ถูกต้อง และข้อมูลพนักงานบางรายไม่ครบถ้วน กรุณาตรวจสอบและเปิดส่งขออนุมัติอีกครั้ง',
    },
    {
      month: 8,
      year: 2569,
      round: 1,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      payDate: new Date('2026-08-31'),
      status: PayrollStatus.APPROVED,
      remark: 'อนุมัติและจ่ายเงินเดือนเรียบร้อยแล้ว',
    },
    {
      month: 9,
      year: 2569,
      round: 1,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-30'),
      payDate: new Date('2026-09-30'),
      status: PayrollStatus.APPROVED,
      remark: 'งวดเดือนกันยายน อนุมัติเรียบร้อยแล้ว',
    },
    {
      month: 10,
      year: 2569,
      round: 1,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
      payDate: new Date('2026-10-31'),
      status: PayrollStatus.PENDING_APPROVAL,
      remark: 'ส่งอนุมัติงวดเงินเดือน เดือนตุลาคม 2569',
    },
    {
      month: 11,
      year: 2569,
      round: 1,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
      payDate: new Date('2026-11-30'),
      status: PayrollStatus.DRAFT,
      remark: 'ร่างงวดเงินเดือนประจำเดือนพฤศจิกายน 2569',
    },
  ];

  const periods: Record<string, any> = {};
  for (const pd of periodsData) {
    const period = await prisma.payrollPeriod.upsert({
      where: {
        month_year_round: {
          month: pd.month,
          year: pd.year,
          round: pd.round,
        },
      },
      update: {
        status: pd.status,
        remark: pd.remark,
      },
      create: {
        month: pd.month,
        year: pd.year,
        round: pd.round,
        startDate: pd.startDate,
        endDate: pd.endDate,
        payDate: pd.payDate,
        status: pd.status,
        remark: pd.remark,
        submittedBy: 'สุภา มีสุข',
        submittedAt: new Date('2026-10-28T10:15:00'),
      },
    });
    periods[`${pd.year}-${pd.month}`] = period;

    // สร้างข้อมูล Approval ของงวด
    const existingApproval = await prisma.approval.findFirst({
      where: { periodId: period.id },
    });
    if (!existingApproval && pd.status !== PayrollStatus.DRAFT) {
      await prisma.approval.create({
        data: {
          periodId: period.id,
          approverUserId: users['executive'].id,
          status:
            pd.status === PayrollStatus.APPROVED
              ? ApprovalStatus.APPROVED
              : pd.status === PayrollStatus.EDIT_REQUESTED
              ? ApprovalStatus.RETURNED
              : ApprovalStatus.PENDING,
          remark: pd.remark,
          signatureHash:
            pd.status === PayrollStatus.APPROVED
              ? `SIG-SAMKOK-${pd.year}${String(pd.month).padStart(2, '0')}-DIR`
              : null,
          approvedAt: pd.status === PayrollStatus.APPROVED ? pd.payDate : null,
        },
      });
    }
  }

  // 10. สร้างข้อมูลผลการคำนวณเงินเดือน (PayrollRecord & PayrollItem) สำหรับงวดเดือน 8, 9, 10 ปี 2569 และงวดที่ส่งกลับเดือน 7
  const allEmployees = await prisma.employee.findMany();
  for (const periodKey of ['2569-7', '2569-8', '2569-9', '2569-10']) {
    const period = periods[periodKey];
    if (!period) continue;

    let idx = 100;
    for (const emp of allEmployees) {
      idx++;
      const base = Number(emp.baseSalary);
      // กำหนดตัวเลขให้ตรงกับรูปที่ 3.77 และ 3.78 สำหรับ E0001
      const posAllowance = emp.employeeCode === 'E0001' ? 3000 : emp.employeeCode === 'E0040' ? 10000 : 2500;
      const ptsAllowance = emp.employeeCode === 'E0001' ? 4000 : emp.employeeCode === 'E0040' ? 10000 : 1500;
      const otPay = emp.employeeCode === 'E0001' ? 2000 : emp.employeeCode === 'EMP00125' ? 1200 : 1000;

      const grossPay = base + posAllowance + ptsAllowance + otPay;

      const tax = emp.employeeCode === 'E0001' ? 1250 : Math.round(base * 0.04);
      const sso = 750;
      const gpf = emp.employeeCode === 'E0001' ? 1200 : Math.round(base * 0.03);
      const otherDed = emp.employeeCode === 'E0001' ? 500 : 300;

      const totalDeduction = tax + sso + gpf + otherDed;
      const netPay = grossPay - totalDeduction;

      const slipNo = `SLIP${String(period.year).slice(-2)}${String(period.month).padStart(2, '0')}-${String(idx).padStart(6, '0')}`;

      const record = await prisma.payrollRecord.upsert({
        where: {
          periodId_employeeId: {
            periodId: period.id,
            employeeId: emp.id,
          },
        },
        update: {
          baseSalary: base,
          grossPay,
          totalDeduction,
          netPay,
          hasIssue: period.status === PayrollStatus.EDIT_REQUESTED && (emp.employeeCode === 'E0001' || emp.employeeCode === 'E0003'),
          issueRemark:
            period.status === PayrollStatus.EDIT_REQUESTED && emp.employeeCode === 'E0001'
              ? 'ตรวจสอบค่าล่วงเวลา'
              : period.status === PayrollStatus.EDIT_REQUESTED && emp.employeeCode === 'E0003'
              ? 'พบรายการหักกองทุนไม่ตรง'
              : null,
        },
        create: {
          slipNo,
          periodId: period.id,
          employeeId: emp.id,
          baseSalary: base,
          grossPay,
          totalDeduction,
          netPay,
          isReviewed: true,
          hasIssue: period.status === PayrollStatus.EDIT_REQUESTED && (emp.employeeCode === 'E0001' || emp.employeeCode === 'E0003'),
          issueRemark:
            period.status === PayrollStatus.EDIT_REQUESTED && emp.employeeCode === 'E0001'
              ? 'ตรวจสอบค่าล่วงเวลา'
              : period.status === PayrollStatus.EDIT_REQUESTED && emp.employeeCode === 'E0003'
              ? 'พบรายการหักกองทุนไม่ตรง'
              : null,
        },
      });

      // ลบและสร้าง PayrollItem ใหม่ของ Record นั้น
      await prisma.payrollItem.deleteMany({ where: { payrollRecordId: record.id } });
      await prisma.payrollItem.createMany({
        data: [
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['IN001'].id,
            amount: base,
            formulaUsed: 'baseSalary',
            remark: 'เงินเดือนฐาน',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['IN002'].id,
            amount: posAllowance,
            formulaUsed: 'fixed',
            remark: 'เงินประจำตำแหน่ง',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['IN004'].id,
            amount: ptsAllowance,
            formulaUsed: 'fixed',
            remark: 'ค่าวิชาชีพเฉพาะ (พ.ต.ส.)',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['IN003'].id,
            amount: otPay,
            formulaUsed: '08 ชม.',
            remark: 'ค่าตอบแทนพิเศษ / OT',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['DE001'].id,
            amount: tax,
            formulaUsed: 'tax_table',
            remark: 'ภาษีเงินได้บุคคลธรรมดา',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['DE002'].id,
            amount: sso,
            formulaUsed: '5% max 750',
            remark: 'ประกันสังคม',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['DE003'].id,
            amount: gpf,
            formulaUsed: '3%',
            remark: 'กองทุนสำรองเลี้ยงชีพ',
          },
          {
            payrollRecordId: record.id,
            payItemTypeId: payItems['DE004'].id,
            amount: otherDed,
            formulaUsed: 'fixed',
            remark: 'หักอื่น ๆ',
          },
        ],
      });
    }
  }

  // 11. สร้างข้อมูลประวัติการใช้งาน (AuditLog - ตามรูปที่ 3.74)
  const existingLogs = await prisma.auditLog.count();
  if (existingLogs === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: users['somchai'].id,
          action: 'CREATE',
          menuName: 'จัดการบัญชีผู้ใช้งาน',
          tableName: 'User',
          recordId: users['thanakrit'].id,
          summary: 'เพิ่มบัญชีผู้ใช้งาน thanakrit',
          status: 'สำเร็จ',
          oldValue: { count: 6 },
          newValue: { username: 'thanakrit', role: 'FINANCE' },
        },
        {
          userId: users['suda'].id,
          action: 'IMPORT',
          menuName: 'นำเข้าข้อมูลจาก Excel',
          tableName: 'PayrollRecord',
          recordId: periods['2569-10'].id,
          summary: 'นำเข้าข้อมูลเงินเดือนงวด ต.ค. 2569 จำนวน 150 รายการ',
          status: 'สำเร็จ',
          oldValue: { importedRecords: 0 },
          newValue: { totalRows: 150, successRows: 150, failedRows: 0 },
        },
        {
          userId: users['anucha'].id,
          action: 'APPROVE',
          menuName: 'อนุมัติงวดเงินเดือน',
          tableName: 'PayrollPeriod',
          recordId: periods['2569-9'].id,
          summary: 'อนุมัติงวดเงินเดือน เดือน กันยายน 2569',
          status: 'สำเร็จ',
          oldValue: { status: 'PENDING_APPROVAL' },
          newValue: { status: 'APPROVED', signature: 'SIG-SAMKOK-256909-DIR' },
        },
        {
          userId: users['wipada'].id,
          action: 'UPDATE',
          menuName: 'ปรับปรุงเงินได้และรายการหัก',
          tableName: 'PayrollItem',
          recordId: employees['E0001'].id,
          summary: 'แก้ไขรายการเงินได้พิเศษ ของ กมลวรรณ ใจดี',
          status: 'สำเร็จ',
          oldValue: { amount: 1500 },
          newValue: { amount: 2000 },
        },
        {
          userId: users['somchai'].id,
          action: 'UPDATE',
          menuName: 'กำหนดบทบาทการใช้งาน',
          tableName: 'Role',
          recordId: roleFinance.id,
          summary: 'แก้ไขสิทธิ์เมนูของบทบาท เจ้าหน้าที่ฝ่ายการเงิน',
          status: 'สำเร็จ',
          oldValue: { exportReport: false },
          newValue: { exportReport: true },
        },
        {
          userId: users['panya'].id,
          action: 'LOGIN',
          menuName: 'เข้าสู่ระบบ',
          tableName: 'User',
          recordId: users['panya'].id,
          summary: 'เข้าสู่ระบบสำเร็จ',
          status: 'สำเร็จ',
          oldValue: null,
          newValue: { ip: '192.168.1.50', role: 'EMPLOYEE' },
        },
        {
          userId: users['suda'].id,
          action: 'CREATE',
          menuName: 'จัดการงวดเงินเดือน',
          tableName: 'PayrollPeriod',
          recordId: periods['2569-11'].id,
          summary: 'สร้างงวดเงินเดือน เดือน พฤศจิกายน 2569',
          status: 'สำเร็จ',
          oldValue: null,
          newValue: { month: 11, year: 2569, status: 'DRAFT' },
        },
        {
          userId: users['somchai'].id,
          action: 'UPDATE',
          menuName: 'ค่าพื้นฐานและพารามิเตอร์',
          tableName: 'SystemParameter',
          recordId: 'TAX_WITHHOLDING_RATE',
          summary: 'แก้ไขอัตราภาษีเงินได้บุคคลธรรมดา',
          status: 'สำเร็จ',
          oldValue: { value: '5' },
          newValue: { value: '5' },
        },
      ],
    });
  }

  console.log('✅ จำลองข้อมูลพื้นฐานโรงพยาบาลสามโคกเสร็จสมบูรณ์!');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
