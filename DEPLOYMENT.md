# Factory Management Platform - Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Git installed

#### Quick Deploy
```bash
# Clone your repository
git clone <your-repo-url>
cd factory-management-platform

# Build and start all services
docker-compose up -d

# Check status
docker-compose ps
```

#### Services
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017

#### Environment Variables
Edit `docker-compose.yml` to update:
- MongoDB credentials
- JWT secret key
- Production URLs

---

### Option 2: Manual Deployment

#### Backend Deployment
```bash
cd backend
npm install --production
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# Or start directly
npm start
```

#### Frontend Deployment
```bash
cd frontend
npm install
npm run build

# Deploy dist folder to your web server
# Example for Nginx:
sudo cp -r dist/* /var/www/html/
```

---

### Option 3: Cloud Deployment

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `JWT_SECRET=<your-jwt-secret>`
   - `FRONTEND_URL=<your-frontend-url>`

#### MongoDB Atlas
1. Create free cluster at https://cloud.mongodb.com
2. Get connection string
3. Update environment variables

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_NODE_ENV=production
```

---

## 🌐 Production Setup

### Nginx Configuration (for manual deployment)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring & Logs

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 restart all
```

---

## 🔒 Security Considerations

1. **Change Default Passwords**: Update MongoDB credentials
2. **Environment Variables**: Never commit .env files
3. **JWT Secret**: Use strong, random secret
4. **HTTPS**: Enable SSL in production
5. **Firewall**: Configure proper firewall rules
6. **Regular Updates**: Keep dependencies updated

---

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :3001

# Kill processes
sudo kill -9 <PID>
```

#### MongoDB Connection
```bash
# Test connection
mongo "mongodb://username:password@host:port/database"

# Check logs
docker-compose logs mongodb
```

#### Build Failures
```bash
# Clear cache
docker system prune -a
docker-compose down --volumes
docker-compose up --build
```

---

## 📱 Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize images and assets

### Backend
- Use connection pooling
- Implement caching (Redis)
- Set up database indexes
- Monitor memory usage

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Ensure all services are running
5. Check network connectivity

## 🎯 Next Steps

1. Set up monitoring (Uptime, Performance)
2. Implement backup strategies
3. Set up alerting
4. Plan scaling strategy
5. Document custom configurations
