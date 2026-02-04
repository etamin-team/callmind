import mongoose from 'mongoose'
import { config } from 'dotenv'
import { UserModel } from '@repo/db'

// Load .env file
config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/callmind'

async function migrateUsers() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find all users without plan or credits fields
    const users = await UserModel.find({
      $or: [
        { plan: { $exists: false } },
        { credits: { $exists: false } }
      ]
    })

    console.log(`Found ${users.length} users to migrate`)

    // Update each user with plan='free' and credits=10
    for (const user of users) {
      await UserModel.findByIdAndUpdate(user.id, {
        plan: 'free',
        credits: 10
      })
      console.log(`Migrated user: ${user.email}`)
    }

    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateUsers()
