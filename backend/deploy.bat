@echo off
echo 🚀 DataBoard Backend Deployment Helper
echo ======================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Copy environment file if it doesn't exist
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update the .env file with your configuration
) else (
    echo ✅ .env file already exists
)

:: Run tests
echo 🧪 Running API tests...
call npm test

if %errorlevel% neq 0 (
    echo ❌ Tests failed. Please fix the issues before deploying.
    pause
    exit /b 1
)

echo ✅ All tests passed!

:: Show deployment options
echo.
echo 🎯 Deployment Options:
echo =====================
echo.
echo 1. 🔵 Render.com Deployment:
echo    - Go to https://dashboard.render.com/
echo    - Click 'New +' → 'Web Service'
echo    - Connect your repository
echo    - Use these settings:
echo      • Build Command: npm install
echo      • Start Command: npm start
echo      • Environment: Node
echo      • Node Version: 18
echo.
echo 2. 🟢 Railway Deployment:
echo    - Go to https://railway.app/
echo    - Click 'Deploy from GitHub repo'
echo    - Select your repository
echo    - Railway will auto-detect Node.js
echo.
echo 3. 🟡 Heroku Deployment:
echo    - Install Heroku CLI
echo    - Run: heroku create your-app-name
echo    - Run: git push heroku main
echo.
echo 4. 🟣 Local Production:
echo    - Run: set NODE_ENV=production ^&^& npm start
echo.
echo 📋 Required Environment Variables for Production:
echo ===============================================
echo • PORT=10000
echo • NODE_ENV=production
echo • FRONTEND_URL=https://your-frontend-domain.vercel.app
echo • API_CACHE_TTL=1800
echo.
echo 🌐 After deployment, test your API:
echo • Health check: GET https://your-backend-url.com/api/health
echo • Happiness data: GET https://your-backend-url.com/api/happiness/global/2023
echo.
echo ✨ Deployment preparation complete!
echo 📚 See README.md for detailed deployment instructions.
echo.
pause
