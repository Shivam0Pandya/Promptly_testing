import request from 'supertest';
import express from 'express'; 
import mongoose from 'mongoose';
import User from '../models/User.js'; 
import Workspace from '../models/Workspace.js';
// In prompt_integration_testing.js and workspace_integration_testing.js

import userRoutes from '../routes/userRoutes.js';
import workspaceRoutes from '../routes/workspaceRoutes.js';
import promptRoutes from '../routes/promptRoutes.js'; 
// You may need to update the paths depending on where the test files are relative to routes
import { registerUser } from '../controllers/userController.js'; // Needed to create test users
import jwt from 'jsonwebtoken'; // Needed to generate mock tokens

// --- SETUP MOCK APP AND USERS ---
const mockApp = express();
mockApp.use(express.json()); 

// // Temporarily verify the required imports are actual objects (should not be undefined/null)
// console.log("DEBUG: promptRoutes is:", typeof promptRoutes); 
// console.log("DEBUG: workspaceRoutes is:", typeof workspaceRoutes);

// 💡 CRITICAL FIX: Register ALL required routers for the test suite
mockApp.use("/api/users", userRoutes); 
mockApp.use("/api/workspaces", workspaceRoutes); 
mockApp.use("/api/prompts", promptRoutes);
// Mock Auth Middleware for testing protected routes outside of the User flow
// In a real scenario, you'd use the protect middleware, but for isolation, 
// we simulate what 'protect' does: set req.user
const mockProtect = (req, res, next) => {
    // This allows us to set the user based on the test case
    req.user = req.body.testUser; 
    next();
};

const ownerData = { name: 'Owner', email: 'owner@test.com', password: 'securepass' };
const collaboratorData = { name: 'Collab', email: 'collab@test.com', password: 'securepass' };

let ownerToken, collaboratorToken;
let ownerId, collaboratorId;
let workspaceId;

// --- UTILITY TO GET MOCK USER DATA (used for requests) ---
// Since the real auth middleware runs, we need a way to mock req.user
// Instead of mocking the entire middleware, we pre-register users and use their tokens.
const getTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'TESTING_SECRET_KEY', { expiresIn: "1h" });

// --- DATABASE SETUP AND CLEANUP ---
beforeAll(async () => {
    const TEST_DB_URI = process.env.MONGO_URI_TEST; 
    await mongoose.connect(TEST_DB_URI);
    
    // 1. Register test users directly via controller (simulates successful registration)
    const ownerRes = await User.create(ownerData);
    ownerId = ownerRes._id;
    ownerToken = getTestToken(ownerId);
    
    const collabRes = await User.create(collaboratorData);
    collaboratorId = collabRes._id;
    collaboratorToken = getTestToken(collaboratorId);
}, 20000); // Increased timeout for DB connection

afterAll(async () => {
    // Clean up all data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await mongoose.connection.close();
}, 20000);

describe('Workspace Integration Tests', () => {

    // Helper function to create authenticated requests
    const authenticatedRequest = (method, url, token) => 
        request(mockApp)[method](url).set('Authorization', `Bearer ${token}`);

    // Test 1: Workspace creation validation
    it('1. should return 400 if title is missing', async () => {
        const res = await authenticatedRequest('post', '/api/workspaces', ownerToken)
            .send({ title: '' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Title is required");
    });
    
    // Test 2: Successful Workspace Creation
    it('2. should successfully create a new workspace by the owner', async () => {
        const res = await authenticatedRequest('post', '/api/workspaces', ownerToken)
            .send({ title: 'Prompt Engineering Team' });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Prompt Engineering Team');
        expect(res.body.createdBy.toString()).toBe(ownerId.toString());
        expect(res.body.members).toHaveLength(1);
        expect(res.body.members[0].toString()).toBe(ownerId.toString());
        
        workspaceId = res.body._id; // Save ID for later tests
    });
    
    // Test 3: Fetching workspaces for the Owner
    it("3. should fetch the new workspace for the owner, with isOwner=true", async () => {
        const res = await authenticatedRequest('get', '/api/workspaces', ownerToken);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe('Prompt Engineering Team');
        expect(res.body[0].isOwner).toBe(true);
    });

    // Test 4: Collaborator joins the workspace
    it("4. should allow collaborator to join the workspace", async () => {
        // 💡 DEBUG: Check the value of the ID being sent
        // console.log("DEBUG: Attempting to join workspace ID:", workspaceId); 

        // If workspaceId is null/undefined, this is the issue.
        if (!workspaceId) throw new Error("workspaceId is undefined before Test 4!");
        const res = await authenticatedRequest('post', `/api/workspaces/${workspaceId}/join`, collaboratorToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Successfully joined workspace");

        // Verify the workspace model was updated in DB
        const updatedWs = await Workspace.findById(workspaceId);
        expect(updatedWs.members).toHaveLength(2);
        expect(updatedWs.members.map(id => id.toString())).toContain(collaboratorId.toString());
    });
    
    // Test 5: Collaborator fetching workspaces
    it("5. should fetch the workspace for the collaborator, with isOwner=false", async () => {
        const res = await authenticatedRequest('get', '/api/workspaces', collaboratorToken);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe('Prompt Engineering Team');
        expect(res.body[0].isOwner).toBe(false); // Collaborator is not the owner
    });
});