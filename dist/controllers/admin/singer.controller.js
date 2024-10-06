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
exports.detail = exports.editPatch = exports.edit = exports.changeMulti = exports.createPost = exports.create = exports.deleteItem = exports.changeStatus = exports.index = void 0;
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const search_1 = __importDefault(require("../../helpers/search"));
const pagination_1 = __importDefault(require("../../helpers/pagination"));
const system_1 = require("../../config/system");
const account_model_1 = __importDefault(require("../../models/account.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const filterStatus = (0, filterStatus_1.default)(req.query);
    const objectSearch = (0, search_1.default)(req.query);
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"];
    }
    const countDocuments = yield singer_model_1.default.countDocuments({
        deleted: false
    });
    const objectPagination = (0, pagination_1.default)(req.query, res, countDocuments, "singers");
    let sort = {
        position: "desc"
    };
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        const sortValue = req.query.sortValue.toString();
        sort[sortKey] = sortValue;
    }
    const singers = yield singer_model_1.default
        .find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort(sort);
    for (const item of singers) {
        if (item.createdBy.accountId != "") {
            const infoAccountCreate = yield account_model_1.default.findOne({
                _id: item.createdBy.accountId
            }).select("fullName");
            item["infoAccountCreate"] = infoAccountCreate;
        }
        if (item.updatedBy.length > 0) {
            const lastLog = item.updatedBy[item.updatedBy.length - 1];
            const infoAccountUpdate = yield account_model_1.default.findOne({
                _id: lastLog.accountId
            }).select("fullName");
            item["updatedAt"] = lastLog.updatedAt;
            item["infoAccountUpdate"] = infoAccountUpdate;
        }
    }
    res.render("admin/pages/singers/index", {
        pageTitle: "Danh sách ca sĩ",
        filterStatus: filterStatus,
        singers: singers,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const status = req.params.status;
        const existSinger = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSinger) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!"
            });
            return;
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        };
        yield singer_model_1.default.updateOne({
            _id: id
        }, {
            status: status,
            $push: {
                updatedBy: updatedBy
            }
        });
        res.status(200).json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            status: status
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existSinger = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSinger) {
            res.json({
                code: 404,
                message: "Không tồn tại ca sĩ!"
            });
            return;
        }
        yield singer_model_1.default.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
        });
        res.json({
            code: 200,
            message: "Đã xóa thành công"
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.deleteItem = deleteItem;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countSinger = yield singer_model_1.default.countDocuments({
        deleted: false
    });
    res.render("admin/pages/singers/create.pug", {
        pageTitle: "Tạo mới ca sĩ",
        countSinger: countSinger
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dataSinger = {
        fullName: req.body.fullName,
        avatar: req.body.avatar,
        description: req.body.description,
        position: parseInt(req.body.position),
        status: req.body.status,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date()
        }
    };
    const newSinger = new singer_model_1.default(dataSinger);
    yield newSinger.save();
    req.flash("success", "Tạo thành công ca sĩ!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
});
exports.createPost = createPost;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        };
        const deletedBy = {
            accountId: res.locals.user.id,
            deletedAt: new Date()
        };
        const type = req.body.type;
        const ids = req.body.ids.split(", ");
        switch (type) {
            case "active":
                yield singer_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "active",
                    $push: {
                        updatedBy: updatedBy
                    }
                });
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
                break;
            case "inactive":
                yield singer_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "inactive",
                    $push: {
                        updatedBy: updatedBy
                    }
                });
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
                break;
            case "delete-all":
                yield singer_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    deleted: true,
                    deletedBy: deletedBy
                });
                req.flash("success", `Đã xóa ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
                break;
            case "change-position":
                for (const item of ids) {
                    const arr = item.split("-");
                    const id = arr[0];
                    const pos = parseInt(arr[1]);
                    yield singer_model_1.default.updateOne({
                        _id: id
                    }, {
                        position: pos,
                        $push: {
                            updatedBy: updatedBy
                        }
                    });
                }
                req.flash("success", `Đã cập nhật vị trí cho ${ids.length} bản ghi`);
                res.redirect("back");
                break;
            default:
                res.json({
                    code: 400,
                    message: "Có lỗi xảy ra!"
                });
                break;
        }
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
});
exports.changeMulti = changeMulti;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existSinger = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSinger) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
            return;
        }
        const singer = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/singers/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            singer: singer
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existSinger = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSinger) {
            res.json({
                code: 404,
                message: "Ca sĩ không tồn tại!"
            });
            return;
        }
        const dataSinger = {
            fullName: req.body.fullName,
            position: parseInt(req.body.position),
            status: req.body.status
        };
        if (req.body.avatar) {
            dataSinger.avatar = req.body.avatar;
        }
        if (req.body.description) {
            dataSinger.description = req.body.description;
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        };
        yield singer_model_1.default.updateOne({
            _id: id
        }, {
            $set: dataSinger,
            $push: {
                updatedBy: updatedBy
            }
        });
        req.flash("success", "Cập nhật thành công ca sĩ!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
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
        const id = req.params.id;
        const existSinger = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existSinger) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
            return;
        }
        const singer = yield singer_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/singers/detail.pug", {
            pageTitle: "Chi tiết ca sĩ",
            singer: singer
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.detail = detail;
