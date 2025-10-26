# STEMz Teacher Platform API Documentation

## Overview

The STEMz Teacher Platform API provides comprehensive backend services for managing educational content, users, classrooms, assignments, and collaborative learning features.

**Base URL**: `https://core-server-nine.vercel.app/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Sign Up
- **POST** `/api/auth/signup`
- **Description**: Create a new user account
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "teacher|student",
    "gradeLevel": 5  // Required for students (1-6)
  }
  ```
- **Response**: `201` - User created successfully
- **Response**: `400` - Validation error or duplicate email

#### Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200` - Login successful with JWT token
- **Response**: `401` - Invalid credentials
- **Response**: `404` - User not found

#### Verify Token
- **POST** `/api/auth/verify`
- **Description**: Verify JWT token validity
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200` - Token valid
- **Response**: `403` - Invalid/expired token

---

### 👥 Users (`/api/users`)

#### Create User
- **POST** `/api/users/create`
- **Description**: Create a new user (admin function)
- **Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "teacher|student",
    "gradeLevel": 4
  }
  ```

#### Get All Users
- **GET** `/api/users`
- **Description**: Retrieve all users
- **Response**: Array of user objects

#### Get User by ID
- **GET** `/api/users/id/:id`
- **Description**: Get user by MongoDB ObjectId
- **Response**: User object

#### Get User by Email
- **GET** `/api/users/email/:email`
- **Description**: Get user by email address
- **Response**: User object

#### Update User
- **PUT** `/api/users/id/:id`
- **Description**: Update user information
- **Body**: User object with updated fields

#### Delete User
- **DELETE** `/api/users/id/:id`
- **Description**: Delete user account

---

### 🏫 Classrooms (`/api/classrooms`)

#### Get All Classrooms
- **GET** `/api/classrooms`
- **Description**: Retrieve all classrooms
- **Response**: Array of classroom objects

#### Get All Classrooms with IDs
- **GET** `/api/classrooms/allIDs`
- **Description**: Retrieve all classrooms with full data
- **Response**: Array of classroom objects

#### Get All Classrooms with Names
- **GET** `/api/classrooms/allNames`
- **Description**: Retrieve classrooms with simplified student/teacher info
- **Response**: Array of simplified classroom objects with populated user data

#### Get Classroom by ID
- **GET** `/api/classrooms/:id`
- **Description**: Get specific classroom details
- **Response**: Classroom object with populated teacher and students

#### Create Classroom
- **POST** `/api/classrooms`
- **Description**: Create a new classroom
- **Body**:
  ```json
  {
    "name": "Grade 5 Science",
    "description": "Elementary science classroom",
    "teacher_user_id": "teacher_object_id",
    "student_user_ids": ["student1_id", "student2_id"],
    "course_ids": ["course1_id", "course2_id"],
    "schedule": "Monday-Friday 9:00-10:00 AM",
    "recommendedGradeLevel": "5"
  }
  ```

#### Update Classroom
- **PUT** `/api/classrooms/:id`
- **Description**: Update classroom information
- **Body**: Classroom object with updated fields

#### Delete Classroom
- **DELETE** `/api/classrooms/:id`
- **Description**: Delete classroom

#### Get User Classrooms
- **GET** `/api/classrooms/user/getUserClassrooms`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get classrooms for authenticated user
- **Response**: Object with `enrolled` and `teaching` arrays

#### Enroll in Classroom
- **POST** `/api/classrooms/:id/enroll`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Enroll authenticated user in classroom

#### Unenroll from Classroom
- **POST** `/api/classrooms/:id/unenroll`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Remove authenticated user from classroom

#### Get Classroom Users
- **GET** `/api/classrooms/:id/users`
- **Description**: Get all users in a classroom
- **Response**: Object with `students` and `teacher` arrays

#### Get Classroom Courses
- **GET** `/api/classrooms/:id/courses`
- **Description**: Get all courses associated with a classroom
- **Response**: Array of course objects

---

### 📚 Courses (`/api/courses`)

#### Get All Courses
- **GET** `/api/courses`
- **Description**: Retrieve all available courses
- **Response**: Array of course objects

#### Get Course by ID
- **GET** `/api/courses/:id`
- **Description**: Get specific course details
- **Response**: Course object

#### Create Course
- **POST** `/api/courses`
- **Description**: Create a new course
- **Body**:
  ```json
  {
    "name": "Introduction to Astronomy",
    "description": "Basic astronomy concepts",
    "lesson_1": true,
    "lesson_2": false,
    "ws_1": true,
    "quiz_1": false
  }
  ```

#### Update Course
- **PUT** `/api/courses/:id`
- **Description**: Update course information
- **Body**: Course object with updated fields

#### Delete Course
- **DELETE** `/api/courses/:id`
- **Description**: Delete course

---

### 📝 Assignments (`/api/assignments`)

#### Get Student Assignments
- **GET** `/api/assignments/my-assignments`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get assignments for authenticated student

#### Get Upcoming Assignments
- **GET** `/api/assignments/upcoming`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get upcoming assignments for authenticated user

#### Get Course Assignments
- **GET** `/api/assignments/course/:courseName`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get assignments for specific course

#### Get Classroom Assignments
- **GET** `/api/assignments/classroom/:classroomId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get assignments for specific classroom

#### Get Teacher Assignments
- **GET** `/api/assignments/my-created`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get assignments created by authenticated teacher

#### Create Assignment
- **POST** `/api/assignments`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create a new assignment
- **Body**:
  ```json
  {
    "physicalClassroomId": "physical_classroom_id",
    "teacherId": "teacher_id",
    "title": "Astronomy Quiz",
    "description": "Test your astronomy knowledge",
    "course": "astronomy",
    "lesson": "lesson1",
    "activityTitle": "Solar System Basics",
    "activityType": "quiz",
    "dueDate": "2024-01-15T23:59:59Z",
    "priority": "medium"
  }
  ```

#### Update Assignment
- **PUT** `/api/assignments/:assignmentId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Update assignment details

#### Delete Assignment
- **DELETE** `/api/assignments/:assignmentId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Soft delete assignment (sets isActive to false)

#### Get Assignment by ID
- **GET** `/api/assignments/:assignmentId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get specific assignment details

---

### 📊 Grades (`/api/grades`)

#### Get All Grades
- **GET** `/api/grades`
- **Description**: Retrieve all grades

#### Get Grade by ID
- **GET** `/api/grades/:id`
- **Description**: Get specific grade details

#### Create Grade
- **POST** `/api/grades`
- **Description**: Create a new grade entry
- **Body**:
  ```json
  {
    "student_user_id": "student_id",
    "worksheet_id": "worksheet_id",
    "worksheet_name": "Worksheet Name",
    "course_id": "course_id",
    "classroom_id": "classroom_id",
    "grade": 85,
    "time_to_complete": 30
  }
  ```

#### Update Grade
- **PUT** `/api/grades/:id`
- **Description**: Update grade information

#### Delete Grade
- **DELETE** `/api/grades/:id`
- **Description**: Delete grade entry

#### Get Classroom Grades
- **GET** `/api/grades/classroom/:classroomId`
- **Description**: Get all grades for a classroom

---

### 📋 Worksheets (`/api/worksheets`)

#### Get All Worksheets
- **GET** `/api/worksheets`
- **Description**: Retrieve all worksheets

#### Get Worksheets by Course
- **GET** `/api/worksheets/course/:courseId`
- **Description**: Get worksheets for specific course

#### Get Worksheets by Classroom
- **GET** `/api/worksheets/classroom/:classroomId`
- **Description**: Get worksheets for specific classroom

#### Create Worksheet Progress
- **POST** `/api/worksheets/create`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create worksheet progress entry
- **Body**:
  ```json
  {
    "userEmail": "student@example.com",
    "worksheetId": "worksheet_id",
    "progress": {
      "completed": true,
      "score": 85
    }
  }
  ```

#### Update Worksheet Progress
- **PUT** `/api/worksheets/update`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Update worksheet progress

---

### ❓ Questions (`/api/quizquestions` & `/api/bpqquestions`)

#### Get Quiz Questions
- **GET** `/api/quizquestions`
- **Description**: Get quiz questions with filters
- **Query Parameters**:
  - `course_id`: Course identifier (required)
  - `grade`: Grade level (required)
- **Example**: `/api/quizquestions?course_id=astronomy&grade=k-2`

#### Get BPQ Questions
- **GET** `/api/bpqquestions`
- **Description**: Get Before, During, After questions
- **Query Parameters**:
  - `course_id`: Course identifier (required)
  - `grade`: Grade level (required)
  - `lesson_id`: Lesson identifier (required)
- **Example**: `/api/bpqquestions?course_id=chemistry&grade=5-6&lesson_id=lesson1`

---

### 🎯 User Points (`/api/points`)

#### Get User Points
- **GET** `/api/points`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get authenticated user's points and progress

#### Update User Points
- **POST** `/api/points`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Update user's entire points data

#### Update Activity Progress
- **PATCH** `/api/points/activity`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Update specific activity progress

#### Get Total Points
- **GET** `/api/points/total`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get authenticated user's total points

#### Get User Total Points
- **GET** `/api/points/total/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get any user's total points

#### Reset User Points
- **DELETE** `/api/points/reset/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Reset user's points (admin function)

---

### 👥 Study Groups (`/api/studygroups`)

#### Create Study Group
- **POST** `/api/studygroups`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create a new study group
- **Body**:
  ```json
  {
    "classroomId": "classroom_id",
    "name": "Astronomy Study Group",
    "memberUserIds": ["user1_id", "user2_id", "user3_id"],
    "createdBy": "creator_user_id"
  }
  ```

#### Get User Study Groups
- **GET** `/api/studygroups`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get current user's study groups

#### Get Study Group by ID
- **GET** `/api/studygroups/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get specific study group details

#### Get Study Groups by Classroom
- **GET** `/api/studygroups/classroom/:classroomId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get all study groups for a classroom

#### Update Study Group Members
- **PUT** `/api/studygroups/:id/members`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Replace all members in study group

#### Add Members to Study Group
- **POST** `/api/studygroups/:id/members`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Add new members to study group

#### Remove Members from Study Group
- **DELETE** `/api/studygroups/:id/members`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Remove members from study group

#### Archive Study Group
- **POST** `/api/studygroups/:id/archive`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Archive a study group

---

### 💬 Group Messages (`/api/group-messages`)

#### Get Messages by Group
- **GET** `/api/group-messages/:groupId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get all messages for a study group
- **Query Parameters**:
  - `limit`: Number of messages to retrieve (default: 50)
  - `offset`: Number of messages to skip (default: 0)

#### Send Message
- **POST** `/api/group-messages/:groupId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Send a message to a study group
- **Body**:
  ```json
  {
    "content": "Hello everyone! Let's discuss the solar system.",
    "attachments": [
      {
        "url": "https://example.com/file.pdf",
        "type": "file",
        "name": "study_guide.pdf"
      }
    ]
  }
  ```

#### Update Message
- **PUT** `/api/group-messages/message/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Update a message (only by sender)

#### Delete Message
- **DELETE** `/api/group-messages/message/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Soft delete a message (only by sender)

---

### 🏢 Physical Classrooms (`/api/physical-classrooms`)

#### Get Physical Classrooms Basic Info
- **GET** `/api/physical-classrooms/basic-info`
- **Description**: Get basic info for display purposes
- **Response**: Array of basic classroom info

#### Get All Physical Classrooms
- **GET** `/api/physical-classrooms`
- **Description**: Retrieve all physical classrooms
- **Response**: Array of physical classroom objects

#### Get User Physical Classrooms
- **GET** `/api/physical-classrooms/my-classrooms/:userId`
- **Description**: Get physical classrooms for a specific user
- **Response**: Array of physical classroom objects

#### Create Physical Classroom
- **POST** `/api/physical-classrooms`
- **Description**: Create a new physical classroom
- **Body**:
  ```json
  {
    "name": "Room 101",
    "description": "Grade 5 Science Classroom",
    "teacherId": "teacher_id",
    "schoolName": "Elementary School",
    "gradeLevel": "5",
    "academicYear": "2024-2025",
    "classroomNumber": "101",
    "maxStudents": 30,
    "students": ["student1_id", "student2_id"]
  }
  ```

#### Get Physical Classroom by ID
- **GET** `/api/physical-classrooms/:id`
- **Description**: Get specific physical classroom details

#### Update Physical Classroom
- **PUT** `/api/physical-classrooms/:id`
- **Description**: Update physical classroom information

#### Delete Physical Classroom
- **DELETE** `/api/physical-classrooms/:id`
- **Description**: Delete physical classroom

#### Get Classroom Students
- **GET** `/api/physical-classrooms/:id/students`
- **Description**: Get all students in a physical classroom

#### Add Student to Classroom
- **POST** `/api/physical-classrooms/:id/add-student`
- **Description**: Add a student to physical classroom

#### Remove Student from Classroom
- **POST** `/api/physical-classrooms/:id/remove-student`
- **Description**: Remove a student from physical classroom

---

### 🔔 Notifications (`/api/notifications`)

#### Get User Notifications
- **GET** `/api/notifications/my-notifications`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get notifications for authenticated user

#### Get Notification Summary
- **GET** `/api/notifications/summary`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get notification summary for user

#### Mark Notification as Read
- **POST** `/api/notifications/read/:notificationId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Mark a notification as read

#### Dismiss Notification
- **POST** `/api/notifications/dismiss/:notificationId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Dismiss a notification

#### Teacher Dismiss Notification
- **POST** `/api/notifications/teacher-dismiss/:notificationId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Teacher-specific notification dismissal

#### Clear All Notifications
- **POST** `/api/notifications/clear-all`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Clear all notifications for user

#### Get Classroom Notifications
- **GET** `/api/notifications/classroom/:classroomId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get notifications for a classroom

#### Create Announcement
- **POST** `/api/notifications/announcement`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create an announcement notification

#### Create Assignment Notification
- **POST** `/api/notifications/assignment`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create assignment notification

#### Get Teacher Notifications
- **GET** `/api/notifications/teacher-notifications`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get notifications for teachers

#### Get All Teacher Notifications
- **GET** `/api/notifications/all-teacher-notifications`
- **Description**: Get all teacher notifications

#### Create Quiz Failure Notification
- **POST** `/api/notifications/quiz-failure`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create quiz failure notification

#### Send Email Notification
- **POST** `/api/notifications/email`
- **Description**: Send email notification

#### Get Legacy Notifications
- **GET** `/api/notifications/legacy`
- **Description**: Get all notifications (legacy endpoint)

---

### 📈 Progress Tracking (`/api/progress`)

#### Get All Progress Records
- **GET** `/api/progress`
- **Description**: Retrieve all progress records

#### Get Progress by User ID
- **GET** `/api/progress/user/:user_id`
- **Description**: Get progress records for a specific user

#### Get Progress by Course Name
- **GET** `/api/progress/course/:course_name`
- **Description**: Get progress records for a specific course

#### Get Progress by Assignment Type
- **GET** `/api/progress/type/:assignment_type`
- **Description**: Get progress records by assignment type (worksheet, lesson, quiz)

#### Get Course Completion Percentage
- **GET** `/api/progress/user/:user_id/course/:course_name/completion`
- **Description**: Get course completion percentage for a user

#### Get Progress by User and Type
- **GET** `/api/progress/user/:user_id/type/:assignment_type`
- **Description**: Get progress records by user ID and assignment type

#### Get Progress by Course and Assignment
- **GET** `/api/progress/course/:course_name/assignment/:assignment_number`
- **Description**: Get progress records by course and assignment number

#### Get User Progress Stats
- **GET** `/api/progress/user/:user_id/stats`
- **Description**: Get progress statistics for a user

#### Get Progress by ID
- **GET** `/api/progress/:id`
- **Description**: Get specific progress record

#### Create Progress Record
- **POST** `/api/progress`
- **Description**: Create a new progress record

#### Bulk Create Progress Records
- **POST** `/api/progress/bulk`
- **Description**: Create multiple progress records

#### Update Progress Record
- **PUT** `/api/progress/:id`
- **Description**: Update entire progress record

#### Update Progress Data
- **PUT** `/api/progress/:id/data`
- **Description**: Update only progress data (partial update)

#### Delete Progress Record
- **DELETE** `/api/progress/:id`
- **Description**: Delete specific progress record

#### Delete User Progress
- **DELETE** `/api/progress/user/:user_id`
- **Description**: Delete all progress records for a user

---

### 📝 Student Responses (`/api/student-responses`)

#### Get Student Responses
- **GET** `/api/student-responses/:courseId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get student responses for a course

#### Add/Update BPQ Response
- **POST** `/api/student-responses/:courseId/lesson/:lessonId/bpq`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Add or update Before, During, After question response

#### Submit Worksheet
- **POST** `/api/student-responses/:courseId/lesson/:lessonId/worksheet`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Submit worksheet response

#### Submit Quiz Attempt
- **POST** `/api/student-responses/:courseId/lesson/:lessonId/quiz`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Submit quiz attempt

#### Get Student Responses by Student ID
- **GET** `/api/student-responses/student/:studentId`
- **Description**: Get responses for a specific student

#### Add BPQ Event
- **POST** `/api/student-responses/:courseId/:lessonId/bpqEvent`
- **Description**: Add BPQ event

#### Save Partial Quiz Answer
- **POST** `/api/student-responses/:courseId/lesson/:lessonId/quiz/partial`
- **Description**: Save partial quiz answer

---

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)",
  "role": "student|teacher",
  "gradeLevel": "Number (1-6, for students)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Classroom
```json
{
  "_id": "ObjectId",
  "name": "String (maxLength: 100)",
  "description": "String",
  "teacher_user_id": "ObjectId (ref: User)",
  "student_user_ids": ["ObjectId (ref: User)"],
  "course_ids": ["ObjectId (ref: Course)"],
  "schedule": "String",
  "recommendedGradeLevel": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Assignment
```json
{
  "_id": "ObjectId",
  "physicalClassroomId": "ObjectId (ref: PhysicalClassroom)",
  "teacherId": "ObjectId (ref: User)",
  "title": "String (maxLength: 200)",
  "description": "String (maxLength: 1000)",
  "course": "astronomy|chemistry|basicsOfCoding|biochemistry|circuits|environmentalScience|psychology|statistics|zoology",
  "lesson": "String (pattern: lesson1, lesson2, etc.)",
  "activityTitle": "String",
  "activityType": "quiz|worksheet|video",
  "dueDate": "Date",
  "isActive": "Boolean",
  "priority": "low|medium|high",
  "directLink": "String (auto-generated)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Study Group
```json
{
  "_id": "ObjectId",
  "classroomId": "ObjectId (ref: Classroom)",
  "name": "String (maxLength: 120)",
  "memberUserIds": ["ObjectId (ref: User)"],
  "createdBy": "ObjectId (ref: User)",
  "lastMessageAt": "Date",
  "isArchived": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Group Message
```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId (ref: StudyGroup)",
  "senderUserId": "ObjectId (ref: User)",
  "content": "String (maxLength: 5000)",
  "attachments": [
    {
      "url": "String",
      "type": "image|file|link",
      "name": "String"
    }
  ],
  "editedAt": "Date",
  "deletedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Physical Classroom
```json
{
  "_id": "ObjectId",
  "name": "String (maxLength: 100)",
  "description": "String",
  "teacherId": "ObjectId (ref: User)",
  "studentIds": ["ObjectId (ref: User)"],
  "schoolName": "String",
  "gradeLevel": "K|1|2|3|4|5|6|7|8|9|10|11|12",
  "academicYear": "String",
  "classroomNumber": "String",
  "isActive": "Boolean",
  "maxStudents": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Grade
```json
{
  "_id": "ObjectId",
  "worksheet_id": "ObjectId (ref: Worksheet)",
  "worksheet_name": "String",
  "student_user_id": "ObjectId (ref: User)",
  "course_id": "ObjectId (ref: Course)",
  "classroom_id": "ObjectId (ref: Classroom)",
  "grade": "Number",
  "time_to_complete": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Worksheet
```json
{
  "_id": "ObjectId",
  "name": "String",
  "course_id": "String",
  "description": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Standard Error Format
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per authenticated user
- **File upload endpoints**: 10 requests per minute per authenticated user

---

## WebSocket Support

The API supports WebSocket connections for real-time features:
- **Study Group Chat**: Real-time messaging in study groups
- **Live Notifications**: Real-time assignment and grade notifications
- **Collaborative Features**: Real-time collaboration tools

**WebSocket URL**: `ws://your-domain.com/socket.io/`

---

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install axios
```

### Python
```bash
pip install requests
```

### Example Usage (JavaScript)
```javascript
const axios = require('axios');

// Login
const loginResponse = await axios.post('/api/auth/login', {
  email: 'teacher@example.com',
  password: 'password123'
});

const token = loginResponse.data.token;

// Get assignments
const assignments = await axios.get('/api/assignments/my-created', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Support

For API support and questions:
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Email**: support@stemz.com

---

*Last updated: October 16th 2025*
