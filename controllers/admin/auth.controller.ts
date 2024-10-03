import { Request, Response } from "express";
import md5 from "md5"
import Account from "../../models/account.model";
import { systemConfig } from "../../config/system";

// [GET] /admin/auth/login
export const login = (req: Request, res: Response) => {
    res.render("admin/pages/auth/login.pug", {
        pageTitle: "Đăng nhập quản trị"
    })
}

// [POST] /admin/auth/login
export const loginPost = async (req: Request, res: Response) => {
    const email = req.body.email
    const password = md5(req.body.password)
    
    const existEmail = await Account.findOne({
        email: email,
        deleted: false
    })

    if (!existEmail) {
        req.flash("error", "Email không tồn tại!")
        res.redirect("back")
        return
    }

    const checkLogin = await Account.findOne({
        email: email,
        password: password,
        deleted: false 
    })  
    
    if (!checkLogin) {
        req.flash("error", "Email or mật khẩu không đúng!")
        res.redirect("back")
        return
    }
    
    if (checkLogin.status == "inactive") {
        req.flash("error", "Tài khoản đã bị khóa!")
        res.redirect("back")
        return
    } 
    res.cookie("token", checkLogin.token)
    req.flash("success", "Đăng nhập thành công!")
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
}

// [GET] /admin/auth/logout
export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token")
    req.flash("success", "Đăng xuất thành công!")
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
}