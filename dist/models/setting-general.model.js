"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const settingGeneralSchema = new mongoose_1.default.Schema({
    websiteName: String,
    favicon: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    copyright: String
});
const SettingGeneral = mongoose_1.default.model("SettingGeneral", settingGeneralSchema, "setting-general");
exports.default = SettingGeneral;
