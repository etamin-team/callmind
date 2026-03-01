#!/bin/bash

# Quick script to drop Payme transactions collection to fix duplicate key errors

echo "🔄 Dropping Payme transactions collection..."

# Connect to MongoDB and drop the collection
mongosh "mongodb://localhost:27017/callmind" --quiet --eval "
try {
  const result = db.paymetransactions.drop();
  print('✅ Collection dropped successfully: ' + result);
} catch (error) {
  if (error.code === 26) {
    print('ℹ️  Collection does not exist yet - no need to drop');
  } else {
    print('❌ Error: ' + error);
    exit(1);
  }
}
"

echo "✅ Done! Restart your API with: pnpm dev:api"
echo "Mongoose will recreate the collection with correct indexes."
