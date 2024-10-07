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
exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settingGeneral = res.locals.settingGeneral;
    let find = {
        deleted: false
    };
    let sort = {
        position: "desc"
    };
    const topics = yield topic_model_1.default
        .find(find)
        .sort(sort)
        .limit(3)
        .select("-status -position");
    const newSongs = yield song_model_1.default
        .find(find)
        .sort(sort)
        .limit(4);
    for (const item of newSongs) {
        const infoSinger = yield singer_model_1.default.findOne({
            _id: item.singerId
        });
        item["infoSinger"] = infoSinger;
    }
    res.render("client/pages/home/index.pug", {
        pageTitle: settingGeneral.websiteName,
        topics: topics,
        newSongs: newSongs
    });
});
exports.index = index;
