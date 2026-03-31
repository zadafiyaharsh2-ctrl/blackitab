const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/FullTopicData');
require('dotenv').config();

async function debugSearch() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/RANKLEN");
    
    const q = 'TCP vs UDP: Which and Why?';
    console.log("Connected. Searching for:", q);
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const terms = q.split(/\s+/).filter(t => t.length > 0).map(t => new RegExp(escapeRegExp(t), 'i'));

    const topicQuery = { $and: terms.map(term => ({ name: term })) };
    
    const topics = await Topic.find(topicQuery).lean();
    console.log("Topics:", topics.length, topics);
    
    process.exit(0);
}
debugSearch();
