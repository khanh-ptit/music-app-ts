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
    console.log(req.body);

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

    const ensureHttps = (url: string): string => {
        if (url.startsWith("http://")) {
            return url.replace("http://", "https://");
        }
        return url;
    };

    const dataSettingGeneral: ObjectSettingGeneral = {
        websiteName: req.body.websiteName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        copyright: req.body.copyright,
        facebook: ensureHttps(req.body.facebook),
        tiktok: ensureHttps(req.body.tiktok),
        twitter: ensureHttps(req.body.twitter),
        maps: ensureHttps(req.body.maps)
    };

    if (req.body.favicon) {
        dataSettingGeneral.favicon = ensureHttps(req.body.favicon[0]);
    }

    if (req.body.logo) {
        dataSettingGeneral.logo = ensureHttps(req.body.logo[0]);
    }

    await SettingGeneral.updateOne({
        _id: "67026270a95afb66c54704d5"
    }, dataSettingGeneral);

    req.flash("success", "Cập nhật thành công!");
    res.redirect("back");
};
