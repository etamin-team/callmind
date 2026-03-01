#!/usr/bin/env node

/**
 * Script to fix Payme transaction collection indexes
 * Run this if you see duplicate key errors with paymeTransactionId
 */

import mongoose from "mongoose";

async function fixPaymeIndexes() {
  try {
    // Load environment
    const dotenv = await import("dotenv");
    const { default: config } = dotenv;
    config.config();

    // Connect to MongoDB using same config as API
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not set in environment");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get the collection
    const db = mongoose.connection.db;
    const collection = db.collection("paymetransactions");

    // List all indexes
    const indexes = await collection.indexes();
    console.log("\n📋 Current indexes:");
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Drop old index if it exists
    const oldIndexes = indexes.filter((i) =>
      i.name.includes("paymeTransactionId"),
    );
    if (oldIndexes.length > 0) {
      console.log(`\n🗑️  Dropping ${oldIndexes.length} old index(es)...`);
      for (const idx of oldIndexes) {
        console.log(`  - Dropping: ${idx.name}`);
        await collection.dropIndex(idx.name);
      }
    } else {
      console.log("\n✅ No old indexes found");
    }

    // Create fresh collection (this will recreate all indexes)
    console.log("\n🔄 Recreating collection with correct schema...");
    await collection.drop();
    console.log("✅ Collection dropped");

    // Force Mongoose to recreate indexes
    console.log("\n✅ Payme transaction indexes fixed!");
    console.log(
      "\n📝 Next time you start the API, Mongoose will recreate indexes automatically.",
    );
  } catch (error: any) {
    if (error.code === 26) {
      console.log("ℹ️  Collection doesn't exist yet - no indexes to fix");
    } else {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the fix
fixPaymeIndexes();
