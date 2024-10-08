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
exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.deleteSong = exports.changeMulti = exports.changeStatus = exports.index = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const search_1 = __importDefault(require("../../helpers/search"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const system_1 = require("../../config/system");
const pagination_1 = __importDefault(require("../../helpers/pagination"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("song_view")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền xem danh sách bài hát"
        });
    }
    const filterStatus = (0, filterStatus_1.default)(req.query);
    let find = {
        deleted: false
    };
    let objectSort = {
        position: "desc".toLowerCase()
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const objectSearch = (0, search_1.default)(req.query);
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"];
    }
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        const sortValue = req.query.sortValue.toString();
        if (sortValue == "asc" || sortValue == "desc") {
            objectSort[sortKey] = sortValue;
        }
    }
    const countSong = yield song_model_1.default.countDocuments({
        deleted: false
    });
    const objectPagination = (0, pagination_1.default)(req.query, res, countSong, "songs");
    if (!objectPagination)
        return;
    const songs = yield song_model_1.default
        .find(find)
        .sort(objectSort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
    for (const item of songs) {
        const infoAccountCreate = yield account_model_1.default.findOne({
            _id: item.createdBy.accountId
        }).select("fullName");
        if (infoAccountCreate) {
            item["infoAccountCreate"] = infoAccountCreate;
        }
        const lastLog = item.updatedBy[item.updatedBy.length - 1];
        if (lastLog) {
            const infoAccountUpdate = yield account_model_1.default.findOne({
                _id: lastLog.accountId
            }).select("fullName");
            if (infoAccountUpdate) {
                item["infoAccountUpdate"] = infoAccountUpdate;
                item["updatedAt"] = lastLog.updatedAt;
            }
        }
    }
    res.render("admin/pages/songs/index", {
        pageTitle: "Danh sách bài hát",
        songs: songs,
        filterStatus: filterStatus,
        keyword: objectSearch["keyword"],
        pagination: objectPagination,
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("song_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa bài hát"
            });
        }
        const status = req.params.status;
        const id = req.params.id;
        const existSong = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSong) {
            res.json({
                code: 404,
                message: "Không tồn tại bài hát!"
            });
            return;
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        };
        yield song_model_1.default.updateOne({
            _id: id
        }, {
            status: status,
            $push: {
                updatedBy: updatedBy
            }
        });
        req.flash("success", "Cập nhật trạng thái thành công!");
        res.redirect("back");
    }
    catch (error) {
        res.status(404).json({
            message: "Nghịch cái đb"
        });
    }
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = {
        accountId: res.locals.user.id,
        updatedAt: new Date()
    };
    switch (type) {
        case "active":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return;
            }
            yield song_model_1.default.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active",
                $push: {
                    updatedBy: updatedBy
                }
            });
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`);
            res.redirect("back");
            break;
        case "inactive":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return;
            }
            yield song_model_1.default.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive",
                $push: {
                    updatedBy: updatedBy
                }
            });
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`);
            res.redirect("back");
            break;
        case "delete-all":
            if (!roles.permissions.includes("song_delete")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền xóa bài hát!"
                });
                return;
            }
            yield song_model_1.default.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
                deletedBy: {
                    accountId: res.locals.user.id,
                    deletedAt: new Date()
                }
            });
            req.flash("success", `Xóa thành công ${ids.length} bài hát`);
            res.redirect("back");
            break;
        case "change-position":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return;
            }
            for (const item of ids) {
                const arr = item.split("-");
                const id = arr[0];
                const pos = parseInt(arr[1]);
                yield song_model_1.default.updateOne({
                    _id: id
                }, {
                    position: pos,
                    $push: {
                        updatedBy: updatedBy
                    }
                });
            }
            req.flash("success", `Đã cập nhật vị trí cho ${ids.length} bài hát`);
            res.redirect("back");
            break;
        default:
            req.flash("error", `Có lỗi xảy ra!`);
            res.redirect("back");
            break;
    }
});
exports.changeMulti = changeMulti;
const deleteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("song_delete")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền xóa bài hát!"
            });
            return;
        }
        const id = req.params.id;
        const existSong = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSong) {
            res.json({
                code: 404,
                message: "Không tồn tại bài hát!"
            });
            return;
        }
        yield song_model_1.default.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
        });
        req.flash("success", "Xóa thành công bài hát!");
        res.redirect("back");
    }
    catch (error) {
        res.json({
            code: 404,
            message: "Nghịch cái đb"
        });
    }
});
exports.deleteSong = deleteSong;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("song_create")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền tạo mới bài hát"
        });
        return;
    }
    const countSong = yield song_model_1.default.countDocuments({
        deleted: false
    });
    const topics = yield topic_model_1.default.find({
        deleted: false,
        status: "active"
    }).select("title");
    const singers = yield singer_model_1.default.find({
        deleted: false,
        status: "active"
    }).select("fullName");
    res.render("admin/pages/songs/create", {
        pageTitle: "Thêm mới bài hát",
        topics: topics,
        singers: singers,
        countSong: countSong
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("song_create")) {
        res.status(403).json({
            code: 403,
            message: "Bạn không có quyền tạo mới bài hát!"
        });
        return;
    }
    const countSong = yield song_model_1.default.countDocuments({
        deleted: false
    });
    let avatar = "";
    let audio = "";
    if (req.body.avatar) {
        avatar = req.body.avatar[0];
    }
    if (req.body.audio) {
        audio = req.body.audio[0];
    }
    const dataSong = {
        title: req.body.title,
        topicId: req.body.topicId,
        singerId: req.body.singerId,
        position: req.body.position,
        description: req.body.description,
        status: req.body.status,
        avatar: avatar,
        audio: audio,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date()
        }
    };
    if (req.body.position) {
        dataSong.position = parseInt(req.body.position);
    }
    else {
        dataSong.position = countSong + 1;
    }
    if (req.body.lyrics) {
        dataSong.lyrics = req.body.lyrics;
    }
    const newSong = new song_model_1.default(dataSong);
    console.log(newSong);
    yield newSong.save();
    req.flash("success", "Tạo thành công bài hát!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("song_edit")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền chỉnh sửa bài hát"
            });
            return;
        }
        const id = req.params.id;
        const song = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!song) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
            return;
        }
        const topics = yield topic_model_1.default.find({
            deleted: false,
            status: "active"
        }).select("title");
        const singers = yield singer_model_1.default.find({
            deleted: false,
            status: "active"
        }).select("fullName");
        res.render("admin/pages/songs/edit.pug", {
            pageTitle: "Chỉnh sửa bài hát",
            song: song,
            topics: topics,
            singers: singers
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("song_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa bài hát!"
            });
            return;
        }
        const id = req.params.id;
        const existTopic = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            res.json({
                code: 400,
                message: "Bài hát không tồn tại!"
            });
            return;
        }
        const dataSong = {
            title: req.body.title,
            topicId: req.body.topicId,
            singerId: req.body.singerId,
            description: req.body.description,
            status: req.body.status,
            position: parseInt(req.body.position),
            lyrics: req.body.lyrics
        };
        if (req.body.avatar) {
            dataSong.avatar = req.body.avatar[0];
        }
        if (req.body.audio) {
            dataSong.audio = req.body.audio[0];
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        };
        yield song_model_1.default.updateOne({
            _id: id
        }, {
            $set: dataSong,
            $push: {
                updatedBy: updatedBy
            }
        });
        req.flash("success", "Cập nhật thành công bài hát!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("song_view")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền xem chi tiết bài hát!"
            });
            return;
        }
        const id = req.params.id;
        const song = yield song_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!song) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
            return;
        }
        const topic = yield topic_model_1.default.findOne({
            deleted: false,
            status: "active",
            _id: song.topicId
        }).select("title");
        song["topicInfo"] = topic;
        const singer = yield singer_model_1.default.findOne({
            deleted: false,
            status: "active",
            _id: song.singerId
        }).select("fullName");
        song["singerInfo"] = singer;
        res.render("admin/pages/songs/detail.pug", {
            pageTitle: "Chi tiết bài hát",
            song: song,
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/songs`);
    }
});
exports.detail = detail;
