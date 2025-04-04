"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const generateHelper = __importStar(require("../helpers/generate"));
const userSchema = new mongoose_1.default.Schema({
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
        default: null
    },
    lockedBy: {
        type: String,
        enum: ['passwordForgotPost', 'verifyEmailPost', null],
        default: null
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
const User = mongoose_1.default.model("User", userSchema, "users");
exports.default = User;
