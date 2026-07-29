# ระบบสรุปรายงาน C2C

เว็บแอปสำหรับสรุปยอดฝาก C2C และยอดโบนัส C2C จากไฟล์ Excel โดยอัตโนมัติ — อัปโหลดไฟล์แล้วระบบจะอ่านและคำนวณให้ทันที ไม่ต้องกดปุ่มใด ๆ การประมวลผลทั้งหมดทำงานในเบราว์เซอร์ (client-side) ไฟล์ไม่ถูกส่งขึ้นเซิร์ฟเวอร์

## เทคโนโลยีที่ใช้

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui-style components (Radix UI primitives)
- `xlsx` (SheetJS) สำหรับอ่านไฟล์ Excel
- `recharts` สำหรับกราฟ
- `react-dropzone` สำหรับ drag & drop
- `html2canvas` + `jspdf` สำหรับ Export PDF (แรสเตอร์ DOM เพื่อให้ข้อความภาษาไทยแสดงผลถูกต้อง)
- `xlsx` + `file-saver` สำหรับ Export Excel

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

Build สำหรับ production:

```bash
npm run build
npm run start
```

## โครงสร้างโปรเจกต์

```
/app                     Next.js App Router (layout, page, globals.css)
/components
  /ui                    Base UI primitives (Button, Card, Table, Tabs, Select, ...)
  /dashboard              Dashboard tab, Deposit tab, Bonus tab, KPI cards
  /upload                Drag & drop upload zone
  /tables                Deposit/Bonus summary tables + toolbar (search, export)
  /charts                Line / Bar / Pie charts (recharts)
  app-shell.tsx           Top-level page composition
  month-picker.tsx
  theme-provider.tsx / theme-toggle.tsx
/lib
  calculations.ts         Business-rule calculations (deposit/bonus/dashboard summaries)
  parse-helpers.ts         Date/number/text cell parsing helpers
  thai-date.ts             Thai month names & month arithmetic
  utils.ts                 cn() + number/currency/percent formatters
/services
  excel-parser.ts          parseDepositExcel() / parseBonusExcel() + column validation
  export.ts                 exportDepositExcel/exportBonusExcel (xlsx), exportElementToPDF (PDF)
/hooks
  use-c2c-data.tsx          React context holding parsed records + upload handlers
/types
  index.ts                  DepositRecord, BonusRecord, DailySummary, MonthlySummary, DashboardSummary, ...
```

## กฎการคำนวณ (Business Rules)

### สรุปยอดฝาก C2C
- อ่านคอลัมน์ **Bank** และ **ยอดเติมเข้า AG** จากไฟล์ยอดฝาก (จับคู่ด้วยชื่อหัวคอลัมน์ ไม่อิงตำแหน่งคอลัมน์ตายตัว เพื่อความทนทานต่อไฟล์ที่โครงสร้างเปลี่ยนเล็กน้อย)
- ถ้า `Bank === "C2C Payment"` (ไม่สนตัวพิมพ์เล็ก/ใหญ่) รวม `ยอดเติมเข้า AG` เป็น **ยอดฝาก C2C**
- **ยอดฝากรวม** = ผลรวม `ยอดเติมเข้า AG` ทุกแถวทุกธนาคาร
- **สรุป %** = (ยอดฝาก C2C ÷ ยอดฝากรวม) × 100 แสดงทศนิยม 2 ตำแหน่ง

### สรุปยอดโบนัส C2C
- อ่านคอลัมน์ **หมายเหตุ** และ **ยอดเงิน** จากไฟล์โบนัส
- ถ้า **หมายเหตุ** มีคำว่า `C2C` อยู่ตำแหน่งใดก็ได้ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) → รวม `ยอดเงิน` เป็น **ยอดโบนัส C2C**
- **โบนัส %** = (ยอดโบนัส C2C ÷ ยอดฝาก C2C ของวันเดียวกัน) × 100

### การจับคู่ข้อมูล
- ทั้งสองไฟล์ใช้ `Timestamp` ตัดเหลือเฉพาะวันที่ (`DD/MM/YYYY`) เป็น key ในการรวมยอดรายวัน แล้วรวมต่อเป็นรายเดือน

### รองรับรูปแบบวันที่/ตัวเลข
- วันที่: Excel serial date, `YYYY-MM-DD`, `YYYY-MM-DD HH:mm`, `DD/MM/YYYY`, `DD-MM-YYYY`
- ตัวเลข: มี/ไม่มี comma คั่นหลักพัน, มี/ไม่มีทศนิยม

### Validation
- ถ้าไฟล์ที่อัปโหลดขาดคอลัมน์ที่จำเป็น (Timestamp / Bank / ยอดเติมเข้า AG สำหรับไฟล์ฝาก, Timestamp / ยอดเงิน / หมายเหตุ สำหรับไฟล์โบนัส) ระบบจะแจ้ง "รูปแบบไฟล์ไม่ถูกต้อง" พร้อมระบุคอลัมน์ที่ขาด

## หมายเหตุเรื่อง Export PDF

ฟอนต์มาตรฐานของ jsPDF ไม่รองรับตัวอักษรภาษาไทย ระบบจึงสร้าง PDF โดยแคปเจอร์ตารางที่แสดงผลจริงบนหน้าจอ (ผ่าน `html2canvas`) แล้วฝังเป็นภาพลง PDF เพื่อให้ข้อความภาษาไทยแสดงผลถูกต้องเสมอ
