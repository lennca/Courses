import mongoose from 'mongoose'

/**
 * Function that establish and handles the connection to MongoDB. (Function inspired from lecture Persistant data - slide 8).
 *
 * @returns {Promise} Promise that resolves if the connection succeeds.
 */
export const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected...')
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection closed...')
  })

  mongoose.connection.on('error', (error) => {
    console.log('MongoDB connection failed...' + error)
  })

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed...')
      process.exit(0)
    })
  })

  return mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
}
