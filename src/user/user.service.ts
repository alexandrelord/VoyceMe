import User from './user.model';
import { ITokens, IPassword } from './user.type';
import { StatusError } from '../utils/global';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';

/**
 * @param {*} username - The username of the user
 * @param {*} password - The password of the user
 * @returns {Promise} - Returns a promise that resolves to an object containing the access and refresh token
 *
 * This function will create a new user document in the database
 */
export const saveUserToDB = async (username: string, password: string): Promise<ITokens> => {
    if (!username || !password) {
        throw new StatusError(400, 'Username and password are required');
    }

    const exisitingUser = await User.findOne({ username });
    if (exisitingUser) {
        throw new StatusError(400, 'User already exists');
    }

    const { salt, hash } = generatePassword(password);

    const user = new User({
        username,
        password: {
            salt,
            hash,
        },
    });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    return { accessToken, refreshToken };
};

//----------------------------------------

/**
 * @param {*} username - The username of the user
 * @param {*} password - The password of the user
 * @returns {Promise} - Returns a promise that resolves to an object containing the access and refresh tokens
 *
 * This function will validate a user when loging in
 **/

export const validateUser = async (username: string, password: string): Promise<ITokens> => {
    if (!username || !password) {
        throw new StatusError(400, 'Username and password are required');
    }

    const user = await User.findOne({ username });

    if (!user) {
        throw new StatusError(400, 'User does not exist');
    }

    const isValid = validatePassword(password, user.password.salt, user.password.hash);

    if (!isValid) {
        throw new StatusError(400, 'Invalid password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    return { accessToken, refreshToken };
};

//----------------------------------------

/**
 * @param {*} username - The username of the user
 * @returns {Promise} - Returns a promise that resolves to the user object's balance
 *
 * This function will fetch the user's balance in the DB
 */

export const getBalanceFromDB = async (username: string): Promise<number> => {
    const user = await User.findOne({ username });

    if (!user) {
        throw new StatusError(400, 'User does not exist');
    }

    return user.balance;
};

//----------------------------------------

/**
 * @param {*} username - The username of the user
 * @param {*} balance - The balance of the user
 * @param {*} amount - The amount to be added to the other user's balance
 * @param {*} to - The username of the other user
 * @returns {Promise} - Returns a promise that resolves to the user object's balance
 *
 * This function will subtract the amount from the user's balance in the DB, and add the amount to the other user's balance in the DB
 * */

export const updateBalanceInDB = async (username: string, balance: number, amount: number, recipient: string): Promise<number> => {
    if (username === recipient) {
        throw new StatusError(400, 'Cannot transfer to yourself');
    }

    if (balance < amount) {
        throw new StatusError(400, 'Insufficient balance');
    }
    // Subtract the amount from the user's balance
    const fromUser = await User.findOneAndUpdate({ username }, { $inc: { balance: -amount } }, { new: true });

    if (!fromUser) {
        throw new StatusError(400, 'User does not exist');
    }
    // Add the amount to the other user's balance
    const toUser = await User.findOneAndUpdate({ username: recipient }, { $inc: { balance: amount } });

    if (!toUser) {
        throw new StatusError(400, 'User does not exist');
    }

    return fromUser.balance;
};

//----------------------------------------

/**
 * @param {*} password - The plain text password
 * @param {*} salt - The salt stored in the database
 * @param {*} hash - The hash stored in the database
 * @returns {boolean} - Returns true if the password matches the hash
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares the decrypted hashed password stored in the DB with the password that the user provided at login
 */
export const validatePassword = (password: string, salt: string, hash: string): boolean => {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return hash === hashVerify;
};

//----------------------------------------

/**
 * @param {*} password - The plain text password
 * @returns {object} - Returns the salt and hash of the password
 *
 * This function takes a plain text password and creates a hash out of it.
 */

export const generatePassword = (password: string): IPassword => {
    const salt = crypto.randomBytes(16).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt,
        hash: genHash,
    };
};

//----------------------------------------

/**
 * @param {*} _id - The user id
 * @returns {object} - Returns an object with the access token and refresh token
 *
 * This function creates a new access token and refresh token for the user.
 */

export const generateTokens = (_id: string): ITokens => {
    const payload = {
        sub: _id,
        iat: Date.now(),
    };

    const accessToken = jsonwebtoken.sign(payload, 'access-secret', { expiresIn: '2m' });
    const refreshToken = jsonwebtoken.sign(payload, 'refresh-secret', { expiresIn: '1d' });

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
    };
};

//----------------------------------------

/**
 * @param token - The refresh token
 * @returns {object} - Returns an object with a new access token
 *
 * This function will create a new access token using the refresh token for the user
 */

export const decodeJWT = async (token: string | undefined): Promise<string> => {
    if (!token) {
        throw new StatusError(400, 'Refresh token is required');
    }

    const decoded = jsonwebtoken.verify(token, 'refresh-secret');

    const user = await User.findById(decoded.sub);
    if (!user) {
        throw new StatusError(401, 'User does not exist');
    }

    const { accessToken } = generateTokens(user._id);

    return accessToken;
};

//----------------------------------------
