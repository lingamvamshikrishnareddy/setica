const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'js/config.js'
];

// Replace environment variables in files
filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all %%VAR_NAME%% with actual environment variables
    content = content.replace(/%%(\w+)%%/g, (match, varName) => {
      return process.env[varName] || match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Processed: ${file}`);
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

console.log('🎉 Environment variables replaced successfully!');