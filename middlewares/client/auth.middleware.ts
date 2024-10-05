import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.cookies.tokenUser
    if (!tokenUser) {
        req.flash("error", "Vui lòng đăng nhập trước!")
        res.redirect("/user/login")
        return
    }
    
    next()
}