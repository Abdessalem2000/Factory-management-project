# 🚀 GitHub Push & Deploy Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" button and select "New repository"
3. Repository name: `factory-management-platform`
4. Description: `Factory Management Platform with Algerian Dinar Support`
5. Make it **Public** or **Private** (your choice)
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

## Step 2: Push Your Code

Once you create the repository, GitHub will show you commands. Use these:

### Option A: HTTPS (Recommended for most users)
```bash
git remote add origin https://github.com/YOUR_USERNAME/factory-management-platform.git
git branch -M main
git push -u origin main
```

### Option B: SSH (If you have SSH keys set up)
```bash
git remote add origin git@github.com:YOUR_USERNAME/factory-management-platform.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Deploy Locally (While GitHub processes)

While GitHub is processing, you can deploy locally:

### Quick Docker Deployment
```bash
# Make sure you're in the project directory
cd "c:/Users/PC/Desktop/factory management project"

# Deploy with Docker
docker-compose up -d

# Check if everything is running
docker-compose ps
```

### Access Your Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Step 4: Verify Algerian Dinar Features

Once deployed, check these features:

### Dashboard
- Navigate to http://localhost:80
- Verify financial stats show د.ج symbols
- Check Arabic numerals display correctly

### Financial Tracking
- Go to Financial Tracking page
- Verify amounts show as "١,٥٠٠,٠٠٠ د.ج"
- Test income/expense displays

### Worker Management
- Check worker salaries display in DZD
- Verify Arabic names show correctly

## Step 5: Production Deployment (Optional)

If you have a server ready:

### Server Setup
```bash
# Copy setup script to server
scp scripts/setup-server.sh user@your-server:/tmp/

# Run server setup
ssh user@your-server "chmod +x /tmp/setup-server.sh && sudo /tmp/setup-server.sh"
```

### Deploy to Production
```bash
# SSH to server
ssh user@your-server

# Switch to factory user
su - factory

# Clone repository
cd /opt/factory-management-platform
git clone https://github.com/YOUR_USERNAME/factory-management-platform.git .

# Deploy
./scripts/deploy.sh production
```

## 🎯 What You Should See

### After Push to GitHub
✅ Repository at: https://github.com/YOUR_USERNAME/factory-management-platform
✅ All files committed and pushed
✅ README.md displays properly
✅ Docker files ready for deployment

### After Local Deployment
✅ Frontend running on port 80
✅ Backend API running on port 3001
✅ Algerian Dinar (د.ج) currency working
✅ Arabic numerals displaying correctly
✅ All pages loading without errors

## 🔧 Troubleshooting

### Git Push Issues
```bash
# If push fails, try forcing main branch
git push -f origin main

# If remote exists, remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/factory-management-platform.git
```

### Docker Issues
```bash
# Stop existing containers
docker-compose down

# Clean up
docker system prune -a

# Rebuild and start
docker-compose up --build -d
```

### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :80
netstat -ano | findstr :3001

# Kill processes
taskkill /F /PID <PROCESS_ID>
```

---

## 🎉 Ready to Launch!

Your Factory Management Platform is complete with:
- ✅ Algerian Dinar (د.ج) currency support
- ✅ Arabic numeral formatting
- ✅ Docker deployment ready
- ✅ GitHub repository prepared
- ✅ Production deployment scripts
- ✅ Monitoring and health checks

**Push to GitHub and deploy today!** 🚀
