import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    title: String,
    description: String,
    permissions: {
        type: Array,
        default: []
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Role = mongoose.model("Role", roleSchema, "roles")

export default Role