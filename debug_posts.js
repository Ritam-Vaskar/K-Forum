
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './server/models/Post.js';

dotenv.config();

const checkPosts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/K-Forum');
        console.log('Connected to MongoDB');

        const posts = await Post.find({}, 'title status moderationStatus category createdAt').sort({ createdAt: -1 }).limit(20);

        console.log('Recent Posts:');
        posts.forEach(p => {
            console.log(`[${p.createdAt.toISOString()}] ${p.title} | Status: ${p.status} | ModStatus: ${p.moderationStatus} | Cat: ${p.category}`);
        });

        // specific check for approved but not published
        const weirdPosts = await Post.find({
            status: 'PENDING_REVIEW',
            moderationStatus: 'approved'
        });
        console.log(`\nFound ${weirdPosts.length} posts with status=PENDING_REVIEW but moderationStatus=approved (Potential conflict)`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkPosts();
