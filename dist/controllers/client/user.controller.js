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
exports.editPatch = exports.updateAvatar = exports.edit = exports.info = exports.passwordResetPost = exports.passwordReset = exports.passwordOtpPost = exports.passwordOtp = exports.passwordForgotPost = exports.passwordForgot = exports.verifyEmailPost = exports.verifyEmail = exports.logout = exports.loginPost = exports.login = exports.verifyUserPost = exports.verifyUser = exports.registerPost = exports.register = void 0;
const md5_1 = __importDefault(require("md5"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const verify_user_model_1 = __importDefault(require("../../models/verify-user.model"));
const generateHelper = __importStar(require("../../helpers/generate"));
const sendMailHelper = __importStar(require("../../helpers/sendMail"));
const forgot_password_model_1 = __importDefault(require("../../models/forgot-password.model"));
const register = (req, res) => {
    const token = req.cookies.tokenUser;
    if (token) {
        res.redirect("/");
        return;
    }
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
            password: (0, md5_1.default)(req.body.password),
            createdAt: new Date()
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
        yield newUser.save();
        const otp = generateHelper.generateRandomNumber(8);
        const objectVerifyUser = {
            email: dataUser.email,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        };
        const newVerifyUser = new verify_user_model_1.default(objectVerifyUser);
        yield newVerifyUser.save();
        const subject = `Mã xác thực OTP kích hoạt tài khoản`;
        const html = `
            Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
        `;
        sendMailHelper.sendMail(dataUser.email.toString(), subject, html);
        res.redirect(`/user/verify-user?email=${dataUser.email}`);
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
    try {
        const token = req.cookies.tokenUser;
        if (token) {
            res.redirect("/");
            return;
        }
        res.render("client/pages/user/login.pug", {
            pageTitle: "Đăng nhập tài khoản"
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.login = login;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataLogin = {
            email: req.body.email,
            password: (0, md5_1.default)(req.body.password)
        };
        const user = yield user_model_1.default.findOne({
            email: dataLogin.email,
            deleted: false
        });
        if (!user) {
            req.flash("error", "Email không tồn tại trong hệ thống!");
            res.redirect("back");
            return;
        }
        if (user.status == "initial") {
            req.flash("error", "Vui lòng xác thực tài khoản trước khi đăng nhập!");
            res.redirect("back");
            return;
        }
        if (user.status == "inactive") {
            req.flash("error", "Tài khoản đã bị vô hiệu hóa!");
            res.redirect("back");
            return;
        }
        if (dataLogin.password != user.password) {
            req.flash("error", "Email hoặc mật khẩu không đúng!");
            res.redirect("back");
            return;
        }
        res.cookie("tokenUser", user.tokenUser);
        req.flash("success", "Đăng nhập thành công!");
        res.locals.user = user;
        res.redirect("/");
    }
    catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
});
exports.loginPost = loginPost;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("tokenUser");
    res.redirect("/user/login");
});
exports.logout = logout;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/user/verify-email", {
        pageTitle: "Xác thực email"
    });
});
exports.verifyEmail = verifyEmail;
const verifyEmailPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false
    });
    if (!user) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }
    if (user.status == "active") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!");
        res.redirect("back");
        return;
    }
    if (user.status == "inactive") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!");
        res.redirect("back");
        return;
    }
    const otp = generateHelper.generateRandomNumber(8);
    const objectVerifyUser = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    };
    const newVerifyUser = new verify_user_model_1.default(objectVerifyUser);
    yield newVerifyUser.save();
    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
    `;
    sendMailHelper.sendMail(email.toString(), subject, html);
    res.redirect(`/user/verify-user?email=${email}`);
});
exports.verifyEmailPost = verifyEmailPost;
const passwordForgot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/user/password-forgot.pug", {
        pageTitle: "Lấy lại mật khẩu"
    });
});
exports.passwordForgot = passwordForgot;
const passwordForgotPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const existEmail = yield user_model_1.default.findOne({
        email: email,
        deleted: false
    });
    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }
    const otp = generateHelper.generateRandomNumber(8);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    };
    const newForgotPassword = new forgot_password_model_1.default(objectForgotPassword);
    yield newForgotPassword.save();
    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
    `;
    sendMailHelper.sendMail(email.toString(), subject, html);
    res.redirect(`/user/password/otp?email=${email}`);
});
exports.passwordForgotPost = passwordForgotPost;
const passwordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    res.render("client/pages/user/password-otp.pug", {
        pageTitle: "Nhập mã OTP xác thực",
        email: email
    });
});
exports.passwordOtp = passwordOtp;
const passwordOtpPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const checkForgotPassword = yield forgot_password_model_1.default.findOne({
        email: email,
        otp: otp
    });
    if (!checkForgotPassword) {
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false
    });
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
});
exports.passwordOtpPost = passwordOtpPost;
const passwordReset = (req, res) => {
    res.render("client/pages/user/password-reset", {
        pageTitle: "Đặt lại mật khẩu"
    });
};
exports.passwordReset = passwordReset;
const passwordResetPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenUser = req.cookies.tokenUser;
    const password = (0, md5_1.default)(req.body.password);
    const user = yield user_model_1.default.findOne({
        tokenUser: tokenUser,
        deleted: false
    });
    if (user.password == password) {
        req.flash("error", "Mật khẩu mới không được trùng với mật khẩu cũ!");
        res.redirect("back");
        return;
    }
    yield user_model_1.default.updateOne({
        tokenUser: tokenUser
    }, {
        password: password
    });
    res.clearCookie("tokenUser");
    req.flash("success", "Đổi mật khẩu thành công. Vui lòng đăng nhập để tiếp tục");
    res.redirect("/user/login");
});
exports.passwordResetPost = passwordResetPost;
const info = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản",
        user: user
    });
});
exports.info = info;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/user/edit", {
        pageTitle: "Chỉnh sửa tài khoản"
    });
});
exports.edit = edit;
const updateAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = res.locals.user.id;
        console.log(id);
        console.log(req.body);
        yield user_model_1.default.updateOne({
            _id: id
        }, {
            avatar: req.body.avatar
        });
        res.redirect("back");
    }
    catch (error) {
        res.redirect("back");
    }
});
exports.updateAvatar = updateAvatar;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = res.locals.user.id;
        yield user_model_1.default.updateOne({
            _id: id
        }, req.body);
        res.redirect("back");
    }
    catch (error) {
        res.redirect("back");
    }
});
exports.editPatch = editPatch;
