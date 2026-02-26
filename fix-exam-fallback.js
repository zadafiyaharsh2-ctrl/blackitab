const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'blackitabfrontend/src/pages/ExamQuestions.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('getMockExamQuestions')) {
    content = content.replace(
        "import API_URL from '../config';",
        "import API_URL from '../config';\nimport { getMockExamQuestions } from '../data/mockExamData';"
    );
}

// 2. Add fallback to fetchQuestions
const targetFetchBlock = `                if (res.data.success) {
                    setQuestions(res.data.data);
                    setCurrentIndex(0);
                }
            } catch (err) {`;

const newFetchBlock = `                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    setQuestions(res.data.data);
                    setCurrentIndex(0);
                } else {
                    console.log('Backend returned empty questions, using intelligent fallback data.');
                    setQuestions(getMockExamQuestions(examId, activeSubject));
                    setCurrentIndex(0);
                }
            } catch (err) {
                console.error('Error fetching exam questions, falling back to mock data:', err);
                setQuestions(getMockExamQuestions(examId, activeSubject));
                setCurrentIndex(0);
            } finally { // temp closing to satisfy block replace, will let original finally remain
`;

// Replacing carefully
if (content.includes("if (res.data.success) {\n                    setQuestions(res.data.data);\n                    setCurrentIndex(0);\n                }\n            } catch (err) {")) {
  content = content.replace("if (res.data.success) {\n                    setQuestions(res.data.data);\n                    setCurrentIndex(0);\n                }\n            } catch (err) {", 
  "if (res.data.success && res.data.data && res.data.data.length > 0) {\n                    setQuestions(res.data.data);\n                    setCurrentIndex(0);\n                } else {\n                    console.log('Backend returned empty questions, using intelligent fallback data.');\n                    setQuestions(getMockExamQuestions(examId, activeSubject));\n                    setCurrentIndex(0);\n                }\n            } catch (err) {\n                console.error('Error fetching exam questions, falling back to mock data:', err);\n                setQuestions(getMockExamQuestions(examId, activeSubject));\n                setCurrentIndex(0);\n             // catch remaining block:");
} else {
  // Try regex
  content = content.replace(
      /if\s*\(res\.data\.success\)\s*{\s*setQuestions\(res\.data\.data\);\s*setCurrentIndex\(0\);\s*}\s*}\s*catch\s*\(err\)\s*{/,
      `if (res.data.success && res.data.data && res.data.data.length > 0) {
                    setQuestions(res.data.data);
                    setCurrentIndex(0);
                } else {
                    console.log('Backend returned empty questions, using intelligent fallback data.');
                    setQuestions(getMockExamQuestions(examId, activeSubject));
                    setCurrentIndex(0);
                }
            } catch (err) {
                console.error('Error fetching exam questions, falling back to mock data: ', err);
                setQuestions(getMockExamQuestions(examId, activeSubject));
                setCurrentIndex(0);
                // `
  );
}


fs.writeFileSync(filePath, content, 'utf8');
console.log('Injected fallback data into ExamQuestions.jsx');
