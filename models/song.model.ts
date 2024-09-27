import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: String,
    avatar: String,
    singerId: String,
    description: String,
    topicId: String,
    like: Number,
    lyrics: String,
    audio: String,
    status: String,
    slug: String,
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