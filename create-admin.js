import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@kiit.ac.in';
        const adminData = {
            name: 'System Admin',
            email: adminEmail,
            password: 'adminpassword',
            studentId: 'ADMIN001',
            year: 4,
            branch: 'Computer Science Engineering',
            role: 'admin',
            isVerified: true
        };

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = adminData.password;
            existingAdmin.role = 'admin'; // Ensure role is admin
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            console.log('Admin user updated successfully');
        } else {
            const newAdmin = new User(adminData);
            await newAdmin.save();
            console.log('Admin user created successfully');
        }

        console.log('=================================');
        console.log('ADMIN CREDENTIALS:');
        console.log(`Email: ${adminData.email}`);
        console.log(`Password: ${adminData.password}`);
        console.log('=================================');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
