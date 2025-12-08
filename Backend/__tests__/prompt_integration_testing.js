import request from 'supertest';
import express from 'express'; 
import mongoose from 'mongoose';
import User from '../models/User.js'; 
import Prompt from '../models/Prompt.js'; 
// In prompt_integration_testing.js and workspace_integration_testing.js

import userRoutes from '../routes/userRoutes.js';
import workspaceRoutes from '../routes/workspaceRoutes.js';
import promptRoutes from '../routes/promptRoutes.js'; 
// You may need to update the paths depending on where the test files are relative to routes
import jwt from 'jsonwebtoken';

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

// Helper function to get mock token (same as workspace test)
const getTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'TESTING_SECRET_KEY', { expiresIn: "1h" });

// Global Test Data
let ownerToken, collaboratorToken, ownerId, collaboratorId;
let initialPromptId, initialWorkspaceId, pendingUpdateId;

// --- DATABASE SETUP AND CLEANUP ---
beforeAll(async () => {
    const TEST_DB_URI = process.env.MONGO_URI_TEST; 
    await mongoose.connect(TEST_DB_URI);
    
    // 1. Setup two users (THIS IS CORRECT)
    const ownerRes = await User.create({ name: 'P-Owner', email: 'p.owner@test.com', password: 'securepass' });
    ownerId = ownerRes._id;
    // CRITICAL: Ensure getTestToken function uses the fixed secret
    ownerToken = getTestToken(ownerId); 
    
    const collabRes = await User.create({ name: 'P-Collab', email: 'p.collab@test.com', password: 'securepass' });
    collaboratorId = collabRes._id;
    collaboratorToken = getTestToken(collaboratorId);
    
    // 2. CRITICAL FIX: Create the Initial Prompt document
    const initialPrompt = await Prompt.create({
        title: 'Initial Test Prompt',
        body: 'This is the original body of the test prompt.',
        createdBy: ownerId, // Set the owner as the creator
        // Add a base version as required by your schema
        versions: [{ 
            version: 1, 
            body: 'This is the original body of the test prompt.',
            editedBy: ownerId,
            timestamp: new Date()
        }]
    });
    
    initialPromptId = initialPrompt._id;
    // console.log("DEBUG: Initial Prompt ID set to:", initialPromptId); // Verify ID is set
    
    // 3. CRITICAL TEST FIX: Correct the property access in Test 5
    // Ensure you change line 151 in your test file:
    // From: const newPendingUpdateId = updateRes.body.pendingUpdate.updateId;
    // To:   const newPendingUpdateId = updateRes.body.pendingUpdate._id;
    
}, 60000); // Increased timeout for DB connection

afterAll(async () => {
    // Clean up all data
    await User.deleteMany({});
    await Prompt.deleteMany({});
    await mongoose.connection.close();
}, 60000);

describe('Prompt Versioning & Upvote Tests', () => {

    const authenticatedRequest = (method, url, token) => 
        request(mockApp)[method](url).set('Authorization', `Bearer ${token}`);
        
    // --- Pre-Test Setup: Create a workspace and an initial prompt ---
    beforeAll(async () => {
        // Create a workspace (required for addPrompt controller logic)
        const wsRes = await authenticatedRequest('post', '/api/workspaces', ownerToken)
            .send({ title: 'Prompt Test WS' });
        initialWorkspaceId = wsRes.body._id;

        // 1. Owner creates the initial prompt
        const res = await authenticatedRequest('post', '/api/prompts', ownerToken)
            .send({ 
                title: 'Initial Prompt', 
                body: 'The initial prompt body v1.', 
                workspaceId: initialWorkspaceId 
            });
        initialPromptId = res.body._id;
        
        // 💡 DEBUG CHECK A: Log the created ID to your console
        // console.log("DEBUG CHECK A: Prompt Created ID:", initialPromptId.toString()); 
            
        // 💡 DEBUG CHECK B: Immediately verify the prompt is found in the DB
        // const verification = await Prompt.findById(initialPromptId);
        // console.log("DEBUG CHECK B: Prompt Found in DB:", !!verification); // Should log 'true'
    });

    // --- Test 1: Collaborator Requests Update (Pending Update) ---
    it('1. should submit an update request (pending update) from a non-owner', async () => {
        // 💡 DEBUG CHECK C: Log the ID being used in the actual test request
        // console.log("DEBUG CHECK C: ID Used in Test 1 Request:", initialPromptId.toString());

        const suggestedBody = 'The updated body suggested by the collaborator v2.';
        const res = await authenticatedRequest('post', `/api/prompts/${initialPromptId}/request-update`, collaboratorToken)
            .send({ body: suggestedBody });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Update request submitted successfully");
        expect(res.body.pendingUpdate.status).toBe('pending');
        expect(res.body.pendingUpdate.suggestedBy._id.toString()).toBe(collaboratorId.toString());

        pendingUpdateId = res.body.pendingUpdate._id; // Save ID for approval test
        
        // Verify DB state: versions array length should still be 1, pendingUpdates should be 1
        const promptDB = await Prompt.findById(initialPromptId);
        expect(promptDB.versions).toHaveLength(1);
        expect(promptDB.pendingUpdates).toHaveLength(1);
    });
    
    // --- Test 2: Owner Approves Pending Update ---
    it('2. should allow the owner to approve the pending update request', async () => {
        const res = await authenticatedRequest('put', `/api/prompts/${initialPromptId}/approve/${pendingUpdateId}`, ownerToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Prompt update approved and applied");
        expect(res.body.updatedPrompt.body).toBe('The updated body suggested by the collaborator v2.'); // New body applied

        // Verify DB state: versions array length should be 2, pending update status is 'approved'
        const promptDB = await Prompt.findById(initialPromptId);
        expect(promptDB.versions).toHaveLength(2);
        const approvedUpdate = promptDB.pendingUpdates.id(pendingUpdateId);
        expect(approvedUpdate.status).toBe('approved');
    });

    // --- Test 3: Upvote Toggle (Add) ---
    it('3. should allow a user to upvote a prompt', async () => {
        const res = await authenticatedRequest('put', `/api/prompts/${initialPromptId}/upvote`, collaboratorToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Upvoted");
        expect(res.body.hasUpvoted).toBe(true);
        expect(res.body.upvotes).toBe(1);

        // Verify DB state
        const promptDB = await Prompt.findById(initialPromptId);
        expect(promptDB.upvotes).toBe(1);
        expect(promptDB.upvotedBy.map(id => id.toString())).toContain(collaboratorId.toString());
    });
    
    // --- Test 4: Upvote Toggle (Remove) ---
    it('4. should allow the same user to remove their upvote', async () => {
        const res = await authenticatedRequest('put', `/api/prompts/${initialPromptId}/upvote`, collaboratorToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Upvote removed");
        expect(res.body.hasUpvoted).toBe(false);
        expect(res.body.upvotes).toBe(0);

        // Verify DB state
        const promptDB = await Prompt.findById(initialPromptId);
        expect(promptDB.upvotes).toBe(0);
        expect(promptDB.upvotedBy).toHaveLength(0);
    });

    // --- Test 5: Unauthorized Update Approval Failure ---
    it('5. should return 403 if a non-owner tries to approve an update', async () => {
        // First, create a new pending update
        const suggestedBody = 'Another update request.';
        const updateRes = await authenticatedRequest('post', `/api/prompts/${initialPromptId}/request-update`, collaboratorToken)
            .send({ body: suggestedBody });
        const newPendingUpdateId = updateRes.body.pendingUpdate._id;

        // Try to approve it with the COLLABORATOR's token
        const res = await authenticatedRequest('put', `/api/prompts/${initialPromptId}/approve/${newPendingUpdateId}`, collaboratorToken);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Not authorized to approve updates");
    });
});