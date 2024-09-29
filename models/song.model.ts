import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: String,
    avatar: String,
    singerId: String,
    description: String,
    topicId: String,
    like: {
        type: Number,
        default: 0
    },
    lyrics: String,
    audio: String,
    status: String,
    slug: String,
    listen: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
})

const Song = mongoose.model("Song", songSchema, "songs")

export default Song