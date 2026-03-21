const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Remove console.error and console.log lines
            // Only matching simple console expressions that take up a line
            content = content.replace(/^[ \t]*console\.(error|log)\(.*?\);?\s*$/gm, '');
            
            // Remove error: error.message from JSON responses
            content = content.replace(/,\s*error:\s*(error|err)\.message/g, '');
            content = content.replace(/error:\s*(error|err)\.message\s*,/g, '');
            content = content.replace(/error:\s*(error|err)\.message/g, '');
            
            // Remove error details from json like res.status(500).json({ success: false, message: '...', error: err.message })
            // Handled by previous regex but let's be sure no dangling commas
            content = content.replace(/,\s*\}/g, '}');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}

const backendPath = path.join(__dirname);
processDir(path.join(backendPath, 'routes'));

console.log('Done cleaning logs and error messages in routes.');
