# Global Happiness Dashboard

A modern, interactive dashboard built with Next.js and Plotly.js that visualizes global happiness data through multiple analytical perspectives. The dashboard provides insights into happiness indicators, country comparisons, regional analysis, and India-specific correlations.

## Features

### 📊 Multi-Tab Dashboard
- **Country Comparison**: Compare happiness indicators between two countries over time
- **Indicator Comparison**: Analyze multiple indicators for selected countries and years
- **World Map**: Global happiness visualization with interactive map
- **India Dashboard**: Detailed analysis of happiness correlations specific to India
- **Regional Comparison**: Compare happiness scores across different regions

### 🎯 Key Capabilities
- Interactive Plotly.js charts with zoom, pan, and hover features
- Real-time data visualization from happiness datasets
- Country and indicator selection with dynamic filtering
- Correlation analysis with both positive and negative relationships
- Responsive design optimized for desktop and mobile

## Project Structure

```
databoard/
├── src/
│   ├── app/
│   │   └── page.tsx                 # Main dashboard with tab navigation
│   ├── components/
│   │   └── Charts.tsx               # Chart wrapper components
│   └── pages/
│       ├── indicator-trends.tsx     # Country comparison tab
│       ├── indicator-comparison.tsx # Indicator comparison tab
│       ├── world-map.tsx           # World map visualization
│       ├── india-dashboard.tsx     # India-specific analysis
│       └── regional-comparison.tsx # Regional comparison
├── backend/
│   ├── server.js                   # Express server
│   ├── routes/
│   │   └── happiness.js            # API routes
│   └── services/
│       └── happiness.js            # Data processing logic
├── data/
│   └── [happiness dataset files]   # CSV data files
├── .env.local                      # Environment configuration
└── package.json
```

## Prerequisites

Before setting up the project, ensure you have the following installed:
- **Node.js** (version 16.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)

## Local Setup Instructions

### 1. Clone or Download the Project

If using Git:
```bash
git clone <repository-url>
cd databoard
```

Or download and extract the project files to your desired directory.

### 2. Install Dependencies

Navigate to the project root directory and install dependencies:

```bash
# Install frontend dependencies
npm install

# Navigate to backend directory and install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env.local` file in the project root (if it doesn't exist) with the following configuration:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Backend Configuration (for reference)
PORT=5000
```

**Important**: The backend server runs on port 5000, and the frontend expects the API at `http://localhost:5000/api`.

### 4. Prepare Data Files

Ensure your happiness dataset CSV files are placed in the `data/` directory. The expected files include:
- Happiness scores by country and year
- Regional classification data
- Indicator-specific datasets

### 5. Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:5000`. You should see:
```
Server running on port 5000
```

### 6. Start the Frontend Development Server

Open a **new terminal** window/tab, navigate to the project root, and start the frontend:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`. You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 7. Access the Dashboard

Open your web browser and navigate to:
```
http://localhost:3000
```

You should see the Global Happiness Dashboard with multiple tabs available.

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/happiness/countries` - Get list of all countries
- `GET /api/happiness/indicators` - Get list of all indicators
- `GET /api/happiness/years` - Get available years
- `GET /api/happiness/data` - Get happiness data with optional filters
- `GET /api/happiness/regions` - Get regional data
- `GET /api/happiness/india-correlations` - Get India-specific correlations

## Usage Guide

### Country Comparison Tab
1. Select two countries from the dropdown menus
2. Choose an indicator to compare
3. View the interactive line chart showing trends over time

### Indicator Comparison Tab
1. Select countries and years using the multi-select dropdowns
2. Choose indicators to compare
3. Analyze the bar chart showing comparative values

### World Map Tab
1. Select a year using the dropdown
2. View global happiness distribution on the interactive map
3. Hover over countries for detailed information

### India Dashboard Tab
1. View correlation analysis between happiness and various indicators
2. Examine both positive and negative correlations
3. Review the detailed correlation table

### Regional Comparison Tab
1. Select specific years for analysis
2. Compare happiness scores across different world regions
3. Analyze regional trends and patterns


## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Charts**: Plotly.js (react-plotly.js)
- **Backend**: Node.js, Express.js
- **Data Processing**: CSV parsing, statistical calculations
- **Styling**: Tailwind CSS with responsive design
