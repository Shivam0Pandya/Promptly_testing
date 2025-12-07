import mongoose from 'mongoose';
import User from '../models/User.js'; // Assuming User.js is in models directory

describe('User Model Unit Tests', () => {
    // --- TEST SETUP AND TEARDOWN ---
    
    // Connect to the test database once before all tests
    beforeAll(async () => {
        // We use MONGO_URI_TEST, which MUST be loaded from .env.test
        const TEST_DB_URI = process.env.MONGO_URI_TEST; 
        
        if (!TEST_DB_URI) {
            console.error("❌ ERROR: MONGO_URI_TEST environment variable is missing. Check your .env.test file and Jest configuration.");
            process.exit(1);
        }
        
        // Connect to the dedicated test database
        await mongoose.connect(TEST_DB_URI);
        console.log("✅ Connected to test database successfully.");
    }, 20000); // Increased timeout for DB connection

    // Clean up the database after *each* test to ensure tests are isolated
    afterEach(async () => {
        // Delete all users created during the test
        await User.deleteMany({});
    }, 20000);

    // Close the connection after all tests are done
    afterAll(async () => {
        await mongoose.connection.close();
        console.log("⚠️ Test database connection closed.");
    });

    // Test 1: Ensure password is hashed before saving
    it('should hash the password before saving a new user', async () => {
        const candidatePassword = 'testpassword123';
        const user = await User.create({
            name: 'Hash Tester',
            email: 'hash@test.com',
            password: candidatePassword,
        });

        // 1. Check if the password is no longer the plain text
        expect(user.password).not.toEqual(candidatePassword);
        // 2. Check if the password looks like a bcrypt hash (starts with $2a or $2b)
        expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    // Test 2: Ensure comparePassword method works
    it('should correctly compare a candidate password to the hashed password', async () => {
        const candidatePassword = 'testpassword456';
        const user = await User.create({
            name: 'Compare Tester',
            email: 'compare@test.com',
            password: candidatePassword,
        });

        // Test with correct password
        const isMatch = await user.comparePassword(candidatePassword);
        expect(isMatch).toBe(true);
        
        // Test with incorrect password
        const isMismatch = await user.comparePassword('wrongpassword');
        expect(isMismatch).toBe(false);
    });

    // Test 3: Ensure pre-save hook is skipped if password is not modified
    it('should skip hashing if password field is not modified', async () => {
        const initialPassword = 'initialPassword';
        let user = await User.create({
            name: 'Skip Tester',
            email: 'skip@test.com',
            password: initialPassword,
        });
        
        const originalHash = user.password;
        
        // Update user but do not change the password field
        user.name = 'Updated Skip Tester';
        await user.save(); 
        
        // Verify the hash remains unchanged
        expect(user.password).toEqual(originalHash);
    });
});