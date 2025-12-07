import { togglePromptUpvote } from '../controllers/promptController.js';
import Prompt from '../models/Prompt.js'; // Import the real model for mock setup
import mongoose from 'mongoose'; // Needed for ObjectId

// Mock the Prompt model functions that the controller uses
jest.mock('../models/Prompt.js', () => ({
  findById: jest.fn(),
}));

describe('Prompt Controller Unit Tests (Upvote Logic)', () => {
  const userId = new mongoose.Types.ObjectId();
  const promptId = new mongoose.Types.ObjectId();
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock Express Request and Response objects
    req = { 
      params: { id: promptId.toString() },
      user: { _id: userId },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // --- Test 1: Add Upvote ---
  it('1. should add an upvote if the user has not upvoted yet', async () => {
    // Mock the prompt document returned from findById
    const mockPrompt = {
      _id: promptId,
      upvotes: 0,
      upvotedBy: [],
      save: jest.fn().mockResolvedValue(true),
    };
    Prompt.findById.mockResolvedValue(mockPrompt);

    await togglePromptUpvote(req, res);

    // Assertions on the mock prompt object state
    expect(mockPrompt.upvotedBy).toHaveLength(1);
    expect(mockPrompt.upvotes).toBe(1);
    expect(mockPrompt.save).toHaveBeenCalledTimes(1);
    
    // Assertion on the Express response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Upvoted", upvotes: 1, hasUpvoted: true })
    );
  });

  // --- Test 2: Remove Upvote ---
  it('2. should remove an upvote if the user has already upvoted', async () => {
    // Mock the prompt document with the user already having upvoted
    const mockPrompt = {
      _id: promptId,
      upvotes: 5,
      upvotedBy: [userId, new mongoose.Types.ObjectId()], // Existing upvotes
      save: jest.fn().mockResolvedValue(true),
    };
    Prompt.findById.mockResolvedValue(mockPrompt);

    // Call the controller function
    await togglePromptUpvote(req, res);

    // Assertions on the mock prompt object state
    expect(mockPrompt.upvotedBy).toHaveLength(1); // User ID removed
    expect(mockPrompt.upvotes).toBe(4); // Upvote count reduced
    expect(mockPrompt.save).toHaveBeenCalledTimes(1);

    // Assertion on the Express response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Upvote removed", upvotes: 4, hasUpvoted: false })
    );
  });

  // --- Test 3: Prompt Not Found ---
  it('3. should return 404 if the prompt is not found', async () => {
    Prompt.findById.mockResolvedValue(null);

    await togglePromptUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Prompt not found" });
  });

  // --- Test 4: Invalid ID ---
  it('4. should return 400 for an invalid prompt ID', async () => {
    // Override req.params to simulate invalid ID
    req.params.id = 'invalid_id'; 
    
    await togglePromptUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid prompt ID" });
    expect(Prompt.findById).not.toHaveBeenCalled(); // findById shouldn't be called
  });
});