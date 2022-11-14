import Router from 'express';
import { createUser, loginUser, fetchBalance, transferAmount, refreshToken } from './user.controller';
import passportJWT from './user.strategy';

const router = Router();

router.post('/create', createUser);
router.post('/login', loginUser);
router.get('/refresh', refreshToken);
router.patch('/transfer', passportJWT.authenticate('jwt', { session: false }), transferAmount);
router.post('/balance', passportJWT.authenticate('jwt', { session: false }), fetchBalance);

export default router;
