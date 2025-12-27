
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './server/models/Post.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/K-Forum';

console.log('Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const count = await Post.countDocuments();
            console.log(`Total Posts: ${count}`);

            if (count > 0) {
                const posts = await Post.find({}, 'title moderationStatus category isAnonymous');
                console.log('Posts:', JSON.stringify(posts, null, 2));
            } else {
                console.log('No posts found in database.');
            }

        } catch (err) {
            console.error('Error querying posts:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
