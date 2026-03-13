# Factory Management Platform

A comprehensive Factory Management Platform designed to centralize and simplify key operational processes within a manufacturing environment.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui, Lucide icons
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Development**: Vite, nodemon, concurrently

## Features

### Core Capabilities

1. **Production Management**
   - Track production orders through structured workflows
   - Monitor progress at each stage
   - Real-time production analytics

2. **Financial Tracking**
   - Manage expenses and income streams
   - Supplier payment tracking
   - Clear financial visibility and reporting

3. **Supplier Management**
   - Organize supplier relationships
   - Track deliveries and inventory
   - Monitor payment balances

4. **Worker Management**
   - Assign tasks to piece workers
   - Calculate payments based on completed work
   - Performance tracking

5. **Modern User Interface**
   - Responsive design with TailwindCSS
   - Modern components with shadcn/ui
   - Intuitive dashboards and workflows

## Project Structure

```
factory-management-platform/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── package.json       # Root package configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install-all
   ```

### Environment Setup

1. Create environment files:
   - `backend/.env` - Backend environment variables
   - `frontend/.env` - Frontend environment variables

2. Configure MongoDB connection in `backend/.env`

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## API Documentation

API endpoints are documented using Swagger/OpenAPI and available at `http://localhost:3000/api-docs` in development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
