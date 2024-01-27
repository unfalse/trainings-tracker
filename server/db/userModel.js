import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
      login: {
        type: String,
        required: [true, "Please provide a login!"],
        unique: [true, "User with this login already exists"],
      },

      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
});

const User = mongoose.model.Users || mongoose.model("Users", UserSchema);

export default User;