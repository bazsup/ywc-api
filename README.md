# YWC15-API

A backend API services that use for YWC registration. Reuse code from YWC#14

## Step of registration
1. คนตรวจคำถามกลาง สแกนตรวจคำถามกลางจากผู้สมัครทั้งหมด (ผ่าน/ไม่ผ่าน)
2. คนตรวจคำถามสาขา ตรวจคำถามสาขาทั้งหมด (ผ่าน/ไม่ผ่าน)

## User validation 
1. กรรมการคำถามกลาง
    - สาขาผู้สมัคร
    - ชั้นปี
    - อายุ
    - เพศ
    - คำตอบของคำถามกลาง

  2. กรรมการ
      - เห็นทุกอย่างของกรรมการคำถามกลาง
      - กิจกรรมที่ผ่านมา / ผลงาน
      - คำตอบคำถามสาขา
  3. Admin 
      - เห็น Stat ของระบบ (จำนวณผู้กด Login ทั้งหมด/กรอกประวัติเสร็จ/กรอกคำถามกลางเสร็จ/กรอกคำถามเสร็จทั้งหมด/สมัครเสร็จสิ้น)
      - View ประวัติของน้อง ที่สมัครอยู่แต่ละ state ของระบบ
  4. Super Admin
      - ทำได้ทุกอย่างที่ User ทุก role ทำได้
      - แก้ไขผลตรวจ จากผ่าน เป็นไม่ผ่านได้

## Getting Started
- run command `npm install` for install packages and dependencies
- config your application `config/default.json` for default config

```json
{
  "MONGODB_URI": "mongodb://user:pass@host:port/dbname",
  "STORAGE_PATH": "./uploads",
  "LIMIT_UPLOAD_FILES": 2,
  "LIMIT_UPLOAD_SIZE_MB": 2,
  "FACEBOOK_ID": "FACEBOOK_APPS_ID (Test Apps)",
  "FACEBOOK_SECRET": "FACEBOOK_APPS_SECRET (Test Apps)",
  "JWT_SECRET": "Ywc15WeAreAlwaysHiring"
}
```

- config your application for production environment in `config/production.json` (it will override redundant field)
```json
{
  "FACEBOOK_ID": "FACEBOOK_APPS_ID (Production)",
  "FACEBOOK_SECRET": "FACEBOOK_APPS_SECRET (Production)"
}
```

### Available Commands
- `npm run eslint`
- `npm run build`
- `npm run dev`
- `npm test`
- `npm run pm2-dev`

### Fixed on production
```
npm install babel-polypill babel-runtime bluebird —save
```

### Routes

#### Authentication
- `/auth/login` `method: post` - user login with facebook

#### Registration
- `/registration/major` `method: put` - set user major
- `/registration/info` `method: put` - save personal information
- `/registration/contact` `method: put` - save contact information
- `/registration/insight` `method: put` - save insight (know camp?, activities)
- `/registration/general` `method: put` - save general answers
- `/registration/special` `method: put` - save special-major answers
- `/registration/confirm` `method: post` - confirm registration
