# 📚 Mentora - Online Learning Platform

## Overview
Welcome to the **Mentora**, a web application that enables users to create, manage, and enroll in courses. Built using **Node.js**, **Express**, and **MongoDB**, this platform provides a robust RESTful API for seamless interaction between the frontend and backend.

## 🚀 Features
- **User Authentication**: Secure registration and login using JWT.
- **Course Management**: Create, update, delete, and view courses.
- **Chapter and Unit Management**: Organize courses into chapters and units.
- **Enrollment Management**: Easily enroll in courses and cancel enrollments.
- **Search Functionality**: Find courses and users quickly.
- **User Profiles**: Manage user information, including created and enrolled courses.

## 📋 API Endpoints
### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in a user.

### User Management
- `GET /api/users/:id`: Get user profile by ID.
- `GET /api/users`: Get all users.

### Course Management
- `GET /api/courses`: Get all courses.
- `GET /api/courses/:id`: Get a course by ID.
- `POST /api/courses/create`: Create a new course.
- `PUT /api/courses/:id`: Update an existing course.
- `DELETE /api/courses/:id`: Delete a course.

### Enrollment Management
- `POST /api/courses/:id/enroll`: Enroll in a course.
- `POST /api/courses/:id/cancel`: Cancel enrollment in a course.

### Search Functionality
- `GET /api/search?query=searchTerm`: Search for users and courses.

## 🏗 Models
### Course Model
- **Fields**:
  - `title` (String, required)
  - `description` (String)
  - `author` (ObjectId, ref: "User", required)
  - `chapters` (Array of ObjectId, ref: "Chapter")
  - `enrolledUsers` (Array of ObjectId, ref: "User")
  - `accessType` (String, enum: ["public", "private"], default: "public")

### User Model
- **Fields**:
  - `name` (String, required)
  - `email` (String, required, unique)
  - `password` (String, required)
  - `profilePicture` (String, default: "default_pfp_url")
  - `createdCourses` (Array of ObjectId, ref: "Course")
  - `enrolledCourses` (Array of ObjectId, ref: "Enrollment")

## ⚙ Getting Started
### Prerequisites
- Node.js
- MongoDB
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/alisherfw/mentora-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mentora-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your environment variables in a `.env` file:
   ```
   MONGO_URI=your_mongo_db_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
5. Start the server:
   ```bash
   npm start
   ```

## 🧪 Usage
You can use tools like **Postman** or **Insomnia** to test the API endpoints. Ensure you include the necessary authentication headers for routes that require user authentication.

## 🤝 Contributing
Contributions are welcome! If you would like to contribute, please fork the repository and submit a pull request.

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
For any inquiries, please contact:
- Alisherbek Abduolimov - [Email](mailto:alisherfw@gmail.com)

---

## 💡 Acknowledgments
- [Node.js](https://nodejs.org/) - JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
- [MongoDB](https://www.mongodb.com/) - Document-oriented NoSQL database used for the application.
