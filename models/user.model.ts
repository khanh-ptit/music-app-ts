import mongoose from "mongoose";
import * as generateHelper from "../helpers/generate"

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
        type: String,
        default: () => generateHelper.generateRandomString(30)
    },
    status: {
        type: String,
        default: "initial"
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema, "users")

export default User