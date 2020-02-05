import mongoose from 'mongoose'

// 명확한 타입을 선언
export interface Room {
  _id: mongoose.Schema.Types.ObjectId
  createdAt: Date
  max: number
  owner: string
  password?: string
  title: string
}

// export type Room = mongoose.Document & {
//   createdAt: Date
//   max: number
//   owner: string
//   password?: string
//   title: string
// }

const roomSchema = new mongoose.Schema({
  createdAt: {
    default: Date.now,
    type: Date,
  },
  max: {
    default: 10,
    min: 2,
    required: true,
    type: Number,
  },
  owner: {
    required: true,
    type: String,
  },
  password: String,
  title: {
    required: true,
    type: String,
  },
})

export const RoomSchema = mongoose.model('Room', roomSchema)
