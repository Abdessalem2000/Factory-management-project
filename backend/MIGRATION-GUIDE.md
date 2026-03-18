# 🔄 Migration Guide: MongoDB → Supabase with Prisma

## 📋 Overview
This guide walks you through migrating your Factory Management backend from MongoDB to Supabase PostgreSQL using Prisma ORM.

## 🎯 Benefits of Migration
- ✅ **Type Safety**: Full TypeScript support with auto-completion
- ✅ **Performance**: PostgreSQL is faster for complex queries
- ✅ **Security**: Built-in RLS (Row Level Security) in Supabase
- ✅ **Scalability**: Better for production workloads
- ✅ **Real-time**: Built-in WebSocket support
- ✅ **Dashboard**: Beautiful admin interface for data management

## 🚀 Migration Steps

### 1. Setup Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `factory-management-db`
3. Choose region closest to your users
4. Set strong database password
5. Wait for project creation (2-3 minutes)

### 2. Get Connection Details
In Supabase Dashboard → Settings → Database:
- **Connection String**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **Project URL**: `https://[PROJECT-REF].supabase.co`
- **Service Role Key**: Settings → API
- **Anon Key**: Settings → API

### 3. Configure Environment
Update your `.env` file:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_SERVICE_KEY="[YOUR-SERVICE-ROLE-KEY]"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
```

### 4. Install Dependencies
```bash
cd backend
npm install @prisma/client prisma
npm install -D tsx
```

### 5. Initialize Prisma
```bash
npx prisma init
# This creates prisma/schema.prisma (already done)
```

### 6. Generate Prisma Client
```bash
npx prisma generate
```

### 7. Push Schema to Supabase
```bash
npx prisma db push
```

### 8. Seed Database with Algerian Data
```bash
npx prisma db seed
```

### 9. Update Server to Use Prisma
The server files are already created:
- `src/lib/prisma.ts` - Prisma client instance
- `src/services/workerService.ts` - Business logic
- `src/controllers/workerController.ts` - HTTP handlers
- `src/routes/workerRoutes.ts` - Route definitions

### 10. Update Main Server
Add Prisma routes to your main server file:
```typescript
import workerRoutes from './src/routes/workerRoutes'

// Add to your Express app
app.use('/api/workers', workerRoutes)
```

## 🗄️ Database Schema Overview

### Workers Table
```sql
- id (cuid)
- employeeId (unique)
- firstName, lastName
- email (unique)
- position, department
- status (enum)
- hourlyRate, currency
- paymentType (enum)
- hireDate, skills[]
- createdAt, updatedAt
```

### Suppliers Table
```sql
- id (cuid)
- name, contactPerson
- email (unique), phone
- address (relation)
- taxId, paymentTerms
- categories[], status, rating
- createdAt, updatedAt
```

### Raw Materials Table
```sql
- id (cuid)
- name, reference (unique)
- category, unit (enums)
- currentStock, minStockAlert
- unitCost, supplierId (relation)
- location, status
- createdAt, updatedAt
```

### Production Orders Table
```sql
- id (cuid)
- orderNumber (unique)
- customerName, productType
- quantity, unitPrice, totalAmount
- status, priority (enums)
- dates, notes
- createdAt, updatedAt
```

### Expenses & Incomes Tables
```sql
- id (cuid)
- reference (unique)
- description, amount
- category, subcategory
- date, paymentMethod
- status, tags[]
- relations to suppliers, workers, orders
- createdAt, updatedAt
```

## 🧪 Testing the Migration

### 1. Test Worker Endpoints
```bash
# Get all workers
curl http://localhost:3000/api/workers

# Create new worker
curl -X POST http://localhost:3000/api/workers \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP006",
    "firstName": "Testing",
    "lastName": "User",
    "email": "test@factory.dz",
    "position": "Test Position",
    "department": "Testing",
    "hourlyRate": 3500
  }'

# Get worker by ID
curl http://localhost:3000/api/workers/[WORKER_ID]

# Search workers
curl "http://localhost:3000/api/workers?search=ahmed"
```

### 2. Test with Frontend
The frontend forms are already compatible with the new SQL schema:
- ✅ Worker form fields match SQL columns
- ✅ Validation works with new types
- ✅ API calls use correct endpoints
- ✅ Error handling is improved

## 🔧 Troubleshooting

### Common Issues

#### 1. Prisma Client Not Found
```bash
npx prisma generate
```

#### 2. Database Connection Error
- Check DATABASE_URL in .env
- Verify Supabase project is active
- Check network connectivity

#### 3. Schema Mismatch
```bash
npx prisma db push --force-reset
npx prisma db seed
```

#### 4. Type Errors
```bash
npx prisma generate
# Restart TypeScript server in your IDE
```

## 📊 Data Migration (Optional)

If you need to migrate existing MongoDB data:
1. Export MongoDB data as JSON
2. Transform data to match Prisma schema
3. Import using Prisma Client
4. Validate data integrity

## 🚀 Deployment

### Render Deployment
1. Update environment variables in Render dashboard
2. Add Prisma scripts to package.json (already done)
3. Deploy - Render will run `npm run build`
4. Test endpoints in production

### Environment Variables for Production
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_SERVICE_KEY=[SERVICE-KEY]
SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_URL=https://[PROJECT-REF].supabase.co
```

## 🎉 Success Indicators

- ✅ All API endpoints return data
- ✅ Frontend forms submit successfully
- ✅ Data appears in Supabase dashboard
- ✅ No TypeScript errors
- ✅ Production deployment works
- ✅ Performance is improved

## 📚 Next Steps

1. **Monitor Performance**: Use Supabase dashboard to monitor queries
2. **Add RLS**: Implement Row Level Security for multi-tenancy
3. **Real-time Features**: Use Supabase Realtime for live updates
4. **Backup Strategy**: Configure automatic backups in Supabase
5. **Analytics**: Use Supabase analytics for insights

## 🆘 Support

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Discord Communities**: Both have active Discord servers
- **GitHub Issues**: Check existing issues for common problems

---

**🎯 Goal**: Complete migration with zero downtime and improved performance!
