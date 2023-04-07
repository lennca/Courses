import mongoose from 'mongoose'

/**
 * Schema for the snippet collection in the database.
 */
const schema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    minLength: 1
  },
  createdBy: {
    type: String,
    required: true,
    minLength: 1
  },
  tags: {
    type: Array
  }
})

const SnippetModel = mongoose.model('Snippet', schema)

export default SnippetModel
