"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;
    if (!tokenUser) {
        req.flash("error", "Vui lòng đăng nhập trước!");
        res.redirect("/user/login");
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
