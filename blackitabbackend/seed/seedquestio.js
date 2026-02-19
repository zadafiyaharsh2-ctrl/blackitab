require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const ExamQuestion = require('../models/ExamQuestion');

const dummyQuestions = [
    {
        exam: 'jee', subject: 'Physics',
        question: 'A body of mass 2 kg is thrown vertically upward with velocity 20 m/s. Maximum height reached?',
        options: ['10 m', '20 m', '30 m', '40 m'],
        correctAnswer: 1, difficulty: 'Easy',
        explanation: 'Using v² = u² - 2gh → h = 400/20 = 20m'
    },
    {
        exam: 'jee', subject: 'Physics',
        question: 'The SI unit of electric field intensity is:',
        options: ['N/C', 'J/C', 'V/m²', 'C/N'],
        correctAnswer: 0, difficulty: 'Easy',
        explanation: 'E = F/q → Newton/Coulomb (N/C)'
    },
    {
        exam: 'jee', subject: 'Chemistry',
        question: 'Which of the following is the strongest acid?',
        options: ['HF', 'HCl', 'HBr', 'HI'],
        correctAnswer: 3, difficulty: 'Medium',
        explanation: 'Bond strength decreases down the group → HI is strongest'
    },
    {
        exam: 'jee', subject: 'Chemistry',
        question: 'The hybridization of carbon in methane (CH₄) is:',
        options: ['sp', 'sp²', 'sp³', 'sp³d'],
        correctAnswer: 2, difficulty: 'Easy',
        explanation: '4 sigma bonds → sp³'
    },
    {
        exam: 'jee', subject: 'Mathematics',
        question: 'The derivative of sin(x) with respect to x is:',
        options: ['-cos(x)', 'cos(x)', 'tan(x)', '-sin(x)'],
        correctAnswer: 1, difficulty: 'Easy',
        explanation: 'd/dx[sin(x)] = cos(x)'
    },
    {
        exam: 'jee', subject: 'Mathematics',
        question: 'If f(x) = x³ - 3x² + 2, what is f\'(1)?',
        options: ['-3', '0', '-1', '3'],
        correctAnswer: 0, difficulty: 'Medium',
        explanation: 'f\'(x) = 3x² - 6x → f\'(1) = 3 - 6 = -3'
    }
];

const seed = async () => {
    await connectDB();
    await ExamQuestion.deleteMany({ exam: 'jee' });
    await ExamQuestion.insertMany(dummyQuestions);
    console.log('✅ Seeded 6 dummy JEE questions');
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
