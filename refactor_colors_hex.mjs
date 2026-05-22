import fs from 'fs';
import path from 'path';

// Mapping of hex codes to semantic tokens
const colorMap = {
  // Primary
  '[#236b9d]': 'primary',
  
  // Primary Hover
  '[#1e5b87]': 'primary-hover',
  
  // Primary Active (Unified dark variations)
  '[#1a5177]': 'primary-active',
  '[#164263]': 'primary-active',
  '[#1a5a8c]': 'primary-active',
  '[#1a4f75]': 'primary-active',
  '[#1a5175]': 'primary-active',
  '[#1a5279]': 'primary-active',
  '[#1e5b97]': 'primary-active',
  '[#023e8a]': 'primary-active',
  '[#236b8d]': 'primary-active',

  // Accent
  '[#2baba8]': 'accent',
  
  // Accent Hover
  '[#238b89]': 'accent-hover',
  '[#208f8c]': 'accent-hover',

  // Info
  '[#0077b6]': 'info',

  // Background Secondary
  '[#f4f5f7]': 'background-secondary',
  '[#f8f9fa]': 'background-secondary',

  // Background Dark
  '[#020817]': 'background-dark',
};

// Also handle uppercase variations safely using case-insensitive regex in the replacement logic
const searchDirs = ['app', 'components', 'src'];

let modifiedCount = 0;

function walkDir(dir) {
  if (dir.includes('node_modules') || dir.includes('.next')) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;

      // Replace each mapped color (case-insensitive)
      for (const [hex, token] of Object.entries(colorMap)) {
        // Escape brackets for Regex
        const regexSafeHex = hex.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp(regexSafeHex, 'gi');
        
        content = content.replace(regex, token);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
        modifiedCount++;
      }
    }
  }
}

console.log('Starting hex color tokenization refactor...');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
});

console.log(`Refactoring complete. Modified ${modifiedCount} files.`);
