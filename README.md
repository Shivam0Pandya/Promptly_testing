⚡ Promptly: Collaborative Prompt Engineering Platform

Promptly is a state-of-the-art MERN stack application designed to centralize and govern the creation, organization, and sharing of generative AI prompts. It enforces prompt quality through a secure versioning and review workflow, making it the ideal solution for teams looking to standardize their AI inputs.

🔗 Live Demo & Deployment

Experience the platform live!

Component

Deployment Service

Status

URL

Frontend (React)

Vercel

Live

https://promptly-kn16.vercel.app/

Backend API (Express/Node)

Render

Live

https://promptly-3gli.onrender.com/

✨ Key Features

Active Workspaces: A combined view of all collaboration spaces the user owns or has joined.

Prompt Versioning & Review: A robust system where prompt edits are managed through Pending Updates. Workspace owners must review and accept changes, ensuring data integrity and quality control.

Discovery: An Explore Page allowing users to browse and join public workspaces, fostering community growth.

Engagement: Users can express interest in high-quality prompts via a Like/Upvote functionality.

Security: Authentication and authorization managed via Mongoose models and Express controllers to enforce collaboration rules and secure data access.

🛠️ Tech Stack

This project is built using the MERN stack with modern JavaScript features.

Layer

Technology

Description

Frontend

React

Single-page application for a responsive and dynamic user interface.

Backend

Node.js, Express.js

Robust RESTful API handling business logic and authentication.

Database

MongoDB (Mongoose)

Flexible, non-relational database for storing user, workspace, and prompt data.

Security

JWT (JSON Web Tokens)

Secure user authentication and session management.

Utilities

jwt-decode

Client-side utility for decoding JWT payloads.

💻 Local Setup and Installation

To run Promptly locally, follow these steps. This project assumes a standard MERN directory structure (e.g., separate client and server folders).

Prerequisites

Node.js (LTS recommended)

npm

MongoDB Instance (local or cloud-hosted)

1. Clone the Repository

git clone [YOUR_REPOSITORY_URL_HERE]
cd promptly


2. Backend Installation (Server)

Navigate to your server directory and install dependencies:

cd server # Adjust path as necessary
npm install
npm install jwt-decode # If used specifically in the backend


Environment Configuration (server/.env)

Create a .env file in your server directory:

# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/promptlyDB 

# Secret for signing JWTs (MUST be a long, random string)
JWT_SECRET=YOUR_RANDOM_SECRET_KEY

# Port for the API server
PORT=5000 


3. Frontend Installation (Client)

Navigate to your client directory and install dependencies:

cd ../client # Adjust path as necessary
npm install


Environment Configuration (client/.env)

Create a .env file in your client directory. Ensure REACT_APP_API_URL points to your running backend server (or the live Render URL for hybrid testing).

# Base URL for the Express API
REACT_APP_API_URL=http://localhost:5000/api 


4. Run the Application

Start the API Server

# In the server directory
npm start 


Start the React Frontend

# In the client directory
npm start


The application should now be accessible locally at http://localhost:3000.
