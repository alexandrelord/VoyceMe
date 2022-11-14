import { Request, Response } from 'express';
import { saveUserToDB, validateUser, getBalanceFromDB, updateBalanceInDB, decodeJWT } from './user.service';
import { StatusError } from '../utils/global';
import { IUser } from './user.type';

export const createUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const { accessToken, refreshToken } = await saveUserToDB(username, password);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.status(200).json({ data: accessToken });
    } catch (err) {
        if (err instanceof StatusError) {
            res.status(err.status).json({ error: err.message });
        }
        throw err;
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const { accessToken, refreshToken } = await validateUser(username, password);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.status(200).json({ data: accessToken });
    } catch (err) {
        if (err instanceof StatusError) {
            res.status(err.status).json({ error: err.message });
        }
        throw err;
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { jwt } = req.cookies;

    try {
        const response = await decodeJWT(jwt);

        return res.status(200).json({ data: response });
    } catch (error) {
        if (error instanceof StatusError) {
            return res.status(error.status).json({ message: error.message });
        }
        return res.status(500).json({ error });
    }
};

export const fetchBalance = async (req: Request, res: Response) => {
    const { username } = req.body;

    try {
        const response = await getBalanceFromDB(username);
        res.status(200).json({ data: response });
    } catch (err) {
        if (err instanceof StatusError) {
            res.status(err.status).json({ error: err.message });
        }
        throw err;
    }
};

export const transferAmount = async (req: Request, res: Response) => {
    const { amount, recipient } = req.body;
    const { username, balance } = req.user as IUser;

    try {
        const response = await updateBalanceInDB(username, balance, amount, recipient);
        res.status(200).json({ data: response });
    } catch (error) {
        if (error instanceof StatusError) {
            res.status(error.status).json({ error: error.message });
        }
        throw error;
    }
};
