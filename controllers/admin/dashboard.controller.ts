import { Request, Response } from "express";

// [GET] /admin/dashboard
export const index = (req: Request, res: Response) => {
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan"
    })
}