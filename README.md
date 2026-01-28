# Samay Watch IMS

Production-grade Inventory Management System for Samay Watch.

## Project Structure

```
Samay Watch IMS/
├── frontend/          # React + Vite frontend
└── backend/           # Node.js + Express backend
```

## Tech Stack

### Frontend
- React.js 18
- Vite
- React Router
- Axios
- React Window (for virtualization)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Joi Validation

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

### Authentication
- Admin login system
- User registration (can be easily disabled by commenting out the route)
- JWT-based authentication
- Protected routes

### Dashboard
- Real-time inventory statistics:
  - Total Products
  - Total Stock
  - Total Store Value (₹)
  - Out of Stock Count
- Brand filter
- Search functionality
- CSV export
- Pagination support

### Inventory Management
- View all products in a virtualized table
- Create new products
- Edit existing products
- Delete products
- View product details
- Real-time UI updates after CRUD operations

### Product Management
- Full CRUD operations
- Inventory tracking
- Price management
- Product metadata (case material, dial color, water resistance, etc.)
- Image URL management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with filters, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/brands/list` - Get all unique brands

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Export
- `GET /api/export/csv` - Export products to CSV

## Database

The system uses an existing MongoDB database with:
- 5000+ watch products already populated
- Existing Product schema (unchanged)
- No database migrations required
- No seed data needed

## Performance Optimizations

- Virtualized table rendering for large datasets
- Pagination on backend
- Efficient MongoDB queries with indexes
- Real-time UI updates without full page reloads
- Optimized re-renders

## Architecture

### Backend
- Layered architecture (routes → controllers → models)
- Separation of concerns
- API-first design
- Business logic in controllers
- Error handling middleware
- Authentication middleware

### Frontend
- Component-based architecture
- Service layer for API calls
- Context API for state management
- Virtualized rendering for performance
- Professional admin UI design

## Deployment

### Frontend (Hostinger)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Hostinger

### Backend (DigitalOcean)
1. Set environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`

## Notes

- Signup route can be easily disabled by commenting out the register route in `backend/routes/authRoutes.js`
- The system is designed as a central IMS that can integrate with ecommerce platforms
- All product data uses the existing MongoDB schema without modifications
- Media is stored as URLs (external object storage), not as database blobs

## License

ISC

