import { Request, Response, NextFunction } from "express";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ và tên!")
        res.redirect("back")
        return
    }

    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!")
        res.redirect("back")
        return
    }

    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu!")
        res.redirect("back")
        return
    }

    if (!req.body.confirm_password) {
        req.flash("error", "Vui lòng xác nhận mật khẩu!")
        res.redirect("back")
        return
    }

    if (req.body.confirm_password != req.body.password) {
        req.flash("error", "Mật khẩu không trùng khớp!")
        res.redirect("back")
        return
    }
    
    // Kiểm tra mật khẩu phải có ít nhất 8 ký tự và 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!");
        res.redirect("back");
        return;
    }

    next()
}

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
    const { emailOrPhone, password } = req.body;

    // Kiểm tra trường emailOrPhone có trống không
    if (!emailOrPhone) {
        req.flash("error", "Vui lòng nhập Email hoặc Số điện thoại!");
        res.redirect("back");
        return;
    }

    // Kiểm tra trường password có trống không
    if (!password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }

    // Kiểm tra định dạng emailOrPhone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone); // Kiểm tra định dạng email
    const isPhone = /^\d{9,15}$/.test(emailOrPhone); // Kiểm tra định dạng số điện thoại (tối thiểu 9, tối đa 15 số)

    if (!isEmail && !isPhone) {
        req.flash("error", "Vui lòng nhập Email hoặc Số điện thoại hợp lệ!");
        res.redirect("back");
        return;
    }

    // Nếu tất cả đều hợp lệ, tiếp tục xử lý
    next();
}

export const passwordResetPost = (req: Request, res: Response, next: NextFunction) => {
    const { password, confirm_password } = req.body;

    // Kiểm tra trường không được để trống
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

    // Kiểm tra độ dài và ký tự đặc biệt của mật khẩu
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/; // Ít nhất 8 ký tự và 1 ký tự đặc biệt

    if (!passwordRegex.test(password)) {
        req.flash(
            "error",
            "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!"
        );
        res.redirect("back");
        return;
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu phải trùng khớp
    if (password !== confirm_password) {
        req.flash("error", "Mật khẩu và xác nhận mật khẩu không trùng khớp!");
        res.redirect("back");
        return;
    }

    // Nếu hợp lệ, tiếp tục xử lý
    next();
};