
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './server/models/Post.js';
import User from './server/models/User.js';
import { moderateText } from './server/services/aiModeration.js';

dotenv.config();

const testAbusivePost = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/K-Forum');
        console.log('Connected to MongoDB');

        // 1. Get Any User
        let user = await User.findOne();
        if (!user) {
            console.error('No users found in DB. Please register a user first.');
            process.exit(1);
        }
        console.log('Using user:', user.email);

        // 2. Simulate AI Moderation directly to verifying it flags the content
        const abusiveContent = "This is a fucking bad post with abusive words like madharchod";
        console.log(`Testing moderation with content: "${abusiveContent}"`);

        const modResult = await moderateText(abusiveContent);
        console.log('Moderation Result:', JSON.stringify(modResult, null, 2));

        if (!modResult.isUnsafe) {
            console.error('CRITICAL: AI Moderation did NOT flag this content! This is why it is not showing up.');
        }

        // 3. Create the Post manually (simulating what the route does)
        const status = modResult.isUnsafe ? 'PENDING_REVIEW' : 'PUBLISHED';
        const post = await Post.create({
            title: 'ADMIN_DEBUG_TEST_POST',
            content: abusiveContent,
            author: user._id,
            category: 'general',
            tags: ['test'],
            status: status,
            moderation: {
                isUnsafe: modResult.isUnsafe,
                confidence: modResult.confidence,
                categories: modResult.categories,
                flaggedWords: modResult.flaggedWords,
                language: modResult.language
            },
            moderationStatus: status === 'PUBLISHED' ? 'approved' : 'flagged'
        });

        console.log('Created Post ID:', post._id);
        console.log('Post Status:', post.status);
        console.log('Post Moderation Status:', post.moderationStatus);
        console.log('Post Moderation Date:', JSON.stringify(post.moderation));

        // 4. Test the Admin Query
        const adminQuery = {
            $or: [
                { moderationStatus: 'flagged' },
                { status: 'PENDING_REVIEW' },
                { 'moderation.isUnsafe': true }
            ]
        };

        const foundPosts = await Post.find(adminQuery);
        const found = foundPosts.find(p => p._id.equals(post._id));

        if (found) {
            console.log('SUCCESS: The admin query successfully found the abusive post.');
        } else {
            console.error('FAILURE: The admin query did NOT find the abusive post.');
        }

        // Cleanup
        // await Post.findByIdAndDelete(post._id);
        // console.log('Cleaned up test post');
        console.log('TEST POST LEFT IN DB. PLEASE CHECK ADMIN DASHBOARD.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testAbusivePost();
