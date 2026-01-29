# 🚀 How to Start Servers

## ⚠️ ECONNREFUSED Error Fix

Agar aapko `ECONNREFUSED` error aa raha hai, iska matlab **backend server running nahi hai**.

## ✅ Step-by-Step Solution

### Step 1: Backend Server Start Karein

**Terminal 1** (Backend):
```bash
cd backend
npm start
```

Ya development mode mein:
```bash
cd backend
npm run dev
```

**Expected Output:**
```
MongoDB Connected: ...
Server running on port 5000
```

### Step 2: Frontend Server Start Karein

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Verify Backend is Running

Browser mein open karein:
```
http://localhost:5000/api/health
```

Ya terminal mein:
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{"success":true,"message":"Server is running"}
```

## 🔍 Troubleshooting

### Backend Start Nahi Ho Raha?

1. **Check `.env` file** - `backend/.env` mein yeh hona chahiye:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

2. **Check MongoDB Connection** - MongoDB running hai ya nahi?

3. **Check Port 5000** - Koi aur service port 5000 use kar rahi hai?
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Kill process if needed
   taskkill /PID <PID> /F
   ```

### Frontend Proxy Error?

1. **Check Vite Config** - `frontend/vite.config.js`:
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:5000',  // Must match backend port
       changeOrigin: true,
     },
   }
   ```

2. **Restart Both Servers** - Dono servers restart karein

## 📝 Quick Check Script

Backend running hai ya nahi check karne ke liye:
```bash
node check-backend.js
```

## ✅ Success Indicators

- ✅ Backend: `Server running on port 5000`
- ✅ Frontend: `Local: http://localhost:5173/`
- ✅ Health Check: `{"success":true,"message":"Server is running"}`
- ✅ No ECONNREFUSED errors in console


