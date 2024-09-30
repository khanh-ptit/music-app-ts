import mongoose from "mongoose";
import slug from "mongoose-slug-updater"
mongoose.plugin(slug)

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
    position: Number,
    lyrics: String,
    audio: String,
    status: String,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
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