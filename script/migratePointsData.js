const mongoose = require("mongoose");
const User = require("../src/api/models/userModel");
const UserPoint = require("../src/api/models/userPointModel");

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://XXXX",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to database for migration");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

// Migration function
async function migrateUserPoints() {
  // Count users
  const userCount = await User.countDocuments();
  console.log(`Found ${userCount} users to migrate`);

  // Get all users
  const users = await User.find({});

  console.log("Starting migration...");
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      // Check if points already exist for this user
      const existingPoints = await UserPoint.findOne({ userId: user._id });

      if (existingPoints) {
        console.log(`Points already exist for user ${user._id}, skipping...`);
        skipped++;
        continue;
      }

      // Initialize points for this user
      await UserPoint.initializeForUser(user._id);
      console.log(
        `Initialized points for user ${user._id} (${i + 1}/${userCount})`
      );
      success++;
    } catch (error) {
      console.error(`Failed to initialize points for user ${user._id}:`, error);
      failed++;
    }
  }

  console.log("\nMigration Summary:");
  console.log(`Total users: ${userCount}`);
  console.log(`Successfully migrated: ${success}`);
  console.log(`Skipped (already had points): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

// Run the migration
async function runMigration() {
  const connected = await connectDB();
  if (!connected) {
    console.error("Failed to connect to database. Aborting migration.");
    process.exit(1);
  }

  try {
    await migrateUserPoints();
    console.log("Migration completed");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Execute the migration
runMigration();
