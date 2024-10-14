"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const singerSchema = new mongoose_1.default.Schema({
    fullName: String,
    avatar: String,
    status: String,
    description: String,
    realName: String,
    birthYear: Number,
    nationality: String,
    hometown: String,
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
    deletedAt: Date,
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
});
const Singer = mongoose_1.default.model("Singer", singerSchema, "singers");
exports.default = Singer;
