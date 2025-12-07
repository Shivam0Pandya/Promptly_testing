import request from 'supertest';
import express from 'express'; 
import mongoose from 'mongoose';
import User from '../models/User.js'; // Import User Model for cleanup
import router from '../routes/userRoutes.js'; // The router we are testing

// ⚠️ IMPORTANT: Mock the 'protect' middleware for isolated router testing
// In a real scenario, you would import the server with the real middleware.
// Since we are mocking the app, we need to mock the middleware's behavior 
// to ensure the route handler (getUserDetails) is reached.
// However, the best practice is to test the middleware functionality itself, 
// which we do by ensuring the failure conditions return 401.

// --- TEST SETUP ---
const mockApp = express();
mockApp.use(express.json()); // Crucial for handling JSON body

// Mount the user router at the correct API path
mockApp.use("/api/users", router); 

const API_PATH = '/api/users';
let testToken;
const testUserData = {
    name: 'TestUserAuth',
    email: 'testauth@promptly.com',
    password: 'securepassword123',
};

// --- MONGODB SETUP ---
beforeAll(async () => {
    // // Ensure the test database URI is loaded (via jest.setup.js)
    const TEST_DB_URI = process.env.MONGO_URI_TEST; 
    // if (!TEST_DB_URI) throw new Error("MONGO_URI_TEST is not defined!");
    
    // Connect to the dedicated test database
    await mongoose.connect(TEST_DB_URI);
}, 20000); // Increased timeout for DB connection

afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
}, 20000);

// --- INTEGRATION TESTS START ---

describe('User Authentication and Protected Routes', () => {

    // --- TEST 1: Successful Registration ---
    it('1. should register a new user successfully (POST /register)', async () => {
        const res = await request(mockApp)
            .post(`${API_PATH}/register`)
            .send(testUserData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(testUserData.email);
        
        testToken = res.body.token; // Save token for protected tests
    });
    
    // --- TEST 2: Duplicate Registration Failure ---
    it('2. should return 400 if user tries to register with existing email', async () => {
        const res = await request(mockApp)
            .post(`${API_PATH}/register`)
            .send(testUserData); 

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("User already exists");
    });
    
    it('3. should log in the user successfully (POST /login)', async () => {
    // 💡 CRITICAL FIX: Assign the result of the supertest request to 'res'
    const res = await request(mockApp) // <--- THIS WAS MISSING 'const res = await'
        .post(`${API_PATH}/login`)
        .send({ 
            email: testUserData.email, 
            password: testUserData.password 
        });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    
    // Save the token for subsequent protected requests
    testToken = res.body.token; 
});

    // --- TEST 4: Invalid Login Credentials ---
    it('4. should return 401 for invalid login credentials', async () => {
        const res = await request(mockApp)
            .post(`${API_PATH}/login`)
            .send({ email: testUserData.email, password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });
    
    // --- TEST 5: Protected Route Access (SUCCESS) ---
    it('5. should fetch user profile details with a valid token (GET /me)', async () => {
        const res = await request(mockApp)
            .get(`${API_PATH}/me`)
            .set('Authorization', `Bearer ${testToken}`); // Use the saved token
            
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(testUserData.email);
        expect(res.body).not.toHaveProperty('password'); // Verify password is excluded
    });
    
    // --- TEST 6: Protected Route Access (FAILURE: No Token) ---
    it('6. should return 401 if accessing /me without an Authorization header', async () => {
        const res = await request(mockApp)
            .get(`${API_PATH}/me`);
            
        expect(res.statusCode).toBe(401); 
        expect(res.body.message).toBe("No token, not authorized"); 
    });
    
    // --- TEST 7: Protected Route Access (FAILURE: Invalid Token) ---
    it('7. should return 401 if accessing /me with an invalid token', async () => {
        const invalidToken = 'Bearer thisisafaketoken.thatwill.fail';
        const res = await request(mockApp)
            .get(`${API_PATH}/me`)
            .set('Authorization', invalidToken);
            
        expect(res.statusCode).toBe(401); 
        expect(res.body.message).toBe("Not authorized, token failed"); 
    });
});