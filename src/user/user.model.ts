import mongoose from 'mongoose';
import { IUser } from './user.type';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: {
        salt: { type: String, required: true },
        hash: { type: String, required: true },
    },
    balance: { type: Number, required: true, default: 100 },
});

export default mongoose.model<IUser>('User', UserSchema);
