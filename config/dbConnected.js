import mongoose from 'mongoose';
const dbConnected = ()=>{
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

export default dbConnected;