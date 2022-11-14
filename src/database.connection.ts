import mongoose from 'mongoose';

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/api', {
            retryWrites: true,
            w: 'majority',
        });
        console.log('Connected to database');
    } catch (error) {
        console.log('Error connecting to database: ', error);
    }
})();
