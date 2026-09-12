# Service APP

ระบบจัดการงานบริการสำหรับทีม Service รวมงาน Onsite, PM/PMA, คลังอุปกรณ์, Camera, Robot และเอกสารไว้ในเว็บเดียว

## ความสามารถหลัก

- จัดการงาน Onsite และ Case Support
- จัดการงาน PM และสัญญา PMA
- จัดการคลังอุปกรณ์และข้อมูล Camera
- ติดตาม Robot Online/Offline พร้อมจำนวนงาน เวลาทำงาน และพื้นที่ทำความสะอาดจาก iDriverPlus
- เลือกดูผลงานวันเดียวหรือช่วงหลายวัน และคัดลอกข้อความสรุปเช้า/บ่าย
- ส่งรายงาน Robot อัตโนมัติผ่าน Telegram
- เพิ่ม แก้ไข และเปิดร่างเมลใน Outlook แยกตามไซต์
- จัดเก็บ Knowledge และใช้งานแชตผ่าน Ollama ในเครื่อง

## เทคโนโลยีและโครงสร้าง

| ส่วน | เทคโนโลยี / หน้าที่ |
| --- | --- |
| `service/` | React 18 และ Create React App — หน้าเว็บ |
| `server/` | Node.js, Express และ Mongoose — API และบอต |
| MongoDB | ฐานข้อมูล `ServiceTeam` |
| `server/uploads/` | ไฟล์ที่ผู้ใช้อัปโหลด |
| `python/` | สคริปต์ทดลองฝึกโมเดล แยกจากเว็บและ Ollama |

## เริ่มใช้งานในเครื่อง

เตรียม Node.js 22.16 ขึ้นไป, npm และ MongoDB ที่กำลังทำงานอยู่ คำสั่งด้านล่างใช้ PowerShell โดยเริ่มจากโฟลเดอร์หลักของโปรเจกต์

### 1. ติดตั้งและเปิด backend

```powershell
cd server
npm ci
```

สำหรับการติดตั้งใหม่ที่ยังไม่มี `server/.env` ให้คัดลอกไฟล์ตัวอย่าง:

```powershell
Copy-Item .env.example .env
npm run setup:auth
```

คำสั่ง `setup:auth` สร้างรหัสผ่านเข้าเว็บไว้ใน `server/.initial-password.txt` และเก็บ password hash ใน `server/.env` ให้อ่านรหัสผ่านในเครื่องและเก็บไว้ในที่ปลอดภัย ไม่ใส่รหัสผ่านหรือ token ลง Git

หากติดตั้งไว้แล้ว ให้ใช้ `.env` และรหัสผ่านเดิม ไม่ต้องคัดลอกทับหรือรัน `setup:auth` ซ้ำ

```powershell
npm start
```

API เริ่มที่ `http://127.0.0.1:5000` ค่าเชื่อมต่อ MongoDB ปัจจุบันคือ `mongodb://127.0.0.1:27017/ServiceTeam` ซึ่งกำหนดใน [server/Config/Db.js](server/Config/Db.js)

### 2. เปิด frontend ในอีก terminal

```powershell
cd service
npm ci
npm start
```

เปิด **http://localhost:3000** และเข้าสู่ระบบด้วยรหัสผ่านที่สร้างไว้ Frontend ใช้ `/api` และส่งต่อไปยัง backend ผ่าน development proxy โดยดูค่าตัวอย่างได้ใน [service/.env.example](service/.env.example)

หลังเปลี่ยนค่าตั้งค่า ให้รีสตาร์ต process ที่เกี่ยวข้อง การรีสตาร์ต backend จะทำให้ต้องเข้าสู่ระบบใหม่

## ตั้งค่า Robot และ Telegram

กำหนดค่าเฉพาะใน `server/.env` ดูรายการทั้งหมดได้จาก [server/.env.example](server/.env.example)

| ตัวแปร | ใช้สำหรับ |
| --- | --- |
| `IDRIVERPLUS_USERNAME`, `IDRIVERPLUS_PASSWORD` | บัญชีอ่านข้อมูล Robot |
| `TELEGRAM_ONSITE_TOKEN`, `TELEGRAM_ONSITE_CHAT_ID` | บอตงาน Onsite และกลุ่มปลายทาง |
| `TELEGRAM_BILL_TOKEN`, `TELEGRAM_BILL_CHAT_ID` | แจ้งเตือนบิล |
| `TELEGRAM_ROBOT_ENABLED` | ตั้งเป็น `true` เพื่อเปิดรายงาน Robot |
| `TELEGRAM_ROBOT_TOKEN`, `TELEGRAM_ROBOT_CHAT_ID` | บอตและกลุ่มรับรายงาน Robot |

รายงาน Robot สามารถใช้บอตและกลุ่มเดียวกับ Onsite โดยใส่ค่าเดียวกันในตัวแปรของ Robot และรีสตาร์ต backend

| เวลาไทย (`Asia/Bangkok`) | รายงาน |
| --- | --- |
| 08:00 | สถานะ Online/Offline ปัจจุบัน |
| 00:00 | สถานะปัจจุบัน พร้อมพื้นที่ทำงานรวมของวันก่อนหน้า |

เครื่องและ backend ต้องเปิดพร้อมเชื่อมต่ออินเทอร์เน็ตเมื่อถึงเวลาส่ง งานตั้งเวลาไม่ส่งย้อนหลังเมื่อเครื่องปิด และควรรัน backend เพียง instance เดียวเพื่อไม่ให้ส่งซ้ำ

สถานะ Online/Offline เป็นสถานะ ณ เวลาดึงข้อมูล ไม่ใช่ประวัติย้อนหลัง พื้นที่ของวันนี้เป็นยอดสะสมถึงเวลาที่ดึงข้อมูล รายละเอียดเพิ่มเติมอยู่ใน [คู่มือ Robot](server/ROBOT-TELEMETRY.md)

## ทดสอบและ build

รันทดสอบ backend จากโฟลเดอร์ `server`:

```powershell
npm test
```

รันทดสอบ frontend จากโฟลเดอร์ `service`:

```powershell
node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false --runInBand
```

สร้าง frontend สำหรับนำไปใช้งานจริง จากโฟลเดอร์ `service`:

```powershell
npm run build
```

ผลลัพธ์อยู่ที่ `service/build` การนำขึ้นใช้งานจริงต้องมี backend และ MongoDB ด้วย พร้อม reverse proxy สำหรับ `/api` และ `/uploads` ภายใต้ HTTPS origin เดียวกัน ตั้ง `NODE_ENV=production` และ `FRONTEND_ORIGINS` ให้ตรงกับเว็บไซต์

Backend ใช้ตัวจัดรูปแบบรายงานร่วมกับหน้าเว็บที่ `service/src/components/Page/Robot/robotReportText.js` จึงต้องนำไฟล์นี้ไปด้วยเมื่อ deploy backend

## การสำรองข้อมูลและขนาดโปรเจกต์

- เก็บโค้ด, `package.json` และ `package-lock.json` ไว้ใน Git
- `node_modules`, แคช `.cache`, `build` และ Python `venv` สร้างใหม่ได้ ไม่จำเป็นต้องแนบในการย้ายซอร์สโค้ด
- หยุด frontend ก่อนล้างแคช การเปิดครั้งแรกหลังล้างจะช้าลงเล็กน้อย
- สำรองฐานข้อมูล MongoDB และ `server/uploads` แยกจากโค้ด รวมทั้งเก็บ `.env` ไว้อย่างปลอดภัย
- `.gitignore` ไม่ลบไฟล์ที่เคย commit ไปแล้วออกจากประวัติ Git การล้างไฟล์ในเครื่องจึงอาจไม่ทำให้ `.git` เล็กลง

## เอกสารเพิ่มเติม

- [รายละเอียดการรันระบบและ session](service/README.md)
- [การเชื่อมต่อ Robot และรายงาน Telegram](server/ROBOT-TELEMETRY.md)
- [ตัวอย่างการตั้งค่า backend](server/.env.example)
- [ตัวอย่างการตั้งค่า frontend](service/.env.example)
