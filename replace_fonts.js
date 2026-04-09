const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/text-\[(\d+)px\]/g, (match, pxStr) => {
        let px = parseInt(pxStr, 10);
        if (px <= 12) return 'text-xs';
        if (px <= 15) return 'text-sm';
        if (px <= 17) return 'text-base';
        if (px <= 20) return 'text-lg';
        if (px <= 24) return 'text-xl';
        if (px <= 32) return 'text-2xl';
        if (px <= 42) return 'text-3xl';
        return 'text-4xl';
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir('c:\\\\saversureV2\\\\consumer\\\\src', processFile);
console.log("Font replace complete!");
