import mongoose from "mongoose";
import * as generateHelper from "../helpers/generate"

const verifyLoginSchema = new mongoose.Schema({
    email: String,
    otp: String,
    phone: String,
    expireAt: {
        type: Date,
        expires: 0
    }
}, {
    timestamps: true
})

const VerifyLogin = mongoose.model("VerifyLogin", verifyLoginSchema, "verify-login")

export default VerifyLogin