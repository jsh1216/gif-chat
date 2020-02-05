import mongoose from 'mongoose'

// const { Schema } = mongoose
// const {
//   Types: { ObjectId },
// } = Schema

const { ObjectId } = mongoose.Schema.Types

// export interface Chat {
//   _id: mongoose.Schema.Types.ObjectId
//   chat?: string
//   createdAt: Date
//   gif?: string
//   room: string
//   user: string
// }

const chatSchema = new mongoose.Schema({
  chat: String,
  createdAt: {
    default: Date.now,
    type: Date,
  },
  gif: String,
  room: {
    ref: 'Room',
    required: true,
    type: ObjectId,
  },
  user: {
    required: true,
    type: String,
  },
})

export const ChatSchema = mongoose.model('Chat', chatSchema)
