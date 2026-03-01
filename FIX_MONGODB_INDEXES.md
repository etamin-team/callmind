# Quick Fix for Payme MongoDB Duplicate Key Error

## The Problem

MongoDB still has the old index `paymeTransactionId_1` from before we renamed the field to `transactionId`. This causes duplicate key errors.

## Quick Fix (Recommended)

### Option 1: Drop Collection via MongoDB Shell

```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017/callmind

# Or if using Docker
docker exec -it <mongo_container> mongosh

# Drop the Payme transaction collection
use callmind
db.paymetransactions.drop()

# Exit
exit
```

### Option 2: Drop Collection via Node Script

```bash
# Create simple script
cat > drop-payme.js << 'EOF'
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/callmind');
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db();
  const result = await db.collection('paymetransactions').drop();
  console.log('✅ Collection dropped:', result);

  await client.close();
}

run().catch(console.error);
EOF

# Run it
node drop-payme.js

# Clean up
rm drop-payme.js
```

### Option 3: Reset Entire Database (Clean Slate)

⚠️ **WARNING: This deletes ALL data!**

```bash
mongosh mongodb://admin:password@localhost:27017/callmind
use callmind
db.dropDatabase()
exit
```

## After Fixing

Once you've dropped the collection, restart your API:

```bash
pnpm dev:api
```

Mongoose will automatically recreate the collection with the correct schema and indexes.

## Verify It's Working

Check that indexes are correct:

```bash
mongosh mongodb://admin:password@localhost:27017/callmind
use callmind
db.paymetransactions.getIndexes()
```

You should see indexes like:

- `_id_` (default)
- `transactionId_1` (new, correct)
- `merchantTransactionId_1` (correct)
- `orderId_1` (correct)
- `userId_1` (correct)
- `state_1` (correct)

You should NOT see:

- ~~`paymeTransactionId_1`~~ (old, incorrect)

## Test Users for Payme Sandbox

After fixing the indexes, create test users:

```bash
# Create test user
curl -X POST http://localhost:3001/api/payme/test-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_37NW4YrLX0dw6A99b4o6bz0TYHs"
  }'
```

Then run Payme tests again!
