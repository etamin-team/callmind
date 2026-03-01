const mongoose = require("mongoose");

async function dropIndexes() {
  try {
    await mongoose.connect(
      "mongodb://abror:abror2520@localhost:27017/callmind?authSource=admin",
    );
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Drop the entire database and recreate it
    await db.dropDatabase();
    console.log("Database dropped successfully!");
    console.log("Will be recreated by next connection");

    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

dropIndexes();
