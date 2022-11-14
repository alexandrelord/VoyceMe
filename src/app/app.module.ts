import cookieParser from 'cookie-parser';
import express from 'express';
import apiRoutes from './app.routes';

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRoutes);

export default app;
