import mongoose from "mongoose";
import { PaymeTransactionModel } from "@repo/db";
import { config } from "../config/environment.js";

/**
 * Migration to drop old Payme transaction indexes
 * Run this once after updating the schema
 */

async function migratePaymeIndexes() {
  try {
    console.log("🔄 Starting Payme indexes migration...");

    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get the collection
    const collection = mongoose.connection.db?.collection("paymetransactions");
    if (!collection) {
      throw new Error("Collection not found");
    }

    // List all indexes
    const indexes = await collection.indexes();
    console.log(
      "📋 Current indexes:",
      indexes.map((i) => i.name),
    );

    // Drop old index if it exists
    const oldIndex = indexes.find((i) => i.name === "paymeTransactionId_1");
    if (oldIndex) {
      console.log("🗑️  Dropping old index: paymeTransactionId_1");
      await collection.dropIndex("paymeTransactionId_1");
    }

    // Ensure new indexes exist
    console.log("✅ Creating new indexes...");
    await PaymeTransactionModel.init();

    // Verify indexes
    const newIndexes = await collection.indexes();
    console.log(
      "📋 Final indexes:",
      newIndexes.map((i) => i.name),
    );

    console.log("✅ Payme indexes migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migratePaymeIndexes()
  .then(() => {
    console.log("✅ All migrations completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
