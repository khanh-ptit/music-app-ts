import mongoose from "mongoose";
import * as generateHelper from "../helpers/generate"

const accountSchema = new mongoose.Schema({
    email: String,
    password: String,
    fullName: String,
    token: {
        type: String,
        default: () => generateHelper.generateRandomString(30)
    },
    status: String,
    deleted: {
        type: Boolean,
        default: false
    },
    phone: String,
    role_id: String,
    avatar: String,
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

const Account = mongoose.model("Account", accountSchema, "accounts")

export default Account