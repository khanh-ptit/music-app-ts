import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";

export const setUser = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.cookies.tokenUser
    if (req.cookies.tokenUser) {
        const user = await User.findOne({
            tokenUser: tokenUser,
            deleted: false
        }).select("-password")
        if (user) {
            res.locals.user = user
        }
    }
    
    next()
}