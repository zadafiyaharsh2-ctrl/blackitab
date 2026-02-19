const fs = require('fs');
const path = require('path');

const applyThemeClasses = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');

    // First, let's prefix existing dark classes with dark: and add light classes
    // But we need to be careful not to double-prefix if dark: is already there

    // We can do some simple regex replacements
    // Example: text-white -> text-gray-900 dark:text-white
    const rules = [
        {
            regex: /(?<!dark:)\btext-white\b/g,
            replacement: 'text-gray-900 dark:text-white'
        },
        {
            regex: /(?<!dark:)\bbg-gray-900\b/g,
            replacement: 'bg-white dark:bg-gray-900'
        },
        {
            regex: /(?<!dark:)\bbg-gray-800\b/g,
            replacement: 'bg-gray-50 dark:bg-gray-800'
        },
        {
            regex: /(?<!dark:)\bbg-gray-900\/50\b/g,
            replacement: 'bg-gray-100 dark:bg-gray-900/50'
        },
        {
            regex: /(?<!dark:)\bbg-gray-900\/80\b/g,
            replacement: 'bg-white/80 dark:bg-gray-900/80'
        },
        {
            regex: /(?<!dark:)\bbg-white\/5\b/g,
            replacement: 'bg-gray-100 dark:bg-white/5'
        },
        {
            regex: /(?<!dark:)\bborder-white\/5\b/g,
            replacement: 'border-gray-200 dark:border-white/5'
        },
        {
            regex: /(?<!dark:)\bborder-white\/10\b/g,
            replacement: 'border-gray-300 dark:border-white/10'
        },
        {
            regex: /(?<!dark:)\bborder-gray-800\b/g,
            replacement: 'border-gray-200 dark:border-gray-800'
        },
        {
            regex: /(?<!dark:)\bborder-gray-700\b/g,
            replacement: 'border-gray-300 dark:border-gray-700'
        },
        {
            regex: /(?<!dark:)\btext-gray-300\b/g,
            replacement: 'text-gray-700 dark:text-gray-300'
        },
        {
            regex: /(?<!dark:)\btext-gray-400\b/g,
            replacement: 'text-gray-600 dark:text-gray-400'
        },
        {
            regex: /(?<!dark:)\bhover:bg-gray-800\b/g,
            replacement: 'hover:bg-gray-200 dark:hover:bg-gray-800'
        },
        {
            regex: /(?<!dark:)\bhover:bg-gray-700\b/g,
            replacement: 'hover:bg-gray-200 dark:hover:bg-gray-700'
        },
        {
            regex: /(?<!dark:)\bhover:text-white\b/g,
            replacement: 'hover:text-gray-900 dark:hover:text-white'
        },
        {
            regex: /(?<!dark:)\bgroup-hover:text-white\b/g,
            replacement: 'group-hover:text-gray-900 dark:group-hover:text-white'
        }
    ];

    let newContent = content;
    rules.forEach(rule => {
        // Run it multiple times in case of overlaps or just once is fine
        newContent = newContent.replace(rule.regex, rule.replacement);
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
};

const directoriesToProcess = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components')
];

const walkSync = (dir, filelist = []) => {
    if (!fs.existsSync(dir)) return filelist;
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            filelist.push(filepath);
        }
    });
    return filelist;
};

directoriesToProcess.forEach(dir => {
    const files = walkSync(dir);
    files.forEach(applyThemeClasses);
});

console.log('Codemod completed.');
