import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/admin.model.js';

// Load environment variables
dotenv.config();

const setupSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondy-someone-by-your-side');
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      name: 'Arnav Kumar',
      email: 'kumararnav028@gmail.com',
      mobile: '7559466990',
      password: 'Admin@123456', // Default password - should be changed after first login
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: Admin@123456');
    console.log('Please change the password after first login for security.');

  } catch (error) {
    console.error('Error setting up super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the setup
setupSuperAdmin();







