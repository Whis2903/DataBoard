# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 📋 Code Quality
- [x] All API tests pass (`npm test`)
- [x] No ESLint errors or warnings
- [x] Environment variables properly configured
- [x] Error handling implemented
- [x] Request logging enabled
- [x] CORS properly configured
- [x] Health check endpoint available

### 🛡️ Security
- [x] Environment variables used for sensitive data
- [x] CORS origins restricted to frontend domains
- [x] Request size limits implemented
- [x] Error messages sanitized in production
- [x] No hardcoded secrets in code

### 🔧 Configuration
- [x] Package.json configured for production
- [x] Environment example file created
- [x] Proper Node.js version specified (18+)
- [x] Start script properly defined
- [x] Health check endpoint implemented

## 🌐 Render.com Deployment Steps

### 1. Repository Setup
- [ ] Code pushed to GitHub repository
- [ ] Backend folder contains all necessary files
- [ ] .env.example file present
- [ ] README.md documentation complete

### 2. Render Service Creation
1. [ ] Go to https://dashboard.render.com/
2. [ ] Click "New +" → "Web Service"
3. [ ] Connect your GitHub repository
4. [ ] Select the backend folder (if monorepo)

### 3. Service Configuration
```yaml
Name: databoard-backend
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free (or paid for production)
Node Version: 18
```

### 4. Environment Variables
Set these in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.vercel.app
API_CACHE_TTL=1800
REQUEST_TIMEOUT=30000
WORLD_BANK_API_BASE=https://api.worldbank.org/v2
WORLD_BANK_REQUEST_TIMEOUT=10000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 5. Health Check Configuration
- [ ] Set Health Check Path: `/api/health`
- [ ] Health check should return 200 status

## 🧪 Post-Deployment Testing

### Manual Testing
Test these endpoints after deployment:

1. **Health Check**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Expected: 200 status with server info

2. **Global Happiness Data**
   ```bash
   curl https://your-backend-url.onrender.com/api/happiness/global/2023
   ```
   Expected: Array of country happiness data

3. **Country Indicator Data**
   ```bash
   curl "https://your-backend-url.onrender.com/api/indicator/IND/NY.GDP.PCAP.CD?start=2020&end=2022"
   ```
   Expected: Array of GDP data for India

4. **Country Classifications**
   ```bash
   curl https://your-backend-url.onrender.com/api/classifications/regions
   ```
   Expected: Array of available regions

5. **CORS Test**
   - Open browser console on your frontend domain
   - Test API calls to ensure CORS is working

### Performance Testing
- [ ] Response times under 5 seconds for most endpoints
- [ ] Cache is working properly (check logs)
- [ ] Memory usage is stable
- [ ] No memory leaks over time

## 🔄 Frontend Integration

After backend deployment:

1. **Update Frontend Environment**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Test Frontend-Backend Integration**
   - [ ] All dashboard pages load correctly
   - [ ] Data visualizations render properly
   - [ ] Error handling works for API failures
   - [ ] Loading states display correctly

## 📊 Monitoring

### Render Dashboard
- [ ] Check deployment logs for errors
- [ ] Monitor resource usage
- [ ] Set up alerts for downtime

### Application Monitoring
- [ ] Monitor `/api/health` endpoint regularly
- [ ] Check cache hit rates in logs
- [ ] Monitor API response times
- [ ] Track error rates

### Log Monitoring
Key log patterns to watch:
- `❌` - Error indicators
- `Cache hit/miss` - Cache performance
- `[ERROR]` - Application errors
- Response time patterns

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**
   - Check Node.js version compatibility
   - Verify package.json dependencies
   - Check for missing environment variables

2. **Runtime Errors**
   - Check environment variables are set
   - Verify external API connectivity (World Bank)
   - Check memory limits

3. **CORS Issues**
   - Verify FRONTEND_URL is correctly set
   - Check frontend domain matches exactly
   - Ensure protocol (https/http) is correct

4. **Performance Issues**
   - Check cache configuration
   - Monitor World Bank API response times
   - Consider upgrading Render instance

### Debug Commands
```bash
# Check environment
curl https://your-backend-url.onrender.com/api/health

# Test specific endpoint
curl -v https://your-backend-url.onrender.com/api/happiness/global/2023

# Check CORS headers
curl -H "Origin: https://your-frontend-domain.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-url.onrender.com/api/health
```

## ✅ Final Checklist

- [ ] Backend deployed successfully
- [ ] All health checks passing
- [ ] Frontend connected to backend
- [ ] All features working end-to-end
- [ ] Performance is acceptable
- [ ] Monitoring is in place
- [ ] Documentation is updated

## 🎉 Success!

Your DataBoard backend is now production-ready and deployed! 

**Backend URL**: `https://your-backend-url.onrender.com`
**Health Check**: `https://your-backend-url.onrender.com/api/health`
**API Documentation**: See README.md for endpoint details
