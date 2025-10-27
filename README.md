
# STEMz Core Server API

[![CI](https://github.com/stemz-learning/core_server/workflows/CI/badge.svg)](https://github.com/xiangyshi/)
[![Test Coverage](https://img.shields.io/badge/coverage-40%25-orange)](https://github.com/xiangyshi/)
[![Tests](https://img.shields.io/badge/tests-125%20passing-brightgreen)](https://github.com/xiangyshi/)

Welcome to the STEMz Core Server API! This API provides a robust backend for managing users and classrooms in the STEMz application. 

## Table of Contents

- [Getting Started](#getting-started)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Endpoints](#api-endpoints)
- [How to Call the API](#how-to-call-the-api)
- [Error Handling](#error-handling)
- [Expanding the API](#expanding-the-api)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas or a local MongoDB instance

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/stemz-learning/core_server.git
   ```

2. Navigate to the project directory:

   ```bash
   cd core_server
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your MongoDB connection string:

   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@stemz.ae0vefg.mongodb.net/"

   # Include any necessary DB here (check MongoDB for names)
   TEACHER_PLATFORM_DB="<db_name>"
   ```
  **MAKE SURE .env IS INCLUDED IN .gitignore!**

5. Run dev command
    ```bash
    vercel dev
    # Choose email login option
    # Fill in credential
    ```

## CI Pipeline

This project includes a streamlined Continuous Integration pipeline:

### 🚀 **Automated Testing**
- **125 tests** across **11 test suites** with **100% pass rate**
- Runs on every push and pull request
- Node.js 20.x environment
- Test coverage reporting

### 🔒 **Security Scanning**
- Automated npm audit for vulnerability detection
- Critical severity threshold (development dependencies excluded)
- Dependency vulnerability monitoring

### 🌍 **Deployment**
- **Vercel Integration**: Automatic deployment via GitHub
- **Staging**: `develop` branch → Vercel preview
- **Production**: `main` branch → Vercel production
- **Preview**: Pull requests → Vercel preview URLs

### 📊 **Quality Gates**
- ✅ All tests must pass (125/125)
- ✅ Security audit must pass
- ✅ PR comments with test results

### 🛠️ **Local Testing**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci

# Run tests in watch mode
npm run test:watch
```

For detailed CI/CD setup instructions, see [CI_SETUP.md](./CI_SETUP.md).

## API Endpoints

### User Endpoints

- `POST /api/users/create`: Create a new user.
- `GET /api/users/`: Retrieve all users.
- `GET /api/users/read/:id`: Retrieve a specific user by ID.
- `PUT /api/users/update/:id`: Update a specific user by ID.
- `DELETE /api/users/delete/:id`: Delete a specific user by ID.

### Classroom Endpoints

- `POST /api/classrooms/create`: Create a new classroom.
- `GET /api/classrooms/`: Retrieve all classrooms.
- `GET /api/classrooms/read/:id`: Retrieve a specific classroom by ID.
- `PUT /api/classrooms/update/:id`: Update a specific classroom by ID.
- `DELETE /api/classrooms/delete/:id`: Delete a specific classroom by ID.

## How to Call the API

You can call the API using any HTTP client, such as Postman, or directly from your application using libraries like Axios or Fetch API. Here are some examples:

### Example using Fetch API (JavaScript)

```javascript
fetch('<vercel_link>/api/users/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => console.log(data))
.catch((error) => console.error('Error:', error));
```

```javascript
async function updateClassroom(classroomId, student) {
    const url = `<vercel_link>/classrooms/${classroomId}/students`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set content type to JSON
            },
            body: JSON.stringify(student), // Convert the student object to JSON
        });

        if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json();
            throw new Error(`Error: ${errorData.message}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log('Student added successfully:', data);
    } catch (error) {
        console.error('Failed to add student:', error.message);
    }
}

// Example usage:
const classroomId = 'classroom_1'; // Replace with the actual classroom ID
const student = {
    name: 'Student 1',
    email: 'student1@email.com',
};

updateClassroom(classroomId, student);

```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. Here are some common responses:

- **200 OK**: The request was successful.
- **201 Created**: A new resource was successfully created.
- **400 Bad Request**: The request was invalid. Check the payload for required fields.
- **404 Not Found**: The requested resource was not found.
- **500 Internal Server Error**: An error occurred on the server.

In case of an error, the API will return a JSON object with a `message` field describing the error.

## Expanding the API

To expand this API, consider the following:

1. **Implement API Key**
2. **Add new features**