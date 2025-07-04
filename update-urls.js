import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Get all TypeScript files
const files = [
  'src/components/charts/AllRegionsComparisonChart.tsx',
  'src/components/charts/CountryTrendsChart.tsx', 
  'src/components/charts/GlobalHappinessMap.tsx',
  'src/components/charts/HappinessComparisonChart.tsx',
  'src/components/charts/IndiaCorrelationDashboard.tsx',
  'src/components/charts/RegionalComparisonChart.tsx',
  'src/components/ui/CountrySummary.tsx',
  'src/components/ui/RegionSelector.tsx',
  'src/app/page_new.tsx'
];

const API_IMPORT = `import { API_BASE_URL } from '@/config/api';`;

files.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Add import if not already present
    if (!content.includes("import { API_BASE_URL }")) {
      content = content.replace(
        /('use client';\s*\n\n)(import.*?from.*?;\s*\n)/s,
        `$1$2${API_IMPORT}\n`
      );
    }
    
    // Replace hardcoded URLs
    content = content.replace(/http:\/\/localhost:5000\/api/g, '${API_BASE_URL}');
    content = content.replace(/http:\/\/localhost:5000/g, '${BACKEND_URL}');
    
    // Fix template literal syntax
    content = content.replace(/'\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    content = content.replace(/'\$\{BACKEND_URL\}/g, '`${BACKEND_URL}');
    content = content.replace(/\$\{API_BASE_URL\}'/g, '${API_BASE_URL}`');
    content = content.replace(/\$\{BACKEND_URL\}'/g, '${BACKEND_URL}`');
    
    writeFileSync(filePath, content);
    console.log(`✓ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('Done!');
