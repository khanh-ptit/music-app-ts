import mongoose from "mongoose";
import slug from "mongoose-slug-updater"
mongoose.plugin(slug)

const topicSchema = new mongoose.Schema({
    title: String,
    avatar: String,
    description: String,
    status: String,
    position: Number,
    slug: {
        type: String,
        slug: "title",
        unique: true
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

const Topic = mongoose.model("Topic", topicSchema, "topics")

export default Topic