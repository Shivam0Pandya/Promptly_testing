// globalSetup.cjs (Note the .cjs extension)
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// globalSetup must export an async function (or return a Promise)
module.exports = async () => {
    // This line MUST print if Jest calls the script
    console.log("--- JEST GLOBAL SETUP CALLED! ---");

    // Resolve path assuming .env.test is in the same directory as globalSetup.cjs
    const envPath = path.resolve(__dirname, '.env.test');

    if (!fs.existsSync(envPath)) {
        throw new Error(`❌ FATAL: .env.test file not found at: ${envPath}`);
    }

    // Load variables from the dedicated .env.test file
    const result = dotenv.config({ path: envPath }); 

    if (result.error) {
        throw result.error;
    }

    // --- CRITICAL CHECK (This log must be visible in your output) ---
    if (process.env.MONGO_URI_TEST && process.env.JWT_SECRET) {
        console.log("✅ Global Setup SUCCESS: Environment variables loaded.");
    } else {
        throw new Error(`
        ❌ Global Setup FAILED: Critical environment variables missing in .env.test.
        MONGO_URI_TEST defined: ${!!process.env.MONGO_URI_TEST}
        JWT_SECRET defined: ${!!process.env.JWT_SECRET}
        `);
    }
};