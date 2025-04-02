const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/'; // Change this if needed

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

const classrooms = [

]

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
            console.log(`User created: ${response.data.name} (${response.data.email})`);
        }
        console.log("Seeding completed succesfully!");
    } catch (error) {
        console.error("Error seeding courses:", error.response ? error.response.data : error.message);
    }
};

// Run the seeding script
// seedUsers();
seedCourses();