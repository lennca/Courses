import mongoose from 'mongoose'

/**
 * Schema for the user collection in the database.
 */
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 1,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8
  }
})

const UserModel = mongoose.model('User', schema)

export default UserModel
