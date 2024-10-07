"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    const settingGeneral = res.locals.settingGeneral;
    res.render("client/pages/home/index.pug", {
        pageTitle: settingGeneral.websiteName
    });
};
exports.index = index;
