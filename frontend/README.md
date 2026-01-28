# Samay Watch IMS - Frontend

React + Vite frontend for the Inventory Management System.

## Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── context/       # React Context (Auth)
│   ├── pages/         # Page components
│   ├── services/      # API service layer
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── index.html
└── vite.config.js
```

## Features

- React Router for navigation
- Context API for authentication state
- Virtualized table for performance
- Real-time UI updates
- Professional admin interface

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output will be in the `dist` folder.

## Components

- `Dashboard` - Main inventory dashboard
- `InventoryTable` - Virtualized product table
- `StatsCards` - Dashboard statistics cards
- `ProductModal` - Product CRUD modal
- `Login` / `Register` - Authentication pages

## Services

- `api.js` - Axios instance with base configuration
- `productService.js` - Product API calls
- `dashboardService.js` - Dashboard API calls
- `exportService.js` - CSV export functionality

