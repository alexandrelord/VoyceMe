import { saveUserToDB, validateUser, getBalanceFromDB, updateBalanceInDB, validatePassword, generatePassword, generateTokens, decodeJWT } from '../src/user/user.service';
import { StatusError } from '../src/utils/global';
import { setupDB } from './helpers';
import User from '../src/user/user.model';

setupDB();

describe('User Service', () => {
    describe('saveUserToDB', () => {
        it('should throw an error if username or password is not provided', async () => {
            const data = [
                { username: 'username', password: '' },
                { username: '', password: 'password' },
                { username: '', password: '' },
            ];

            for (const { username, password } of data) {
                try {
                    await saveUserToDB(username, password);
                } catch (error) {
                    if (error instanceof StatusError) {
                        expect(error.status).toBe(400);
                        expect(error.message).toBe('Username and password are required');
                    }
                }
            }
        });

        it('should throw an error if user already exists', async () => {
            try {
                await saveUserToDB('username', 'password');
                await saveUserToDB('username', 'password');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('User already exists');
                }
            }
        });
        it('should return an access and refresh token', async () => {
            const { accessToken, refreshToken } = await saveUserToDB('username', 'password');
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
        });
        it('should save the user to the database', async () => {
            await saveUserToDB('username', 'password');
            const user = await User.findOne({ username: 'username' });
            expect(user).toBeDefined();
        });
    });
    describe('validateUser', () => {
        it('should throw an error if username or password is not provided', async () => {
            const data = [
                { username: 'username', password: '' },
                { username: '', password: 'password' },
                { username: '', password: '' },
            ];

            for (const { username, password } of data) {
                try {
                    await saveUserToDB(username, password);
                } catch (error) {
                    if (error instanceof StatusError) {
                        expect(error.status).toBe(400);
                        expect(error.message).toBe('Username and password are required');
                    }
                }
            }
        });
        it('should throw an error if user does not exist', async () => {
            try {
                await saveUserToDB('username', 'password');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('User does not exist');
                }
            }
        });
        it('should throw an error if password is incorrect', async () => {
            try {
                await saveUserToDB('username', 'password');
                await validateUser('username', 'wrong password');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('Invalid password');
                }
            }
        });
        it('should return an access and refresh token', async () => {
            await saveUserToDB('username', 'password');
            const { accessToken, refreshToken } = await validateUser('username', 'password');
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
        });
    });
    describe('getBalanceFromDB', () => {
        it('should throw an error if user does not exist', async () => {
            try {
                await getBalanceFromDB('username');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('User does not exist');
                }
            }
        });
        it('should return the balance of the user', async () => {
            await saveUserToDB('username', 'password');
            const balance = await getBalanceFromDB('username');
            expect(balance).toBeDefined();
        });
    });
    describe('updateBalanceInDB', () => {
        it('should throw an error if username and to are the same', async () => {
            try {
                await updateBalanceInDB('username', 100, 50, 'username');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('Cannot transfer to yourself');
                }
            }
        });
        it('should throw an error if balance is less than amount being transfered', async () => {
            try {
                await saveUserToDB('username', 'password');
                await saveUserToDB('recipient', 'password');
                await updateBalanceInDB('username', 100, 150, 'recipient');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('Insufficient balance');
                }
            }
        });
        it('should throw an error if user or to does not exist', async () => {
            try {
                await updateBalanceInDB('username', 100, 50, 'recipient');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.status).toBe(400);
                    expect(error.message).toBe('User does not exist');
                }
            }
        });
        it('should update the balance of the user and recipient', async () => {
            await saveUserToDB('username', 'password');
            await saveUserToDB('recipient', 'password');
            await updateBalanceInDB('username', 100, 50, 'recipient');
            const user = await User.findOne({ username: 'username' });
            const recipient = await User.findOne({ username: 'recipient' });
            expect(user?.balance).toBe(50);
            expect(recipient?.balance).toBe(150);
        });
    });
    describe('validatePassword', () => {
        it('should return true if the password matches the hash', () => {
            const password = 'password';
            const { salt, hash } = generatePassword(password);

            const result = validatePassword(password, salt, hash);

            expect(result).toBe(true);
        });
    });
    describe('generatePassword', () => {
        it('should return the hashed password', () => {
            const password = 'password';
            const hash = generatePassword(password);

            expect(hash).not.toBe(password);
        });
        it('should return a different hash for the same password', () => {
            const password = 'password';
            const hash = generatePassword(password);
            const hash2 = generatePassword(password);

            expect(hash).not.toBe(hash2);
        });
    });
    describe('generateTokens', () => {
        it('should return an object with the access token and refresh token', () => {
            const _id = '123';
            const tokens = generateTokens(_id);

            expect(tokens).toHaveProperty('accessToken');
            expect(tokens).toHaveProperty('refreshToken');
        });
    });
    describe('decodeJWT', () => {
        it('should throw an error if the token is invalid', async () => {
            try {
                await decodeJWT('token');
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.message).toBe('Invalid token');
                }
            }
        });
        it('should throw an error if the refresh token is undefined', async () => {
            try {
                const token = undefined;
                await decodeJWT(token);
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.message).toBe('Refresh token is required');
                }
            }
        });
        it('should throw an error if the user does not exist', async () => {
            try {
                const { refreshToken } = await saveUserToDB('username', 'password');
                await User.deleteOne({ username: 'username' });
                await decodeJWT(refreshToken);
            } catch (error) {
                if (error instanceof StatusError) {
                    expect(error.message).toBe('User does not exist');
                }
            }
        });
        it('should return a new accessToken', async () => {
            const { accessToken, refreshToken } = await saveUserToDB('username', 'password');
            const newAccessToken = await decodeJWT(refreshToken);

            expect(accessToken).toBeDefined();
            expect(newAccessToken).toBeDefined();
            expect(accessToken).not.toBe(newAccessToken);
        });
    });
});
