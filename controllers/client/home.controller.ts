import { Request, Response } from "express";

// [GET] /
export const index = (req: Request, res: Response) => {
    const settingGeneral = res.locals.settingGeneral
    res.render("client/pages/home/index.pug", {
        pageTitle: settingGeneral.websiteName
    })
}