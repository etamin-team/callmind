const mongoose = require("mongoose");

async function checkData() {
  try {
    await mongoose.connect(
      "mongodb://abror:abror2520@localhost:27017/callmind?authSource=admin",
    );
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("paymetransactions");

    const count = await collection.countDocuments();
    console.log("Total documents:", count);

    const docs = await collection.find({}).limit(10).toArray();
    console.log("Sample documents:");
    docs.forEach((doc) => console.log("  ", JSON.stringify(doc, null, 2)));

    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();
