import mongoose from 'mongoose';

async function dbConnect() {
    try {
      await mongoose.connect(process.env.TRAININGS_TRACKER_URL);
    } catch(error) {
      return { error, message: 'Unable to connect to MongoDB Atlas!' };
    }
    return { error: 'ok', message: 'Successfully connected to MongoDB Atlas!' };
}

export default dbConnect;