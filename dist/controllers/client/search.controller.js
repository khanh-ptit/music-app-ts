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
exports.result = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const slugify_1 = __importDefault(require("slugify"));
const result = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.params.type;
    const keyword = req.query.keyword.toString();
    let find = {
        deleted: false
    };
    let newSongs = [];
    if (keyword) {
        const slug = (0, slugify_1.default)(keyword, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });
        const regex = new RegExp(slug, "i");
        find["slug"] = regex;
    }
    const songs = yield song_model_1.default.find(find);
    for (const item of songs) {
        const singerInfo = yield singer_model_1.default.findOne({
            _id: item.singerId,
            deleted: false
        });
        item["singerInfo"] = singerInfo;
        newSongs.push({
            id: item.id,
            title: item.title,
            avatar: item.avatar,
            like: item.like,
            slug: item.slug,
            singerInfo: {
                fullName: singerInfo.fullName
            }
        });
    }
    switch (type) {
        case "result":
            res.render("client/pages/search/result", {
                pageTitle: `Kết quả: ${keyword}`,
                keyword: keyword,
                songs: songs
            });
            break;
        case "suggest":
            res.json({
                code: 200,
                message: "Thành công!",
                songs: newSongs
            });
            break;
        default:
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
            break;
    }
});
exports.result = result;
