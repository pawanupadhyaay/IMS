# Samay Watch IMS - Backend

Production-grade Express.js backend for the Inventory Management System.

## Structure

```
backend/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware (auth, error handling)
├── models/          # Mongoose models
├── routes/          # API routes
├── server.js        # Main entry point
└── package.json
```

## Environment Variables

Create a `.env` file with:

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

## API Routes

All routes are prefixed with `/api`

- `/auth/*` - Authentication routes
- `/products/*` - Product management routes
- `/dashboard/*` - Dashboard statistics
- `/export/*` - Export functionality

## Models

### Product Model
Uses the existing MongoDB schema exactly as provided. No modifications made.

### User Model
Admin user model with JWT authentication.

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- CORS configuration

## Error Handling

Centralized error handling middleware for consistent API responses.

