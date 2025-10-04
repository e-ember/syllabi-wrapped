#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎵 Setting up Syllabi Wrapped...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    const envContent = `# ChatGPT API Configuration
CHATGPT_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
} else {
    console.log('✅ .env file already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
} else {
    console.log('✅ Uploads directory already exists');
}

// Create public directory for static files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
} else {
    console.log('✅ Public directory already exists');
}

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Add your OpenAI API key to the .env file');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. Open http://localhost:3000 in your browser\n');

console.log('📚 For more information, check the README.md file');
