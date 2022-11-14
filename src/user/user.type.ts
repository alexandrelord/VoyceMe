import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    username: string;
    password: IPassword;
    balance: number;
}

export interface IPassword {
    salt: string;
    hash: string;
}

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}
