const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/onerror=\"[^\"]*\"/g, '');
  content = content.replace(/onClick=\"[^\"]*\"/g, 'onClick={() => {}}');
  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('d:/law/nusantara-law-hub/app/page.tsx');
fixFile('d:/law/nusantara-law-hub/app/articles/page.tsx');
