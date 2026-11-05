# 🌾 Korat Smart Agri Platform

**Korat Smart Agri Platform** คือแพลตฟอร์มบริหารจัดการและส่งเสริมเกษตรกรรมอัจฉริยะ สำหรับพื้นที่จังหวัดนครราชสีมา (โคราช) ช่วยในการติดตามสภาพแวดล้อม วิเคราะห์ข้อมูลการเกษตร และการบริหารจัดการฟาร์มด้วยเทคโนโลยีระดับสูง

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend Framework:** React + TypeScript (TypeScript 98.8%)
* **Runtime & Package Manager:** [Bun](https://bun.sh/) (`bun.lock`)
* **Database & Cloud Services:** Firebase / Cloud Firestore (`firestore.rules`, `firebase-blueprint.json`, `firebase-applet-config.json`)
* **Code Quality & Testing:** ESLint (`eslint.config.js`), Firestore Security Rules Testing (`firestore.rules.test.ts`)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Korat-Smart-Agri/
├── public/                     # โฟลเดอร์จัดเก็บ Static Assets และรูปภาพ
├── src/                        # ซอร์สโค้ดหลักของแอปพลิเคชัน
├── .env.example                # ตัวอย่างการตั้งค่า Environment Variables
├── .gitignore                  # กำหนดไฟล์ที่ไม่ต้องการจัดเก็บลง Git
├── DRAFT_firestore.rules       # ฉบับร่างกฎความปลอดภัย Firestore
├── bun.lock                    # ไฟล์ Lock dependencies ของ Bun
├── eslint.config.js            # ไฟล์ตั้งค่า ESLint สำหรับตรวจเช็คคุณภาพโค้ด
├── firebase-applet-config.json # ไฟล์ตั้งค่าคอนฟิก Firebase Applet
├── firebase-blueprint.json     # พิมพ์เขียวโครงสร้างข้อมูล Firebase
├── firestore.rules             # กฎความปลอดภัย Firestore ที่ใช้งานจริง
├── firestore.rules.test.ts     # ไฟล์ Unit Test สำหรับกฎความปลอดภัย Firestore
└── index.html                  # ไฟล์หน้าเว็บหลัก
```

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
เครื่องคอมพิวเตอร์ต้องมีการติดตั้ง **Bun** เรียบร้อยแล้ว:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. ดาวน์โหลดโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/thitiwass-sketch/Korat-Smart-Agri.git
cd Korat-Smart-Agri
```

### 3. ติดตั้ง Dependencies
```bash
bun install
```

### 4. ตั้งค่า Environment Variables
คัดลอกไฟล์ตัวอย่าง `.env.example` ไปเป็น `.env` แล้วระบุค่า API Keys และ Firebase Configurations:
```bash
cp .env.example .env
```

### 5. การรันโปรเจกต์ (Running the Application)

* **รัน Development Server:**
  ```bash
  bun run dev
  ```

* **ทดสอบ Firestore Security Rules:**
  ```bash
  bun test firestore.rules.test.ts
  ```

* **ตรวจเช็คคุณภาพโค้ดด้วย ESLint:**
  ```bash
  bun run lint
  ```

---

## 👥 ผู้พัฒนา (Contributors)

* **Thitiwass** ([@thitiwass-sketch](https://github.com/thitiwass-sketch))

---

## 📄 License

จัดทำขึ้นสำหรับโปรเจกต์ **Korat Smart Agri Platform**
