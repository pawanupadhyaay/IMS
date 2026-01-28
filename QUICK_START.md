# Quick Start Guide (हिंदी में)

## Step 1: Backend Setup

```bash
cd backend
npm install
```

**Important:** `backend/.env` file में अपना MongoDB connection string डालें:

```env
MONGODB_URI=your-actual-mongodb-connection-string
```

फिर backend चलाएं:
```bash
npm run dev
```

Backend `http://localhost:5000` पर चलेगा ✅

---

## Step 2: Frontend Setup

नया terminal खोलें:

```bash
cd frontend
npm install
```

फिर frontend चलाएं:
```bash
npm run dev
```

Frontend `http://localhost:5173` पर चलेगा ✅

---

## Step 3: Browser में खोलें

1. Browser में जाएं: `http://localhost:5173`
2. पहली बार Register करें (या Login करें)
3. Dashboard दिखेगा!

---

## ⚠️ Important Notes:

1. **MongoDB Connection:** `backend/.env` file में `MONGODB_URI` अपडेट करना जरूरी है
2. **Ports:** Backend (5000) और Frontend (5173) दोनों चलने चाहिए
3. **First Time:** पहली बार Register करके admin account बनाएं

---

## Troubleshooting:

- **MongoDB connection error?** → `.env` file में सही connection string डालें
- **Port already in use?** → दूसरा port use करें या running process बंद करें
- **Dependencies error?** → `npm install` दोबारा चलाएं

