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
        type: Array,
        default: []
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
    createdBy: {
        accountId: String,
        createdAt: Date
    },
    updatedBy: [{
        accountId: String,
        updatedAt: Date
    }],
    deletedBy: {
        accountId: String,
        deletedAt: Date
    }
})

const Song = mongoose.model("Song", songSchema, "songs")

export default Song