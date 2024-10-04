import { Request, Response, NextFunction } from "express";
import { systemConfig } from "../../config/system";
import Account from "../../models/account.model";
import Role from "../../models/role.model";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token
    if (!token) {
        req.flash("error", "Bạn cần đăng nhập đã!")
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        return
    }
    const user = await Account.findOne({
        token: token,
        deleted: false
    }).select("-password")
    if (!user) {
        req.flash("error", "Chú định bịp à =)")
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        return
    }
    const roles = await Role.findOne({
        _id: user.role_id
    })
    res.locals.user = user
    res.locals.roles = roles
    next()
}