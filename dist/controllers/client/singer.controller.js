"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = exports.detail = void 0;
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const pagination_client_1 = __importDefault(require("../../helpers/pagination-client"));
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const singer = yield singer_model_1.default.findOne({
            slug: slug,
            deleted: false
        }).select("-updatedBy -position -deleted");
        if (!singer) {
            res.redirect("back");
            return;
        }
        const singerId = singer.id;
        const songs = yield song_model_1.default.find({
            singerId: singerId,
            status: "active",
            deleted: false
        });
        res.render("client/pages/singers/detail.pug", {
            pageTitle: singer.fullName,
            songs: songs,
            singer: singer
        });
    }
    catch (error) {
        res.redirect("back");
    }
});
exports.detail = detail;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let sort = {
        position: "desc"
    };
    const countDocuments = yield singer_model_1.default.countDocuments({
        deleted: false,
        status: "active"
    });
    const objectPagination = (0, pagination_client_1.default)(req.query, res, countDocuments, "/singers", 6);
    if (!objectPagination)
        return;
    const singers = yield singer_model_1.default.find({
        deleted: false,
        status: "active"
    })
        .select("fullName nationality avatar slug")
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
    res.render("client/pages/singers/index", {
        pageTitle: "Danh sách ca sĩ",
        singers: singers,
        pagination: objectPagination
    });
});
exports.index = index;
