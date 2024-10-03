"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../config/system");
exports.default = (query, res, countDocuments, prefix) => {
    let objectPagination = {
        currentPage: 1,
        skip: 0,
        limitItems: 4
    };
    objectPagination["totalPages"] = Math.ceil(parseInt(countDocuments.toString()) / objectPagination.limitItems);
    if (query.page) {
        const page = parseInt(query.page.toString());
        if (page < 1) {
            res.redirect(`${system_1.systemConfig.prefixAdmin}/${prefix}/?page=1`);
            return null;
        }
        if (page > objectPagination["totalPages"]) {
            res.redirect(`${system_1.systemConfig.prefixAdmin}/${prefix}/?page=${objectPagination["totalPages"]}`);
            return null;
        }
        objectPagination.currentPage = page;
        objectPagination.skip = (page - 1) * objectPagination.limitItems;
    }
    return objectPagination;
};
