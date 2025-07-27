# DataBoard Backend API

A Node.js/Express backend API for the Global Happiness Dashboard that provides endpoints for happiness data, economic indicators, and regional classifications.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── routes/           # API route handlers
│   ├── happiness.js  # Happiness data endpoints
│   ├── indicators.js # Economic indicator endpoints
│   └── classifications.js # Country/region classification endpoints
├── services/         # External API services
│   ├── happiness.js  # Happiness data processing
│   └── worldbank.js  # World Bank API integration
├── server.js         # Main application file
├── package.json      # Dependencies and scripts
└── .env              # Environment configuration
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health and status

### Happiness Data
- `GET /api/happiness/global/:year` - Global happiness data for a year
- `GET /api/happiness/:country` - Country-specific happiness data
- `GET /api/happiness/analysis/india` - India-specific correlation analysis

### Economic Indicators
- `GET /api/indicator/:country/:indicator` - Get indicator data for a country
- Query parameters: `start`, `end` (year range)

### Classifications
- `GET /api/classifications/countries/:region` - Get countries in a region
- `GET /api/classifications/regions` - Get all available regions

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `API_CACHE_TTL` | Cache TTL in seconds | 1800 |
| `REQUEST_TIMEOUT` | Request timeout in ms | 30000 |

## 🚢 Deployment on Render

### Step 1: Prepare Repository
Ensure your backend folder is in a Git repository.

### Step 2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:

### Step 3: Service Configuration
```yaml
# Render Configuration
Build Command: npm install
Start Command: npm start
Environment: Node
Node Version: 18
```

### Step 4: Environment Variables in Render
Set these environment variables in Render dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=10000
API_CACHE_TTL=1800
```

### Step 5: Deploy
Click "Create Web Service" and wait for deployment.

## 📊 Performance Features

- **Caching**: In-memory caching with configurable TTL
- **CORS**: Secure cross-origin resource sharing
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Health check endpoint with system stats
- **Request Logging**: Detailed request logging for debugging

## 🔐 Security Features

- CORS protection with configurable origins
- Request size limits
- Error message sanitization in production
- Graceful shutdown handling

## 📈 Monitoring

The `/api/health` endpoint provides:
- Server status
- Uptime information
- Cache statistics
- Memory usage
- Environment information

## 🧪 Testing

Test the API endpoints:
```bash
npm test
```

Or test specific endpoints:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/happiness/global/2023
```

## 📝 Logs

The server logs include:
- Request timestamps and details
- Error stack traces (development only)
- Cache statistics
- Server startup information

## 🔄 Graceful Shutdown

The server handles shutdown signals gracefully:
- SIGTERM and SIGINT are handled
- Cache is properly closed
- Ongoing requests complete before shutdown

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
