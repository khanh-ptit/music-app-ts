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

const Role = mongoose.model("Role", roleSchema, "roles")

export default Role