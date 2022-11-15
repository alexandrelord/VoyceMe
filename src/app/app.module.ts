import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import apiRoutes from './app.routes';
import swaggerDocument from '../../swagger.json';

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
