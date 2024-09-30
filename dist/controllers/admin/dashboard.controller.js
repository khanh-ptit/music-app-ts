"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan"
    });
};
exports.index = index;
