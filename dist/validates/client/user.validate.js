"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetPost = exports.loginPost = exports.registerPost = void 0;
const registerPost = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ và tên!");
        res.redirect("back");
        return;
    }
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        res.redirect("back");
        return;
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }
    if (!req.body.confirm_password) {
        req.flash("error", "Vui lòng xác nhận mật khẩu!");
        res.redirect("back");
        return;
    }
    if (req.body.confirm_password != req.body.password) {
        req.flash("error", "Mật khẩu không trùng khớp!");
        res.redirect("back");
        return;
    }
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!");
        res.redirect("back");
        return;
    }
    next();
};
exports.registerPost = registerPost;
const loginPost = (req, res, next) => {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone) {
        req.flash("error", "Vui lòng nhập Email hoặc Số điện thoại!");
        res.redirect("back");
        return;
    }
    if (!password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const isPhone = /^\d{9,15}$/.test(emailOrPhone);
    if (!isEmail && !isPhone) {
        req.flash("error", "Vui lòng nhập Email hoặc Số điện thoại hợp lệ!");
        res.redirect("back");
        return;
    }
    next();
};
exports.loginPost = loginPost;
const passwordResetPost = (req, res, next) => {
    const { password, confirm_password } = req.body;
    if (!password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }
    if (!confirm_password) {
        req.flash("error", "Vui lòng nhập xác nhận mật khẩu!");
        res.redirect("back");
        return;
    }
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!");
        res.redirect("back");
        return;
    }
    if (password !== confirm_password) {
        req.flash("error", "Mật khẩu và xác nhận mật khẩu không trùng khớp!");
        res.redirect("back");
        return;
    }
    next();
};
exports.passwordResetPost = passwordResetPost;
