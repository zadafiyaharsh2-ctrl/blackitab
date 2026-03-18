const mongoose = require('mongoose');
const dns = require('dns');

const isSrvDnsFailure = (message = '') => /query(?:Srv|Txt)\s+ESERVFAIL/i.test(message);

const getMongoUri = () => process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blackitab';

const getMongooseOptions = () => ({
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
});

const getFallbackDnsServers = () => {
  const rawServers = process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1';
  return rawServers.split(',').map((server) => server.trim()).filter(Boolean);
};

const connectDB = async () => {
  const mongoUri = getMongoUri();
  let lastError;

  try {
    const conn = await mongoose.connect(mongoUri, getMongooseOptions());
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    lastError = error;
  }

  if (mongoUri.startsWith('mongodb+srv://') && isSrvDnsFailure(lastError?.message)) {
    const fallbackServers = getFallbackDnsServers();

    if (fallbackServers.length) {
      try {
        dns.setServers(fallbackServers);
        console.warn(
          `MongoDB DNS resolution failed (${lastError.message}). Retrying with DNS servers: ${fallbackServers.join(', ')}`
        );

        const conn = await mongoose.connect(mongoUri, getMongooseOptions());
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (retryError) {
        lastError = retryError;
        console.error('MongoDB retry with fallback DNS failed:', retryError.message);
      }
    }

    console.error(
      'MongoDB SRV/TXT DNS lookup failed. Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 or switch MONGODB_URI to Atlas standard mongodb:// URI.'
    );
  }

  console.error('MongoDB connection error:', lastError?.message || 'Unknown error');
  process.exit(1);
};

module.exports = connectDB;
