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
exports.listen = exports.favorite = exports.like = exports.detail = exports.list = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const favorite_song_model_1 = __importDefault(require("../../models/favorite-song.model"));
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield topic_model_1.default.findOne({
            slug: req.params.slugTopic,
            status: "active",
            deleted: false
        });
        const topicId = topic.id;
        const songs = yield song_model_1.default.find({
            topicId: topicId,
            status: "active",
            deleted: false
        }).select("avatar title slug singerId like");
        for (const item of songs) {
            const singerInfo = yield singer_model_1.default.findOne({
                _id: item.singerId
            });
            item["singerInfo"] = singerInfo;
        }
        res.render("client/pages/songs/list", {
            pageTitle: topic.title,
            songs: songs
        });
    }
    catch (error) {
        res.render("client/pages/error/404", {
            pageTitle: "404 Not Found"
        });
    }
});
exports.list = list;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const song = yield song_model_1.default.findOne({
            slug: slug,
            status: "active",
            deleted: false
        });
        const singerInfo = yield singer_model_1.default.findOne({
            _id: song.singerId,
            deleted: false,
            status: "active"
        }).select("fullName");
        song["singerInfo"] = singerInfo;
        const topicInfo = yield topic_model_1.default.findOne({
            _id: song.topicId,
            deleted: false
        });
        const isFavorite = yield favorite_song_model_1.default.findOne({
            songId: song.id
        });
        song["isFavorite"] = (isFavorite != null) ? true : false;
        song["topicInfo"] = topicInfo;
        res.render("client/pages/songs/detail.pug", {
            pageTitle: `${song.title} | ${singerInfo.fullName}`,
            song: song
        });
    }
    catch (error) {
        res.render("client/pages/error/404", {
            pageTitle: "404 Not Found"
        });
    }
});
exports.detail = detail;
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.idSong;
        const typeLike = req.params.typeLike;
        const song = yield song_model_1.default.findOne({
            _id: id,
            deleted: false,
            status: "active"
        });
        let newLike;
        if (typeLike == "like") {
            newLike = song.like + 1;
        }
        else {
            newLike = song.like - 1;
        }
        yield song_model_1.default.updateOne({
            _id: id
        }, {
            like: newLike
        });
        res.json({
            code: 200,
            message: "Đã thích bài hát!",
            like: newLike
        });
    }
    catch (_a) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect("back");
    }
});
exports.like = like;
const favorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idSong = req.params.idSong;
    const typeFavorite = req.params.typeFavorite;
    switch (typeFavorite) {
        case "favorite":
            const existFavoriteSong = yield favorite_song_model_1.default.findOne({
                songId: idSong
            });
            if (!existFavoriteSong) {
                const newFavoriteSong = new favorite_song_model_1.default({
                    songId: idSong
                });
                yield newFavoriteSong.save();
            }
            break;
        case "unfavorite":
            yield favorite_song_model_1.default.deleteOne({
                songId: idSong
            });
            break;
        default:
            break;
    }
    res.json({
        code: 200,
        message: "Đã thêm vào danh sách yêu thích"
    });
});
exports.favorite = favorite;
const listen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.idSong;
    const song = yield song_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    if (song) {
        let countListen = song.listen + 1;
        yield song_model_1.default.updateOne({
            _id: id,
            deleted: false
        }, {
            listen: countListen
        });
        const updatedSong = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.json({
            code: 200,
            listen: updatedSong.listen
        });
    }
});
exports.listen = listen;
