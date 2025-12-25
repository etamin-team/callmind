import mongoose from 'mongoose'

export const connectDB = async (uri?: string) => {
  const mongoUri = uri || process.env.MONGODB_URI
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined')
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export const disconnectDB = async () => {
  await mongoose.connection.close()
}

export * from './models/index.js'
export * from './utils/index.js'
