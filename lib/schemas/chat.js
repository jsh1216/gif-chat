"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
// const { Schema } = mongoose
// const {
//   Types: { ObjectId },
// } = Schema
var ObjectId = mongoose_1.default.Schema.Types.ObjectId;
// export interface Chat {
//   _id: mongoose.Schema.Types.ObjectId
//   chat?: string
//   createdAt: Date
//   gif?: string
//   room: string
//   user: string
// }
var chatSchema = new mongoose_1.default.Schema({
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
});
exports.ChatSchema = mongoose_1.default.model('Chat', chatSchema);
