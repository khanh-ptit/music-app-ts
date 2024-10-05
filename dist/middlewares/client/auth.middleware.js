"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthApi = exports.requireAuth = void 0;
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
const requireAuthApi = (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;
    if (!tokenUser) {
        console.log("*");
        res.json({
            code: 403,
            message: "Bạn cần đăng nhập để thực hiện quyền này!"
        });
        return;
    }
    next();
};
exports.requireAuthApi = requireAuthApi;
