import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondy-someone-by-your-side';
    
    // If MONGODB_URI doesn't end with a database name, append it
    if (mongoUri.endsWith('/') && process.env.DB_NAME) {
      mongoUri = mongoUri + process.env.DB_NAME;
    }
    
    console.log('Connecting to MongoDB with URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully to database:', conn.connection.name);
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;