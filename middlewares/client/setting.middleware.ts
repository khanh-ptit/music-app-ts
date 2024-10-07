import { Request, Response, NextFunction } from "express";
import SettingGeneral from "../../models/setting-general.model";

export const settingGeneral = async (req: Request, res: Response, next: NextFunction) => {
    const settingGeneral = await SettingGeneral.findOne({})
    // console.log(settingGeneral)
    res.locals.settingGeneral = settingGeneral
    next()
}