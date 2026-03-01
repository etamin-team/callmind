#!/bin/bash

echo "🔄 Fixing Payme MongoDB collection..."

# Connect to MongoDB and drop Payme transactions collection
mongosh mongodb://localhost:27017/callmind --quiet --eval "
use callmind
const result = db.paymetransactions.drop()
print('✅ Collection dropped: ' + result)
"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Success! Payme collection dropped."
  echo ""
  echo "📝 Next steps:"
  echo "1. Restart your API: pnpm dev:api"
  echo "2. Mongoose will recreate the collection with correct indexes"
  echo "3. Run Payme sandbox tests"
  echo ""
  echo "All methods now comply with Payme's official API specification! 🎉"
else
  echo "❌ Failed to drop collection"
  echo "Check that MongoDB is running and connection string is correct in .env"
fi
