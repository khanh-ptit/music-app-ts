"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roleSchema = new mongoose_1.default.Schema({
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
});
const Role = mongoose_1.default.model("Role", roleSchema, "roles");
exports.default = Role;
