import mongoose from "mongoose";
import slug from "mongoose-slug-updater"
mongoose.plugin(slug)

const singerSchema = new mongoose.Schema({
    fullName: String,
    avatar: String,
    status: String,
    description: String,
    slug: {
        type: String,
        slug: "fullName",
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    position: Number,
    deletedAt: Date
}, {
    timestamps: true
})

const Singer = mongoose.model("Singer", singerSchema, "singers")

export default Singer