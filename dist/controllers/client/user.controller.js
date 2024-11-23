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
exports.editPatch = exports.updateAvatar = exports.edit = exports.info = exports.passwordResetPost = exports.passwordReset = exports.passwordOtpPost = exports.passwordOtpPhonePost = exports.passwordOtpPhone = exports.passwordOtp = exports.passwordForgotPhonePost = exports.passwordForgotPhone = exports.passwordForgotPost = exports.passwordForgot = exports.verifyEmailPost = exports.verifyEmail = exports.logout = exports.verifyLoginPost = exports.verifyLogin = exports.loginPost = exports.login = exports.verifyUserPost = exports.verifyUser = exports.registerPost = exports.register = void 0;
const md5_1 = __importDefault(require("md5"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const verify_user_model_1 = __importDefault(require("../../models/verify-user.model"));
const generateHelper = __importStar(require("../../helpers/generate"));
const sendMailHelper = __importStar(require("../../helpers/sendMail"));
const textflow_js_1 = __importDefault(require("textflow.js"));
const forgot_password_model_1 = __importDefault(require("../../models/forgot-password.model"));
const node_cron_1 = __importDefault(require("node-cron"));
const verify_login_model_1 = __importDefault(require("../../models/verify-login.model"));
textflow_js_1.default.useKey("Ef42D9XEN1OEm1YfrKnAfoLIBzYa9nGYEDOWjJgo6NDI9tkG3EpSNK71HtCyrWM0");
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
            createdAt: new Date(),
            phone: req.body.phone
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
        const existPhone = yield user_model_1.default.findOne({
            phone: dataUser.phone,
            deleted: false
        });
        if (existPhone) {
            req.flash("error", "Số điện thoại đã được đăng ký!");
            res.redirect("back");
            return;
        }
        const newUser = new user_model_1.default(dataUser);
        yield newUser.save();
        const otp = generateHelper.generateRandomNumber(6);
        const objectVerifyUser = {
            email: dataUser.email,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        };
        const newVerifyUser = new verify_user_model_1.default(objectVerifyUser);
        yield newVerifyUser.save();
        const subject = `Mã xác thực OTP kích hoạt tài khoản`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                    Kích Hoạt Tài Khoản
                </div>
                <div style="padding: 20px; line-height: 1.6;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #555;">
                        <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                    </p>
                    <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                    <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
                </div>
                <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                    Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
                </div>
            </div>
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
            identifier: req.body.emailOrPhone,
            password: (0, md5_1.default)(req.body.password),
        };
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataLogin.identifier);
        const query = isEmail
            ? { email: dataLogin.identifier, deleted: false }
            : { phone: dataLogin.identifier, deleted: false };
        const user = yield user_model_1.default.findOne(query);
        if (!user) {
            req.flash("error", isEmail ? "Email không tồn tại trong hệ thống!" : "Số điện thoại không tồn tại trong hệ thống!");
            res.redirect("back");
            return;
        }
        if (user.status === "inactive") {
            if (user.lockedUntil && user.lockedUntil <= new Date()) {
                yield user_model_1.default.updateOne({ _id: user._id }, {
                    $set: { status: "active", lockedUntil: null, lockedBy: null }
                });
            }
            else {
                req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
                res.redirect("back");
                return;
            }
        }
        if (user.status == "initial") {
            req.flash("error", "Tài khoản của bạn chưa được kích hoạt. Vui lòng kích hoạt trước !");
            res.redirect("back");
            return;
        }
        const recentVerifications = yield verify_login_model_1.default.find({
            email: isEmail ? dataLogin.identifier : null,
            phone: !isEmail ? dataLogin.identifier : null,
            expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) }
        });
        if (recentVerifications.length >= 3) {
            user.status = "inactive";
            user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
            user.lockedBy = "passwordForgotPost";
            yield user.save();
            req.flash("error", "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.");
            res.redirect("back");
            return;
        }
        if (dataLogin.password != user.password) {
            req.flash("error", "Thông tin đăng nhập không chính xác!");
            res.redirect("back");
            return;
        }
        const secretKey = process.env.SECRET_KEY_HOTP;
        const counter = Math.floor(Date.now() / 1000);
        const otp = generateHelper.generateHOTP(secretKey, counter, 6);
        const objectVerifyLogin = {
            email: isEmail ? dataLogin.identifier : null,
            phone: !isEmail ? dataLogin.identifier : null,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        };
        const newVerifyLogin = new verify_login_model_1.default(objectVerifyLogin);
        yield newVerifyLogin.save();
        if (isEmail) {
            const subject = `Mã xác thực OTP đăng nhập tài khoản`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                        OTP đăng nhập tài khoản
                    </div>
                    <div style="padding: 20px; line-height: 1.6;">
                        <p style="font-size: 16px; color: #333;">Xin chào,</p>
                        <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #555;">
                            <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                        </p>
                        <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                        <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
                    </div>
                    <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                        Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
                    </div>
                </div>
            `;
            sendMailHelper.sendMail(dataLogin.identifier, subject, html);
        }
        else {
            const message = `Mã OTP đăng nhập của bạn là: ${otp}. Mã OTP này có hiệu lực trong 3 phút.`;
            const phone = dataLogin.identifier;
            const formattedPhone = phone.startsWith('0') ? '+84' + phone.slice(1) : '+84' + phone;
            console.log(formattedPhone, message);
            yield textflow_js_1.default.sendSMS(formattedPhone, message);
        }
        res.redirect(`/user/verify-login?identifier=${dataLogin.identifier}`);
    }
    catch (error) {
        console.error("Lỗi đăng nhập:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
});
exports.loginPost = loginPost;
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier } = req.query;
    if (!identifier) {
        req.flash("error", "Thiếu thông tin đăng nhập.");
        return res.redirect("back");
    }
    res.render("client/pages/user/verify-login.pug", {
        pageTitle: "Xác thực OTP",
        emailOrPhone: identifier
    });
});
exports.verifyLogin = verifyLogin;
const verifyLoginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrPhone, otp } = req.body;
    try {
        const latestVerifyRecord = yield verify_login_model_1.default.findOne({
            $or: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ],
            expireAt: { $gte: new Date() }
        }).sort({ createdAt: -1 });
        if (!latestVerifyRecord || latestVerifyRecord.otp !== otp) {
            req.flash("error", "Mã OTP không hợp lệ hoặc đã hết hạn.");
            return res.redirect("back");
        }
        const user = yield user_model_1.default.findOne({
            $or: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ],
            deleted: false
        });
        if (!user) {
            req.flash("error", "Người dùng không tồn tại.");
            return res.redirect("back");
        }
        res.cookie("tokenUser", user.tokenUser);
        req.flash("success", "Đăng nhập thành công!");
        res.locals.user = user;
        res.redirect("/");
    }
    catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        req.flash("error", "Có lỗi xảy ra trong quá trình xác thực.");
        res.redirect("back");
    }
});
exports.verifyLoginPost = verifyLoginPost;
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
    if (user.status === "active") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!");
        res.redirect("back");
        return;
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        req.flash("error", "Tài khoản của bạn đang bị khóa. Vui lòng thử lại sau.");
        res.redirect("back");
        return;
    }
    const recentVerifications = yield verify_user_model_1.default.find({
        email: email,
        expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) }
    });
    if (recentVerifications.length >= 3) {
        user.status = "inactive";
        user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
        user.lockedBy = "verifyEmailPost";
        yield user.save();
        req.flash("error", "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.");
        res.redirect("back");
        return;
    }
    const secretKey = process.env.SECRET_KEY_HOTP;
    const counter = Math.floor(Date.now() / 1000);
    const otp = generateHelper.generateHOTP(secretKey, counter, 6);
    const objectVerifyUser = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    };
    const newVerifyUser = new verify_user_model_1.default(objectVerifyUser);
    yield newVerifyUser.save();
    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Kích Hoạt Tài Khoản
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
            </div>
            <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
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
    const existEmail = yield user_model_1.default.findOne({ email: email, deleted: false });
    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }
    if (existEmail.status === "inactive") {
        if (existEmail.lockedUntil && existEmail.lockedUntil <= new Date()) {
            yield user_model_1.default.updateOne({ email: email }, {
                $set: { status: "active", lockedUntil: null, lockedBy: null }
            });
        }
        else {
            req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
            res.redirect("back");
            return;
        }
    }
    const otpRecordsCount = yield forgot_password_model_1.default.countDocuments({
        email: email,
        expireAt: { $gt: new Date() },
    });
    if (otpRecordsCount >= 3) {
        const unlockTime = new Date(Date.now() + 3 * 60 * 1000);
        yield user_model_1.default.updateOne({ email: email }, {
            $set: { status: "inactive", lockedUntil: unlockTime, lockedBy: "passwordForgotPost" }
        });
        req.flash("error", "Quá số lần gửi OTP. Tài khoản của bạn đã bị khóa tạm thời trong 3 phút.");
        res.redirect("back");
        return;
    }
    const secretKey = process.env.SECRET_KEY_TOTP;
    const otp = generateHelper.generateTOTP(secretKey, 30, 6);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 3 * 60 * 1000),
    };
    const newForgotPassword = new forgot_password_model_1.default(objectForgotPassword);
    yield newForgotPassword.save();
    const subject = `Mã xác thực OTP đặt lại mật khẩu`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
            </div>
            <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;
    sendMailHelper.sendMail(email.toString(), subject, html);
    res.redirect(`/user/password/otp?email=${email}`);
});
exports.passwordForgotPost = passwordForgotPost;
const passwordForgotPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/user/password-forgot-phone.pug", {
        pageTitle: "Lấy lại mật khẩu"
    });
});
exports.passwordForgotPhone = passwordForgotPhone;
const passwordForgotPhonePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const phone = req.body.phone;
    const existPhone = yield user_model_1.default.findOne({ phone: phone, deleted: false });
    if (!existPhone) {
        req.flash("error", "Số điện thoại không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }
    if (existPhone.status === "inactive") {
        if (existPhone.lockedUntil && existPhone.lockedUntil <= new Date()) {
            yield user_model_1.default.updateOne({ phone: phone }, {
                $set: { status: "active", lockedUntil: null, lockedBy: null }
            });
        }
        else {
            req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
            res.redirect("back");
            return;
        }
    }
    const otpRecordsCount = yield forgot_password_model_1.default.countDocuments({
        phone: phone,
        expireAt: { $gt: new Date() },
    });
    if (otpRecordsCount >= 3) {
        const unlockTime = new Date(Date.now() + 3 * 60 * 1000);
        yield user_model_1.default.updateOne({ phone: phone }, {
            $set: { status: "inactive", lockedUntil: unlockTime, lockedBy: "passwordForgotPost" }
        });
        req.flash("error", "Quá số lần gửi OTP. Tài khoản của bạn đã bị khóa tạm thời trong 3 phút.");
        res.redirect("back");
        return;
    }
    const secretKey = process.env.SECRET_KEY_HOTP;
    const counter = Math.floor(Date.now() / 1000);
    const otp = generateHelper.generateHOTP(secretKey, counter, 6);
    const objectForgotPassword = {
        phone: phone,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000),
    };
    const newForgotPassword = new forgot_password_model_1.default(objectForgotPassword);
    yield newForgotPassword.save();
    try {
        const sendPhone = "+84" + phone.slice(1);
        const customMessage = `Mã OTP khôi phục mật khẩu của bạn là ${otp}. Vui lòng không chia sẻ mã này với bất kỳ ai.`;
        yield textflow_js_1.default.sendSMS(sendPhone, customMessage);
        res.redirect(`/user/password/otp-phone?phone=${phone}`);
    }
    catch (error) {
        console.error("Error sending OTP via SMS:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
        req.flash("error", "Gửi OTP thất bại. Vui lòng thử lại!");
        res.redirect("back");
    }
});
exports.passwordForgotPhonePost = passwordForgotPhonePost;
const passwordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    res.render("client/pages/user/password-otp.pug", {
        pageTitle: "Nhập mã OTP xác thực",
        email: email
    });
});
exports.passwordOtp = passwordOtp;
node_cron_1.default.schedule("*/1 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const resultForgot = yield user_model_1.default.updateMany({
        status: "inactive",
        lockedUntil: { $lte: now },
        lockedBy: "passwordForgotPost"
    }, {
        $set: { status: "active", lockedUntil: null, lockedBy: null }
    });
    if (resultForgot.modifiedCount > 0) {
        console.log(`[CRON] Đã mở khóa ${resultForgot.modifiedCount} tài khoản - API passwordForgotPost.`);
    }
    const resultVerify = yield user_model_1.default.updateMany({
        status: "inactive",
        lockedUntil: { $lte: now },
        lockedBy: "verifyEmailPost"
    }, {
        $set: { status: "initial", lockedUntil: null, lockedBy: null }
    });
    if (resultVerify.modifiedCount > 0) {
        console.log(`[CRON] Đã chuyển trạng thái ${resultVerify.modifiedCount} tài khoản về "initial" - API verifyEmailPost.`);
    }
}));
const passwordOtpPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const phone = req.query.phone;
    res.render("client/pages/user/password-otp-phone", {
        pageTitle: "Nhập mã OTP xác thực",
        phone: phone
    });
});
exports.passwordOtpPhone = passwordOtpPhone;
const passwordOtpPhonePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const phone = req.body.phone;
    const otp = req.body.otp;
    const latestOtpRecord = yield forgot_password_model_1.default.findOne({
        phone: phone,
    }).sort({ expireAt: -1 });
    if (!latestOtpRecord) {
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }
    if (latestOtpRecord.otp !== otp) {
        req.flash("error", "Mã OTP không chính xác!");
        res.redirect("back");
        return;
    }
    if (latestOtpRecord.expireAt < new Date()) {
        req.flash("error", "OTP đã hết hạn!");
        res.redirect("back");
        return;
    }
    const user = yield user_model_1.default.findOne({
        phone: phone,
        deleted: false
    });
    if (!user) {
        req.flash("error", "Người dùng không tồn tại!");
        res.redirect("back");
        return;
    }
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
});
exports.passwordOtpPhonePost = passwordOtpPhonePost;
const passwordOtpPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const latestOtpRecord = yield forgot_password_model_1.default.findOne({
        email: email,
    }).sort({ expireAt: -1 });
    if (!latestOtpRecord) {
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }
    if (latestOtpRecord.otp !== otp) {
        req.flash("error", "Mã OTP không chính xác!");
        res.redirect("back");
        return;
    }
    if (latestOtpRecord.expireAt < new Date()) {
        req.flash("error", "OTP đã hết hạn!");
        res.redirect("back");
        return;
    }
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false
    });
    if (!user) {
        req.flash("error", "Người dùng không tồn tại!");
        res.redirect("back");
        return;
    }
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
