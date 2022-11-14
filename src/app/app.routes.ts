import Router from 'express';
import userRoutes from '../user/user.routes';

const router = Router();

router.use('/users', userRoutes);

// Health check
router.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

export default router;
