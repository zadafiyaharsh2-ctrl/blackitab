const mongoose = require('mongoose');
require('dotenv').config();

const Subject = require('./models/Subject');
const Topic = require('./models/Topic');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const debugData = async () => {
    await connectDB();
    try {
        const subjects = await Subject.find().lean();
        const result = [];

        for (const subject of subjects) {
            const count = await Topic.countDocuments({ subjectId: subject._id });
            result.push({
                name: subject.name,
                id: subject._id,
                topicCount: count
            });
        }

        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugData();
