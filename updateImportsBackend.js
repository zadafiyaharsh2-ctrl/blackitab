const fs = require('fs');
const path = require('path');

const FILE_MAP = {
  'adminController.js': 'controllers/admin',
  'adminChatController.js': 'controllers/admin',
  'instituteController.js': 'controllers/institute',
  'teacherController.js': 'controllers/teacher',
  'problemController.js': 'controllers/student',
  'attemptController.js': 'controllers/student',
  'contestController.js': 'controllers/student',
  'progressController.js': 'controllers/student',
  'authController.js': 'controllers/shared',
  'userController.js': 'controllers/shared',
  'aiController.js': 'controllers/shared',
  'messageController.js': 'controllers/shared',
  'socialController.js': 'controllers/shared',
  'postController.js': 'controllers/shared',
  'analyticsController.js': 'controllers/shared',
  'pdfExportController.js': 'controllers/shared',
  'theoryController.js': 'controllers/shared',
  'examController.js': 'controllers/shared',
  'questionController.js': 'controllers/shared',
  'aiQuestionController.js': 'controllers/shared',
  'adminRoutes.js': 'routes/admin',
  'adminChatRoutes.js': 'routes/admin',
  'instituteRoutes.js': 'routes/institute',
  'teacherRoutes.js': 'routes/teacher',
  'problemRoutes.js': 'routes/student',
  'attemptRoutes.js': 'routes/student',
  'contestRoutes.js': 'routes/student',
  'progress.js': 'routes/student',
  'userRoutes.js': 'routes/shared',
  'aiRoutes.js': 'routes/shared',
  'messageRoutes.js': 'routes/shared',
  'socialRoutes.js': 'routes/shared',
  'postRoutes.js': 'routes/shared',
  'analyticsRoutes.js': 'routes/shared',
  'examRoutes.js': 'routes/shared',
  'questionRoutes.js': 'routes/shared',
  'aiQuestionRoutes.js': 'routes/shared',
  'cleanLogsRoutes.js': 'routes/shared',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const importRegex = /(import[^'"]+['"]|require\(['"])([\.\/A-Za-z0-9_-]+)(['"])/g;

  content = content.replace(importRegex, (match, prefix, modulePath, suffix) => {
    let targetFileName = modulePath.split('/').pop();
    if (!targetFileName.endsWith('.jsx') && !targetFileName.endsWith('.js')) {
      targetFileName += '.js';
    }

    if (FILE_MAP[targetFileName]) {
       const currentDir = path.dirname(filePath);
       const projectRoot = 'c:/Users/Deepesh/Desktop/blackitab/blackitabbackend';
       const absoluteTarget = path.join(projectRoot, FILE_MAP[targetFileName], targetFileName);
       
       let newRelPath = path.relative(currentDir, absoluteTarget).replace(/\\/g, '/');
       if (!newRelPath.startsWith('.')) {
         newRelPath = './' + newRelPath;
       }
       if (!modulePath.endsWith('.js') && !modulePath.endsWith('.jsx')) {
         newRelPath = newRelPath.replace(/\.jsx?$/, '');
       }
       return `${prefix}${newRelPath}${suffix}`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        walkDir(fullPath);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        processFile(fullPath);
      }
    }
  }
}

walkDir('c:/Users/Deepesh/Desktop/blackitab/blackitabbackend');
console.log("Imports updated.");
