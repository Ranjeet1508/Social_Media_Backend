Social Media Website - Backend
Welcome to the backend repository of the Social Media Website project! This backend application is the backbone of our social media platform, handling user authentication, post creation, and interactions. Built using the power of Node.js, MongoDB, and Express.js, it ensures a robust and scalable foundation for the frontend application.

Table of Contents
Usage
Project Structure
API Endpoints
Environment Variables
Technologies Used
Acknowledgments
Installation
Clone the repository:


Project Structure
app.js: Entry point for the Express application.
routes/: Contains route files for different API endpoints.
models/: Defines MongoDB schemas for user profiles and posts.
middlewares/: Contains middleware functions, including authentication.
config/: Configuration files for MongoDB connection and other settings.
API Endpoints
Authentication:

POST /api/auth/register: Register a new user.
POST /api/auth/login: Login and generate a JWT token.
User Profile:

GET /api/profile/:username: Get user profile information.
PUT /api/profile/edit: Edit user profile information.
Posts:

GET /api/posts: Get all posts.
POST /api/posts/create: Create a new post.
PUT /api/posts/:postId/like: Like a post.
PUT /api/posts/:postId/comment: Comment on a post.
Environment Variables
To run this project, you will need to set up the following environment variables:

MONGODB_URI: The URI for your MongoDB database.
JWT_SECRET: Secret key for JWT token generation.
Technologies Used
Node.js
Express.js
MongoDB
Mongoose (MongoDB ODM)
Acknowledgments
I want to express my appreciation to the open-source community and the developers behind the technologies used in this project.
