import 'dotenv/config.js'
import bcrypt from 'bcrypt';

import dbConnect from './db/connect.js';
import User from './db/userModel.js';

export const connectToDatabase = async () => {
    const { error, message } = await dbConnect();
    if (error !== 'ok') {
        console.error(message);
        console.info('Details:');
        console.error(error);
        return false;
    }
    return true;
}

export const registerNewUser = async (login, password) => {
    // hash the password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
        return { error, message: 'Password was not hashed successfully' };
    }
    
    // create a new user instance and collect the data
    const user = new User({
        login,
        password: hashedPassword,
    });
  
    // save the new user
    let result;
    try {
      result = await user.save();
    } catch (error) {
        return { error, message: 'Error creating user' };
    }
  
    return { error: 'ok', message: 'User Created Successfully' };
};