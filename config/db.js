import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[MongoDB Error]: MONGODB_URI is not defined in environment variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error(`👉 Cause: Invalid Atlas username or password.`);
    } else if (error.message.includes('querySrv ETIMEOUT') || error.message.includes('ENOTFOUND') || error.message.includes('whitelisted')) {
      console.error(`👉 Cause: Network timeout or IP access issue. Ensure your IP address (or 0.0.0.0/0 for deployment) is added to MongoDB Atlas Network Access.`);
    }
    console.warn(`[Fallback Active]: Server will operate with in-memory persistence fallback for offline resilience.`);
    return false;
  }
};
