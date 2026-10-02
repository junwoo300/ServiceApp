# Service APP

**Service APP** คือระบบบริหารจัดการงานสำหรับทีม Service ที่รวบรวมงาน **Onsite, Case Support, PM/PMA, คลังอุปกรณ์, Camera, Robot และเอกสารที่เกี่ยวข้อง** ไว้ในระบบเดียว เพื่อช่วยให้สามารถติดตามสถานะงาน จัดเก็บข้อมูล และตรวจสอบผลการปฏิบัติงานได้สะดวกมากขึ้น

## ความสามารถหลัก

- จัดการงาน **Onsite** และ **Case Support**
- จัดการงาน **PM** และสัญญา **PMA**
- จัดการคลังอุปกรณ์และข้อมูล **Camera**
- ติดตามสถานะ Robot แบบ **Online/Offline**
- ตรวจสอบจำนวนงาน เวลาทำงาน และพื้นที่ทำความสะอาดของ Robot จาก **iDriverPlus**
- เลือกดูผลการทำงานของ Robot แบบรายวันหรือกำหนดช่วงวันที่
- สร้างและคัดลอกข้อความสรุปผลการทำงานช่วงเช้า/บ่าย
- ส่งรายงานสถานะและผลการทำงานของ Robot อัตโนมัติผ่าน **Telegram**
- เพิ่ม แก้ไข และเปิดร่างอีเมลใน **Outlook** โดยแยกตาม Site
- จัดเก็บข้อมูล **Knowledge** สำหรับใช้เป็นฐานความรู้ภายใน
- รองรับระบบแชตผ่าน **Ollama** ที่ทำงานภายในเครื่อง

## เทคโนโลยีและโครงสร้างระบบ

| ส่วน | เทคโนโลยี / หน้าที่ |
| --- | --- |
| `service/` | React 18 และ Create React App — Frontend |
| `server/` | Node.js, Express และ Mongoose — Backend API และ Bot |
| MongoDB | ฐานข้อมูลหลัก `ServiceTeam` |
| `server/uploads/` | จัดเก็บไฟล์ที่ผู้ใช้อัปโหลด |
| `python/` | สคริปต์สำหรับทดลองและฝึกโมเดล แยกจาก Web Application และ Ollama |

## เริ่มต้นใช้งานในเครื่อง

ก่อนเริ่มใช้งาน ให้เตรียม:

- Node.js **22.16 ขึ้นไป**
- npm
- MongoDB ที่กำลังทำงานอยู่

คำสั่งด้านล่างใช้ **PowerShell** และเริ่มต้นจากโฟลเดอร์หลักของโปรเจกต์

### 1. ติดตั้งและเปิด Backend

```powershell
cd server
npm ci
```

สำหรับการติดตั้งครั้งแรก หากยังไม่มีไฟล์ `server/.env` ให้สร้างจากไฟล์ตัวอย่าง:

```powershell
Copy-Item .env.example .env
npm run setup:auth
```

คำสั่ง `setup:auth` จะ:

- สร้างรหัสผ่านสำหรับเข้าสู่ระบบ
- บันทึกรหัสผ่านเริ่มต้นไว้ที่ `server/.initial-password.txt`
- สร้าง Password Hash และบันทึกไว้ใน `server/.env`

หลังจากสร้างรหัสผ่านแล้ว ควรเก็บรหัสผ่านไว้ในที่ปลอดภัย และ **ห้ามนำ Password, Token หรือข้อมูลสำคัญอื่น ๆ ขึ้น Git**

หากเคยติดตั้งระบบไว้แล้ว ให้ใช้ไฟล์ `.env` และรหัสผ่านเดิม โดยไม่จำเป็นต้องคัดลอก `.env.example` ทับหรือรัน `setup:auth` ซ้ำ

เริ่ม Backend:

```powershell
npm start
```

Backend API จะเริ่มทำงานที่:

`http://127.0.0.1:5000`

ค่าเชื่อมต่อ MongoDB ปัจจุบัน:

`mongodb://127.0.0.1:27017/ServiceTeam`

โดยกำหนดค่าไว้ที่:

[server/Config/Db.js](server/Config/Db.js)

### 2. ติดตั้งและเปิด Frontend

เปิด Terminal หรือ PowerShell อีกหน้าต่าง แล้วรัน:

```powershell
cd service
npm ci
npm start
```

จากนั้นเปิด:

**http://localhost:3000**

และเข้าสู่ระบบด้วยรหัสผ่านที่สร้างไว้

Frontend จะเรียก Backend ผ่าน `/api` และส่งต่อ Request ไปยัง Backend ด้วย Development Proxy

สามารถดูตัวอย่างการตั้งค่าได้ที่:

[service/.env.example](service/.env.example)

> หลังจากแก้ไขค่าการตั้งค่า ควร Restart Process ที่เกี่ยวข้อง  
> การ Restart Backend จะทำให้ Session ปัจจุบันสิ้นสุดและต้องเข้าสู่ระบบใหม่

## การตั้งค่า Robot และ Telegram

ค่าที่เกี่ยวข้องกับ Robot และ Telegram ให้กำหนดไว้ใน:

`server/.env`

สามารถดูรายการตัวแปรทั้งหมดได้จาก:

[server/.env.example](server/.env.example)

| ตัวแปร | ใช้สำหรับ |
| --- | --- |
| `IDRIVERPLUS_USERNAME`, `IDRIVERPLUS_PASSWORD` | บัญชีสำหรับดึงข้อมูล Robot |
| `TELEGRAM_ONSITE_TOKEN`, `TELEGRAM_ONSITE_CHAT_ID` | Bot สำหรับงาน Onsite และ Telegram Group ปลายทาง |
| `TELEGRAM_BILL_TOKEN`, `TELEGRAM_BILL_CHAT_ID` | Bot สำหรับแจ้งเตือนบิล |
| `TELEGRAM_ROBOT_ENABLED` | กำหนดเป็น `true` เพื่อเปิดระบบรายงาน Robot |
| `TELEGRAM_ROBOT_TOKEN`, `TELEGRAM_ROBOT_CHAT_ID` | Bot และ Telegram Group สำหรับรับรายงาน Robot |

รายงาน Robot สามารถใช้ Bot และ Telegram Group เดียวกับระบบ Onsite ได้ โดยกำหนด Token และ Chat ID เดียวกันในตัวแปรของ Robot

หลังจากแก้ไขค่าใน `.env` ให้ Restart Backend เพื่อให้ค่าการตั้งค่าใหม่มีผล

### ตารางส่งรายงาน Robot

| เวลาไทย (`Asia/Bangkok`) | รายงาน |
| --- | --- |
| 08:00 | รายงานสถานะ Online/Offline ปัจจุบัน |
| 00:00 | รายงานสถานะปัจจุบัน พร้อมพื้นที่ทำงานรวมของวันก่อนหน้า |

เครื่องที่รัน Backend ต้องเปิดอยู่และสามารถเชื่อมต่ออินเทอร์เน็ตได้ในช่วงเวลาที่กำหนด

ระบบตั้งเวลา **จะไม่ส่งรายงานย้อนหลัง** หากเครื่องหรือ Backend ปิดอยู่ในช่วงเวลาที่กำหนด

ควรรัน Backend เพียง **1 Instance** เพื่อป้องกันการส่งรายงาน Telegram ซ้ำ

> **หมายเหตุ:** สถานะ Online/Offline เป็นสถานะของ Robot ณ เวลาที่ระบบดึงข้อมูล ไม่ใช่ข้อมูลประวัติย้อนหลัง ส่วนพื้นที่ทำความสะอาดของวันปัจจุบันเป็นยอดสะสมจนถึงเวลาที่ดึงข้อมูล

รายละเอียดเพิ่มเติม:

[คู่มือ Robot และ Telemetry](server/ROBOT-TELEMETRY.md)

## การทดสอบระบบและ Build

### Backend

รันทดสอบจากโฟลเดอร์ `
