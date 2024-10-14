"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalPatch = exports.general = void 0;
const setting_general_model_1 = __importDefault(require("../../models/setting-general.model"));
const general = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settingGeneral = yield setting_general_model_1.default.findOne();
    res.render("admin/pages/settings/general.pug", {
        pageTitle: "Cài đặt chung",
        settingGeneral: settingGeneral
    });
});
exports.general = general;
const generalPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const dataSettingGeneral = {
        websiteName: req.body.websiteName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        copyright: req.body.copyright,
        facebook: req.body.facebook,
        tiktok: req.body.tiktok,
        twitter: req.body.twitter,
        maps: req.body.maps
    };
    if (req.body.favicon) {
        dataSettingGeneral.favicon = req.body.favicon[0];
    }
    if (req.body.logo) {
        dataSettingGeneral.logo = req.body.logo[0];
    }
    yield setting_general_model_1.default.updateOne({
        _id: "67026270a95afb66c54704d5"
    }, dataSettingGeneral);
    req.flash("success", "Cập nhật thành công!");
    res.redirect("back");
});
exports.generalPatch = generalPatch;
