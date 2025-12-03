const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ProblemSubject = require('./models/ProblemSubject');
const ProblemChapter = require('./models/ProblemChapter');
const Problem = require('./models/Problem');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const problemSubjects = [
    {
        name: 'Physics',
        description: 'Mechanics, Electromagnetism, Thermodynamics, and more.',
        chapters: [
            {
                name: 'Kinematics',
                description: 'Motion in 1D and 2D.',
                problems: [
                    { title: 'Projectile Motion', description: 'Calculate the range of a projectile launched at 45 degrees.', difficulty: 'Medium' },
                    { title: 'Free Fall', description: 'Determine the time it takes for an object to fall 100m.', difficulty: 'Easy' },
                    { title: 'Relative Velocity', description: 'Find the velocity of a boat crossing a river.', difficulty: 'Hard' }
                ]
            },
            { name: 'Laws of Motion', description: 'Newton\'s laws, friction.' },
            { name: 'Thermodynamics', description: 'Heat, work, entropy.' },
            { name: 'Electromagnetism', description: 'Electric fields, magnetic fields.' }
        ]
    },
    {
        name: 'Chemistry',
        description: 'Organic, Inorganic, and Physical Chemistry problems.',
        chapters: [
            {
                name: 'Atomic Structure',
                description: 'Bohr model, quantum numbers.',
                problems: [
                    { title: 'Electron Configuration', description: 'Write the electron configuration for Iron (Fe).', difficulty: 'Easy' },
                    { title: 'Quantum Numbers', description: 'Determine the quantum numbers for the last electron of Chlorine.', difficulty: 'Medium' }
                ]
            },
            { name: 'Chemical Bonding', description: 'Ionic, covalent, metallic bonds.' },
            { name: 'Organic Chemistry', description: 'Hydrocarbons, functional groups.' },
            { name: 'Electrochemistry', description: 'Redox reactions, galvanic cells.' }
        ]
    },
    {
        name: 'Maths',
        description: 'Calculus, Algebra, Probability, and Statistics.',
        chapters: [
            {
                name: 'Calculus',
                description: 'Limits, derivatives, integrals.',
                problems: [
                    { title: 'Limit Evaluation', description: 'Evaluate the limit of (sin x)/x as x approaches 0.', difficulty: 'Easy' },
                    { title: 'Definite Integral', description: 'Calculate the area under the curve y=x^2 from 0 to 1.', difficulty: 'Medium' },
                    { title: 'Optimization', description: 'Find the maximum volume of a box with a given surface area.', difficulty: 'Hard' }
                ]
            },
            { name: 'Algebra', description: 'Polynomials, complex numbers.' },
            { name: 'Probability', description: 'Conditional probability, distributions.' },
            { name: 'Statistics', description: 'Mean, median, mode, variance.' }
        ]
    }
];

const seedProblemSubjects = async () => {
    try {
        await ProblemSubject.deleteMany();
        await ProblemChapter.deleteMany();
        await Problem.deleteMany();
        console.log('Collections cleared');

        for (const subjectData of problemSubjects) {
            const { chapters, ...subjectInfo } = subjectData;

            // Create Subject
            const subject = await ProblemSubject.create(subjectInfo);
            console.log(`Created Subject: ${subject.name}`);

            // Create Chapters for this Subject
            if (chapters && chapters.length > 0) {
                for (const chapterData of chapters) {
                    const { problems, ...chapterInfo } = chapterData;

                    const chapter = await ProblemChapter.create({
                        ...chapterInfo,
                        subjectId: subject._id
                    });

                    // Create Problems for this Chapter
                    if (problems && problems.length > 0) {
                        const problemsWithId = problems.map((problem, index) => ({
                            ...problem,
                            chapterId: chapter._id,
                            order: index + 1
                        }));
                        await Problem.create(problemsWithId);
                        console.log(`    - Added ${problems.length} problems to ${chapter.name}`);
                    }
                }
                console.log(`  - Added ${chapters.length} chapters`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedProblemSubjects();
