# Factory Management Platform - Startup Guide

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or cloud instance)
- npm or yarn

### 1. Install Dependencies

```bash
# Install all dependencies for root, backend, and frontend
npm run install-all
```

### 2. Environment Setup

#### Backend Environment
```bash
# Copy the example environment file
cd backend
cp .env.example .env

# Edit the .env file with your configuration
# Important: Change JWT_SECRET in production
```

#### Frontend Environment
```bash
# Copy the example environment file
cd ../frontend
cp .env.example .env

# Edit the .env file if needed (defaults should work for development)
```

### 3. Database Setup

Make sure MongoDB is running locally or update the `MONGODB_URI` in `backend/.env` to point to your MongoDB instance.

### 4. Start the Application

```bash
# From the root directory, start both frontend and backend
npm run dev
```

This will start:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

### 5. Access the Application

Open your browser and navigate to http://localhost:5173

## Development Commands

### Backend Only
```bash
cd backend
npm run dev
```

### Frontend Only
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
npm run build
```

### Production Start
```bash
npm start
```

## API Documentation

Once the backend is running, you can access:
- Health Check: http://localhost:3000/api/health
- API Endpoints: http://localhost:3000/api/

## Features Available

### ✅ Completed Features
1. **Production Management**
   - Create, view, and manage production orders
   - Track production stages and progress
   - Filter by status and priority

2. **Financial Tracking**
   - Record income and expenses
   - View financial summaries and reports
   - Categorize transactions

3. **Supplier Management**
   - Add and manage suppliers
   - Track supplier ratings and contact information
   - Filter by status and categories

4. **Worker Management**
   - Manage worker profiles and information
   - Track skills and payment rates
   - Filter by department and status

5. **Dashboard**
   - Overview statistics for all modules
   - Real-time data visualization
   - Key performance indicators

### 🚧 Pending Features
- Authentication and authorization system
- Advanced reporting and analytics
- File upload capabilities
- Email notifications
- Mobile responsive design improvements

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in backend/.env
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in backend/.env (default: 3000)
   - Change port in vite.config.ts (default: 5173)

3. **CORS Errors**
   - Ensure FRONTEND_URL in backend/.env matches your frontend URL
   - Check that the backend is running before starting frontend

4. **Module Not Found Errors**
   - Run `npm run install-all` to ensure all dependencies are installed
   - Clear node_modules and reinstall if issues persist

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check that all dependencies are installed

## Next Steps

1. Set up authentication system
2. Add more advanced filtering and search
3. Implement data export functionality
4. Add real-time updates with WebSockets
5. Create mobile app version
