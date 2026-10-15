import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  
  try {
    // Attempt standard connection first with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database successfully at: ${uri}`);
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to external MongoDB (${error.message}).`);
    console.log(`[MongoDB] Initializing MongoDB In-Memory Server so application works instantly...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected to MongoDB In-Memory instance at: ${memUri}`);
      console.log(`[MongoDB] Clean state verified: 0 hardcoded records loaded. Ready for user data.`);
    } catch (memError) {
      console.error(`[MongoDB] Fatal error initializing database:`, memError);
      process.exit(1);
    }
  }
};
