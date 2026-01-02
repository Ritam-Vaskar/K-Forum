
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './server/models/Post.js';

dotenv.config();

const migratePosts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/K-Forum');
        console.log('Connected to MongoDB');

        // Find posts that are approved but have PENDING_REVIEW status (or no status)
        const result = await Post.updateMany(
            {
                moderationStatus: 'approved',
                status: { $ne: 'PUBLISHED' }
            },
            {
                $set: { status: 'PUBLISHED' }
            }
        );

        console.log(`Migrated ${result.modifiedCount} posts to PUBLISHED status.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

migratePosts();
