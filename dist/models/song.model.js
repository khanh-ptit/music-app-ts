"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const songSchema = new mongoose_1.default.Schema({
    title: String,
    avatar: String,
    singerId: String,
    description: String,
    topicId: String,
    like: {
        type: Array,
        default: []
    },
    position: Number,
    lyrics: String,
    audio: String,
    status: String,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    listen: {
        type: Number,
        default: 0
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
});
const Song = mongoose_1.default.model("Song", songSchema, "songs");
exports.default = Song;
