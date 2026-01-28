# Quick Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB connection string
- npm or yarn

## Step 1: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Step 2: Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Step 3: Access the Application

1. Open `http://localhost:5173` in your browser
2. Register a new admin account (or login if you already have one)
3. You'll be redirected to the dashboard

## Disabling Signup

To disable user registration (login-only mode):

1. Open `backend/routes/authRoutes.js`
2. Comment out the register route:
```javascript
// router.post("/register", register);
```

## Production Deployment

### Backend (DigitalOcean)
1. Set environment variables on your server
2. Run `npm install --production`
3. Start with `npm start` or use PM2

### Frontend (Hostinger)
1. Run `npm run build` in the frontend directory
2. Upload the `dist` folder contents to Hostinger
3. Configure your web server to serve the built files

## Important Notes

- The MongoDB database already contains 5000+ products
- No database migrations or seeding required
- The Product schema is used exactly as provided (no modifications)
- All media is stored as URLs (external object storage)

