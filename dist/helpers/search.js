"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slugify_1 = __importDefault(require("slugify"));
exports.default = (query) => {
    const objectSearch = {
        keyword: ""
    };
    if (query.keyword) {
        objectSearch.keyword = query.keyword.toString();
        const slug = (0, slugify_1.default)(query.keyword.toString(), {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });
        const regex = new RegExp(slug, "i");
        objectSearch["regex"] = regex;
    }
    return objectSearch;
};
