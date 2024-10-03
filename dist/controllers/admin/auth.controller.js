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
exports.logout = exports.loginPost = exports.login = void 0;
const md5_1 = __importDefault(require("md5"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const system_1 = require("../../config/system");
const login = (req, res) => {
    res.render("admin/pages/auth/login.pug", {
        pageTitle: "Đăng nhập quản trị"
    });
};
exports.login = login;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = (0, md5_1.default)(req.body.password);
    const existEmail = yield account_model_1.default.findOne({
        email: email,
        deleted: false
    });
    if (!existEmail) {
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    }
    const checkLogin = yield account_model_1.default.findOne({
        email: email,
        password: password,
        deleted: false
    });
    if (!checkLogin) {
        req.flash("error", "Email or mật khẩu không đúng!");
        res.redirect("back");
        return;
    }
    if (checkLogin.status == "inactive") {
        req.flash("error", "Tài khoản đã bị khóa!");
        res.redirect("back");
        return;
    }
    res.cookie("token", checkLogin.token);
    req.flash("success", "Đăng nhập thành công!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/dashboard`);
});
exports.loginPost = loginPost;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    req.flash("success", "Đăng xuất thành công!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/auth/login`);
});
exports.logout = logout;
