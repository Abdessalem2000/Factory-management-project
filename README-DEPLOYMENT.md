# 🚀 Factory Management Platform - Deployment Ready

## 📦 Project Structure
```
factory-management-platform/
├── .github/workflows/          # GitHub Actions CI/CD
├── backend/                   # Node.js API server
│   ├── Dockerfile
│   ├── ecosystem.config.js     # PM2 configuration
│   ├── init-mongo.js         # Database initialization
│   └── healthcheck.js         # Health check script
├── frontend/                  # React application
│   └── Dockerfile
├── nginx/                    # Nginx configuration
├── docker-compose.yml          # Development deployment
├── docker-compose.prod.yml     # Production deployment
├── .env.production.example     # Production environment template
└── DEPLOYMENT.md            # Detailed deployment guide
```

## 🎯 Quick Deploy Options

### 1️⃣ Docker Local Deployment
```bash
# Clone and deploy locally
git clone <your-repo>
cd factory-management-platform
docker-compose up -d

# Access at:
# Frontend: http://localhost:80
# Backend: http://localhost:3001
# MongoDB: localhost:27017
```

### 2️⃣ Production Deployment
```bash
# Setup production environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### 3️⃣ GitHub Auto-Deployment
```bash
# Push to main branch - auto-deploys via GitHub Actions
git add .
git commit -m "Deploy to production"
git push origin main
```

## 🔧 Required Environment Variables

### Production (.env.production)
```env
NODE_ENV=production
PORT=3001
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://yourdomain.com
GITHUB_REPOSITORY=your-username/factory-management-platform
```

## 🔒 Security Setup

1. **Change Default Passwords**
   - MongoDB credentials
   - JWT secret key

2. **SSL Configuration**
   - Update nginx.conf with your domain
   - Add SSL certificates to nginx/ssl/

3. **GitHub Secrets** (for CI/CD)
   - `PROD_HOST`: Your server IP
   - `PROD_USER`: SSH username
   - `PROD_SSH_KEY`: SSH private key
   - `PROD_URL`: Your production URL

## 📊 Features Included

### ✅ Core Features
- **Production Management**: Order tracking and workflow management
- **Financial Tracking**: Algerian Dinar (د.ج) currency support
- **Supplier Management**: Supplier relationships and ratings
- **Worker Management**: Employee management with Arabic names
- **Dashboard**: Real-time statistics and KPIs

### ✅ Technical Features
- **TypeScript**: Full type safety
- **Docker**: Containerized deployment
- **Nginx**: Reverse proxy with SSL
- **MongoDB**: Document database
- **React**: Modern frontend with hooks
- **Express**: RESTful API backend
- **CI/CD**: GitHub Actions automation

### ✅ Algerian Localization
- **Currency**: Algerian Dinar (د.ج) with Arabic numerals
- **Language**: Arabic worker names and content
- **Formatting**: RTL-compatible layouts
- **Data**: Realistic DZD amounts (e.g., 1,500,000 د.ج)

## 🌐 Access Points

### Development
- **Frontend**: http://localhost:5175
- **Backend**: http://localhost:3001
- **Database**: mongodb://localhost:27017

### Production
- **Frontend**: https://yourdomain.com
- **Backend**: https://yourdomain.com/api
- **Database**: mongodb://admin:password@server:27017

## 📱 Testing

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:80/health
```

### Database Connection
```bash
# Test MongoDB
mongosh "mongodb://admin:password@localhost:27017/factory_management?authSource=admin"
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Backup Database
```bash
# MongoDB backup
docker exec factory-mongodb mongodump --out /backup
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Kill existing processes
2. **Database connection**: Check MongoDB credentials
3. **Build failures**: Clear Docker cache
4. **SSL errors**: Verify certificate paths

### Performance
- Monitor memory usage with `docker stats`
- Check database indexes
- Enable gzip compression
- Use CDN for static assets

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check network connectivity

## 🎯 Next Steps

1. **Domain Setup**: Configure DNS for your domain
2. **SSL Certificate**: Obtain from Let's Encrypt
3. **Monitoring**: Set up uptime monitoring
4. **Backup**: Implement automated backups
5. **Scaling**: Plan for load balancing

---

**🎉 Your Factory Management Platform is now deployment-ready!**

Push to GitHub and deploy with one command! 🚀
