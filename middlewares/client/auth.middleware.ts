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

export const requireAuthApi = (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.cookies.tokenUser
    if (!tokenUser) {
        res.json({
            code: 403,
            message: "Bạn cần đăng nhập để thực hiện quyền này!"
        })
        return
    }
    next()
}