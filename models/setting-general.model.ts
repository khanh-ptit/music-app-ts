import mongoose from "mongoose";

const settingGeneralSchema = new mongoose.Schema({
    websiteName: String,
    favicon: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    copyright: String
})

const SettingGeneral = mongoose.model("SettingGeneral", settingGeneralSchema, "setting-general")

export default SettingGeneral