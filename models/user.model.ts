import mongoose from "mongoose";
import * as generateHelper from "../helpers/generate";

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
        default: "initial" // Các trạng thái có thể: "initial", "active", "inactive"
    },
    avatar: {
        type: String,
        default: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
    },
    phone: String,
    address: String,
    deleted: {
        type: Boolean,
        default: false
    },
    lockedUntil: {
        type: Date,
        default: null // Thời điểm mà tài khoản sẽ được mở khóa, null nếu không bị khóa
    },
    lockedBy: {
        type: String,
        enum: ['passwordForgotPost', 'verifyEmailPost', null],  // Thêm trường này
        default: null // Lưu thông tin nguồn khóa tài khoản
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: [{
        accountId: String,
        updatedAt: Date
    }],
    deletedBy: {
        accountId: String,
        deletedAt: Date
    }    
});

const User = mongoose.model("User", userSchema, "users");

export default User;