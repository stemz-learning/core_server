// migrateUser.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/api/models/userModel');

async function migrateUsers() {
  try {
    const fullUri = process.env.MONGODB_URI;
    console.log("Connecting to:", fullUri);

    await mongoose.connect(fullUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    const users = await User.find({
      $or: [{ role: { $exists: false } }, { gradeLevel: { $exists: false } }]
    });

    for (const user of users) {
      let updated = false;

      if (!user.role) {
        user.role = 'student';
        updated = true;
      }

      if (!user.gradeLevel) {
        user.gradeLevel = 1;
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`Updated user ${user.email}`);
      }
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrateUsers();
