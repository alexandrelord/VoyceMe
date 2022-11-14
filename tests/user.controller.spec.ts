import request from 'supertest';
import app from '../src/app/app.module';
import { setupDB } from './helpers';
import { saveUserToDB } from '../src/user/user.service';

setupDB();

describe('User Controller', () => {
    describe('createUser function', () => {
        it('should return a 200 status code and a json response if the user is created', async () => {
            const response = await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual('application/json');
        });
        it('should return an access token if user is created', async () => {
            const response = await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            expect(response.body.data).toBeDefined();
        });
        it('should return a refresh token in an HttpOnly cookie if user is created', async () => {
            const response = await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            expect(response.header['set-cookie']).toBeDefined();
            expect(response.header['set-cookie'][0]).toContain('jwt');
            expect(response.header['set-cookie'][0]).toContain('HttpOnly');
        });
    });
    describe('loginUser function', () => {
        it('should return a 200 status code and a json response if the user is logged in', async () => {
            await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            const response = await request(app).post('/api/users/login').send({ username: 'username', password: 'password' });
            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual('application/json');
        });
        it('should return an access token if user is logged in', async () => {
            await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            const response = await request(app).post('/api/users/login').send({ username: 'username', password: 'password' });
            expect(response.body.data).toBeDefined();
        });
        it('should return a refresh token in an HttpOnly cookie if user is logged in', async () => {
            await request(app).post('/api/users/create').send({ username: 'username', password: 'password' });
            const response = await request(app).post('/api/users/login').send({ username: 'username', password: 'password' });
            expect(response.header['set-cookie']).toBeDefined();
            expect(response.header['set-cookie'][0]).toContain('jwt');
            expect(response.header['set-cookie'][0]).toContain('HttpOnly');
        });
    });
    describe('refreshToken function', () => {
        it('should return a 200 status code and a json response for logged in user', async () => {
            const { refreshToken } = await saveUserToDB('username', 'password');

            const response = await request(app).get('/api/users/refresh').set('Cookie', `jwt=${refreshToken}`);
            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body.data).toBeDefined();
        });
    });
    describe('fetchBalance function', () => {
        it('should return a 200 status code and a json response for logged in user', async () => {
            const { accessToken } = await saveUserToDB('username', 'password');

            const response = await request(app).post('/api/users/balance').set('Authorization', `Bearer ${accessToken}`).send({ username: 'username' });
            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body.data).toBeDefined();
            expect(response.body.data).toBe(100);
        });
    });
    describe('transferAmount function', () => {
        it('should return a 200 status code and a json response for logged in user', async () => {
            const { accessToken } = await saveUserToDB('username', 'password');
            await saveUserToDB('recipient', 'password');

            const response = await request(app).patch('/api/users/transfer').set('Authorization', `Bearer ${accessToken}`).send({ username: 'username', amount: 100, recipient: 'recipient' });
            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body.data).toBeDefined();
            expect(response.body.data).toBe(0);
        });
    });
});
