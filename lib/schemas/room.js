"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
// export type Room = mongoose.Document & {
//   createdAt: Date
//   max: number
//   owner: string
//   password?: string
//   title: string
// }
var roomSchema = new mongoose_1.default.Schema({
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
});
exports.RoomSchema = mongoose_1.default.model('Room', roomSchema);
