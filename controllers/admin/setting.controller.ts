import { Request, Response } from "express";
import SettingGeneral from "../../models/setting-general.model";

// [GET] /admin/settings/general
export const general = async (req: Request, res: Response) => {
    const settingGeneral = await SettingGeneral.findOne()

    res.render("admin/pages/settings/general.pug", {
        pageTitle: "Cài đặt chung",
        settingGeneral: settingGeneral
    })
}

// [GET] /admin/settings/general
export const generalPatch = async (req: Request, res: Response) => {
    console.log(req.body)

    interface ObjectSettingGeneral {
        websiteName: String,
        favicon?: String,
        logo?: String,
        phone: String,
        email: String,
        address: String,
        copyright: String,
        facebook: String,
        tiktok: String,
        twitter: String,
        maps: String
    }

    const dataSettingGeneral: ObjectSettingGeneral = {
        websiteName: req.body.websiteName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        copyright: req.body.copyright,
        facebook: req.body.facebook,
        tiktok: req.body.tiktok,
        twitter: req.body.twitter,
        maps: req.body.maps
    }

    if (req.body.favicon) {
        dataSettingGeneral.favicon = req.body.favicon[0]
    }

    if (req.body.logo) {
        dataSettingGeneral.logo = req.body.logo[0]
    }

    await SettingGeneral.updateOne({
        _id: "67026270a95afb66c54704d5"
    }, dataSettingGeneral)

    req.flash("success", "Cập nhật thành công!")
    res.redirect("back")
}