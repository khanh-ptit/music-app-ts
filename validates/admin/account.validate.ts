import { Request, Response, NextFunction } from "express"

export const createPost = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ tên!")
        res.redirect("back")
        return
    }
    
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu!")
        res.redirect("back")
        return
    }

    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!")
        res.redirect("back")
        return
    }

    if (!req.body.phone) {
        req.flash("error", "Vui lòng nhập số điện thoại!")
        res.redirect("back")
        return
    }

    if (!req.body.avatar) {
        req.flash("error", "Vui lòng upload ảnh!")
        res.redirect("back")
        return
    }

    if (!req.body.avatar) {
        req.flash("error", "Vui lòng upload ảnh!")
        res.redirect("back")
        return
    }

    if (!req.body.role_id) {
        req.flash("error", "Vui lòng chọn nhóm quyền!")
        res.redirect("back")
        return
    }
    next()
}

export const editPatch = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ tên!")
        res.redirect("back")
        return
    }

    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!")
        res.redirect("back")
        return
    }

    if (!req.body.phone) {
        req.flash("error", "Vui lòng nhập số điện thoại!")
        res.redirect("back")
        return
    }

    if (!req.body.avatar) {
        req.flash("error", "Vui lòng upload ảnh!")
        res.redirect("back")
        return
    }

    if (!req.body.role_id) {
        req.flash("error", "Vui lòng chọn nhóm quyền!")
        res.redirect("back")
        return
    }
    next()
}