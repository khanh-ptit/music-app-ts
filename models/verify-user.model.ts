import mongoose from "mongoose";
import * as generateHelper from "../helpers/generate"

const verifyUserSchema = new mongoose.Schema({
    email: String,
    otp: String,
    expireAt: {
        type: Date,
        expires: 0
    }
}, {
    timestamps: true
})

const VerifyUser = mongoose.model("VerifyUser", verifyUserSchema, "verify-user")

export default VerifyUser