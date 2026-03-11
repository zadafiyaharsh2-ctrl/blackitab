const fs = require('fs');
const path = require('path');

function fixBrokenImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
                fixBrokenImports(fullPath);
            }
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Regex to match imports and requires, even dynamic ones
            const importRegex = /(import\s+.*?from\s+['"]|import\(['"]|require\(['"])([\.\/A-Za-z0-9_-]+)(['"])/g;
            
            content = content.replace(importRegex, (match, prefix, modulePath, suffix) => {
                if (!modulePath.startsWith('.')) return match; // skip node_modules like 'react'
                
                // Resolve the current path
                let resolved = path.resolve(path.dirname(fullPath), modulePath);
                
                // Because imports often drop extensions, check variations
                const checkExists = (p) => {
                    return fs.existsSync(p) || 
                           fs.existsSync(p + '.js') || 
                           fs.existsSync(p + '.jsx') ||
                           fs.existsSync(p + '.ts') ||
                           fs.existsSync(p + '.tsx') ||
                           fs.existsSync(p + '.png') ||
                           fs.existsSync(p + '.jpg') ||
                           fs.existsSync(p + '.svg') ||
                           fs.existsSync(path.join(p, 'index.js')) || 
                           fs.existsSync(path.join(p, 'index.jsx'));
                };

                if (!checkExists(resolved)) {
                    // It's broken! Try adding '../' to it
                    let tryPath = modulePath.startsWith('./') ? '../' + modulePath.substring(2) : '../' + modulePath;
                    let tryResolved = path.resolve(path.dirname(fullPath), tryPath);
                    
                    if (checkExists(tryResolved)) {
                        changed = true;
                        return `${prefix}${tryPath}${suffix}`; // FIXED!
                    }
                    
                    // Try adding '../../' just in case
                    let tryPath2 = '../' + tryPath;
                    let tryResolved2 = path.resolve(path.dirname(fullPath), tryPath2);
                    if (checkExists(tryResolved2)) {
                        changed = true;
                        return `${prefix}${tryPath2}${suffix}`;
                    }
                }
                return match;
            });
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed internal paths in ${fullPath}`);
            }
        }
    }
}

console.log("Starting script to fix broken nested relative imports...");
fixBrokenImports('c:/Users/Deepesh/Desktop/blackitab/blackitabfrontend/src');
fixBrokenImports('c:/Users/Deepesh/Desktop/blackitab/blackitabbackend/controllers');
fixBrokenImports('c:/Users/Deepesh/Desktop/blackitab/blackitabbackend/routes');
console.log("Done.");
