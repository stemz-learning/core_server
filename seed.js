const axios = require('axios');
const connectDB = require('./src/api/mongodb');

const API_BASE_URL = 'http://localhost:3000/api/'; // Change this if needed
const seedCoursesLessons = async () => {
  try {
    console.log('Starting to seed courses with lessons...');
    
    const existingCourses = [
      {
        name: 'Astronomy',
        description: 'Explore the wonders of space and celestial objects.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: false,
        ws_3: true,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: true,
        quiz_5: false
      },
      {
        name: 'Basics of Coding 1',
        description: 'Learn fundamental programming concepts and logic.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: false,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: true,
        quiz_5: false
      },
      {
        name: 'Biochemistry',
        description: 'Study the chemical processes within living organisms.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: false,
        lesson_4: false,
        lesson_5: false,
        ws_1: false,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: true,
        quiz_3: false,
        quiz_4: false,
        quiz_5: false
      },
      {
        name: 'Chemistry',
        description: 'Discover the composition and properties of matter.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: false,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: true,
        quiz_5: false
      },
      {
        name: 'Circuits',
        description: 'Learn about electrical circuits and electronic components.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: false,
        lesson_5: false,
        ws_1: false,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: true,
        quiz_4: false,
        quiz_5: false
      },
      {
        name: 'Environmental Science',
        description: 'Study the environment and human impact on ecosystems.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: true,
        quiz_5: false
      },
      {
        name: 'Psychology',
        description: 'Explore human behavior and mental processes.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: true,
        quiz_5: false
      },
      {
        name: 'Statistics',
        description: 'Learn data analysis and statistical methods.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: true,
        ws_1: true,
        ws_2: false,
        ws_3: true,
        ws_4: true,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: false,
        quiz_5: true
      },
      {
        name: 'Zoology',
        description: 'Study animal life and behavior.',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: true,
        ws_1: true,
        ws_2: true,
        ws_3: false,
        ws_4: true,
        ws_5: false,
        quiz_1: false,
        quiz_2: false,
        quiz_3: false,
        quiz_4: false,
        quiz_5: true
      },
      
    ];

    // Clear existing courses if you want to avoid duplicates:
    // await Course.deleteMany({});

    // Insert your existing courses using the API
    for (const course of existingCourses) {
      try {
        const response = await axios.post(API_BASE_URL + 'course/', course);
        console.log(`✅ Created: ${response.data.name} (${course.name})`);
      } catch (error) {
        console.error(`❌ Failed to create ${course.name}:`, error.response ? error.response.data : error.message);
      }
    }
    
    console.log('Course seeding with lessons completed!');
  } catch (error) {
    console.error('Failed to seed courses:', error.message);
  }
};

const users = [
    { name: "David Wilson", email: "david@example.com", password: "pass1234" },
    { name: "Emma Davis", email: "emma@example.com", password: "qwerty" },
    { name: "Frank Thomas", email: "frank@example.com", password: "letmein" },
    { name: "Grace Martinez", email: "grace@example.com", password: "password1" },
    { name: "Henry Lee", email: "henry@example.com", password: "admin123" },
    { name: "Isabella White", email: "isabella@example.com", password: "iloveyou" },
    { name: "Jack Harris", email: "jack@example.com", password: "football" },
    { name: "Karen Lewis", email: "karen@example.com", password: "monkey" },
    { name: "Liam Walker", email: "liam@example.com", password: "welcome1" },
    { name: "Mia Hall", email: "mia@example.com", password: "password2" },
    { name: "Noah Young", email: "noah@example.com", password: "12345678" },
    { name: "Olivia King", email: "olivia@example.com", password: "98765432" },
    { name: "Paul Allen", email: "paul@example.com", password: "sunshine" },
    { name: "Quinn Scott", email: "quinn@example.com", password: "ilikecats" },
    { name: "Rachel Green", email: "rachel@example.com", password: "friendoftom" },
    { name: "Samuel Adams", email: "samuel@example.com", password: "beerlover" },
    { name: "Tina Parker", email: "tina@example.com", password: "rockstar" },
    { name: "Umar Patel", email: "umar@example.com", password: "biryani99" },
    { name: "Violet Knight", email: "violet@example.com", password: "purplelove" },
    { name: "William Turner", email: "william@example.com", password: "pirateship" },
    { name: "Xavier Lopez", email: "xavier@example.com", password: "xmarks" },
    { name: "Yvonne Brooks", email: "yvonne@example.com", password: "brooklyn" },
    { name: "Zachary Adams", email: "zach@example.com", password: "zebra123" }
];

const courses = [
    // STEM (Science, Technology, Engineering, Math)
    { name: "Algebra I", description: "Introduction to algebraic principles." },
    { name: "Geometry", description: "Exploring shapes, angles, and theorems." },
    { name: "Physics Fundamentals", description: "Basic principles of physics including motion and forces." },
    { name: "Intro to Computer Science", description: "Introduction to programming and problem-solving with Python." },
    { name: "Biology 101", description: "Basic biology concepts, including cells and ecosystems." },

    // Humanities (History, Literature, Social Studies)
    { name: "World History", description: "A journey through the major events in world history." },
    { name: "American Government", description: "Understanding the U.S. political system and its history." },
    { name: "Philosophy 101", description: "Introduction to philosophical thought and theories." },
    { name: "English Literature", description: "Studying classical and contemporary literature." },
    { name: "Psychology", description: "An introduction to human behavior and mental processes." },

    // Arts (Creative & Performing Arts)
    { name: "Music Theory", description: "Understanding musical notation and composition." },
    { name: "Digital Art & Design", description: "Creating digital art using modern design tools." },
    { name: "Film Studies", description: "Analysis of film techniques and storytelling in cinema." },
    { name: "Creative Writing", description: "Developing storytelling and writing techniques." },
    { name: "Theater & Drama", description: "Acting and performance techniques for stage and screen." }
];

const seedUsers = async () => {
    try {
        for (const user of users) {
            const response = await axios.post(API_BASE_URL + '/users/create', user);
            console.log(`User created: ${response.data.name} (${response.data.email})`);
        }
        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding users:", error.response ? error.response.data : error.message);
    }
};

const seedCourses = async () => {
    try {
        for (const course of courses) {
            const response = await axios.post(API_BASE_URL + '/course/', course);
            console.log(`Course created: ${response.data.name} (${response.data.description})`);
        }
        console.log("Seeding completed succesfully!");
    } catch (error) {
        console.error("Error seeding courses:", error.response ? error.response.data : error.message);
    }
};

const teachers = ["67eca6af37b4a79782bfc835", "67eca6b193f1f7ee815419f3", "67eca6b3999b2257d3089203"]
const students = ['67ecad8d0ed44de88a5b1f2d',
  '67ecad8f1ad58e6cf645de21',
  '67ecad90b82356602236d358',
  '67ecad928390f0d5600d4c73',
  '67ecad9465df1a1c4ff49c82',
  '67ecad96b446ddf95aff01a3',
  '67ecad98f7dddaf7496337cf',
  '67ecad9ae55379affce8e97d',
  '67ecad9b9a8f15d2eeae15da',
  '67ecad9dce3cbce2e633e520',
  '67ecad9fee7a5fbf41dd7874',
  '67ecada182734f54711734a0',
  '67ecada37289ed99819eae27',
  '67ecada4607d585056048254',
  '67ecada6d746a69e343098f0',
  '67ecada8d4b29e71314fb458',
  '67ecadaa4d51f09e56fc40e1',
  '67ecadac641a11893839597f',
  '67ecadad02810770666e170c',
  '67ecadaf634257002fcb4ae9',
  '67ecadb10a13d7d64dd417d7',
  '67ecadb3d1dee46ff90832eb',
  '67ecadb5c89bd121d2003f6f'
]
const stem_courses = ['67ee05981b9f19e66d4e2ee3', '67ee059a0f4f9568a8c184a9', '67ee059c9447519dc5872ee1', '67ee059e64d67107fe9e50ba', '67ee05a0f90c16193369f6ed']
const humanities_courses = ['67ee05a2f1d0313e94c35d83', '67ee05a31b8226cea7de5093', '67ee05a51e00550ae44f7850', '67ee05a7711f337e44192347', '67ee05a9a00c9d8b3e9931c7']
const art_courses = ['67ee05aba4fbde249b837b4a', '67ee05ac4da2916f3d65050a', '67ee05ae1d4f052f66d25b63', '67ee05b0f5f343c355c09df3', '67ee05b22099c5cb874139f5'] 
const classrooms = [
    { name: "STEM", description: "Math and science and stuff", teacher_user_id: teachers[0], student_user_ids: students, course_ids: stem_courses },
    { name: "Humanities", description: "People doing stuff I guess", teacher_user_id: teachers[1], student_user_ids: students, course_ids: humanities_courses },
    { name: "Arts", description: "creativity and stuff", teacher_user_id: teachers[2], student_user_ids: students, course_ids: art_courses }
]

const seedClassrooms = async () => {
    try {
        for (const classroom of classrooms) {
            const response = await axios.post(API_BASE_URL + '/classrooms', classroom);
            console.log(`Classroom created: ${response.data.name} (${response.data.description})`);
        }
        console.log("seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding classrooms:", error.response ? error.response.data : error.message);
    }
};

const seedGrades = async () => {
    try {
        const course_id = "67ee05981b9f19e66d4e2ee3";
        const classroom_id = "68008b3aba3b0ad0e8ff6d2f";
        const response_users = await axios.get(API_BASE_URL + '/classrooms/' + classroom_id + '/users');
        const students = response_users.data.students;
        const response_worksheets = await axios.get(API_BASE_URL + '/worksheets/course/' + course_id);
        const worksheets = response_worksheets.data;
        for (const student of students) {
            console.log(student.id);
            for (const worksheet of worksheets) {
                const response = await axios.post(API_BASE_URL + '/grade', {
                    worksheet_id: worksheet._id,
                    worksheet_name: worksheet.name,
                    student_user_id: student.id,
                    course_id: course_id,
                    classroom_id: classroom_id,
                    // Random grade between 50 and 100, with a small chance for grades below 50
                    grade: Math.random() < 0.1 ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 51) + 50,
                    time_to_complete: Math.floor(Math.random() * 100) + 1, // Random time to complete between 1 and 100 minutes
                });
                console.log(`Grade created for ${student.name} on worksheet ${worksheet.name}: ${response.data.grade}`);
            }
        }
    } catch (error) {
        console.error("Error seeding classrooms:", error.response ? error.response.data : error.message);
    }
};

// Run the seeding script
// seedUsers();
seedCoursesLessons();
// seedClassrooms();
// seedGrades();