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
exports.login = exports.verifyUserPost = exports.verifyUser = exports.registerPost = exports.register = void 0;
const md5_1 = __importDefault(require("md5"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const verify_user_model_1 = __importDefault(require("../../models/verify-user.model"));
const generateHelper = __importStar(require("../../helpers/generate"));
const sendMailHelper = __importStar(require("../../helpers/sendMail"));
const register = (req, res) => {
    res.render("client/pages/user/register.pug", {
        pageTitle: "Đăng ký tài khoản"
    });
};
exports.register = register;
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: (0, md5_1.default)(req.body.password)
        };
        const existEmail = yield user_model_1.default.findOne({
            email: dataUser.email,
            deleted: false
        });
        if (existEmail) {
            req.flash("error", "Email đã được đăng ký!");
            res.redirect("back");
            return;
        }
        const newUser = new user_model_1.default(dataUser);
        console.log(newUser);
        yield newUser.save();
        const otp = generateHelper.generateRandomNumber(8);
        const objectVerifyUser = {
            email: dataUser.email,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        };
        const newVerifyUser = new verify_user_model_1.default(objectVerifyUser);
        console.log(newVerifyUser);
        yield newVerifyUser.save();
        const subject = `Mã xác thực OTP kích hoạt tài khoản`;
        const html = `
            Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
        `;
        sendMailHelper.sendMail(dataUser.email.toString(), subject, html);
        res.redirect(`/user/verifyUser?email=${dataUser.email}`);
    }
    catch (error) {
        req.flash("error", "Có lỗi xảy ra");
        res.redirect("back");
    }
});
exports.registerPost = registerPost;
const verifyUser = (req, res) => {
    const email = req.query.email.toString();
    res.render("client/pages/user/verify-user", {
        pageTitle: "Xác thực tài khoản",
        email: email
    });
};
exports.verifyUser = verifyUser;
const verifyUserPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectVerifyUser = {
            email: req.body.email,
            otp: req.body.otp
        };
        const checkUserOtp = yield verify_user_model_1.default.findOne({
            email: objectVerifyUser.email,
            otp: objectVerifyUser.otp
        });
        if (!checkUserOtp) {
            req.flash("error", "OTP không hợp lệ!");
            res.redirect("back");
            return;
        }
        yield user_model_1.default.updateOne({
            email: checkUserOtp.email
        }, {
            status: "active"
        });
        req.flash("success", "Xác thực thành công. Đăng nhập để tiếp tục!");
        res.redirect("/user/login");
    }
    catch (error) {
        res.status(4040).json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
});
exports.verifyUserPost = verifyUserPost;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/user/login.pug", {
        pageTitle: "Đăng nhập tài khoản"
    });
});
exports.login = login;
