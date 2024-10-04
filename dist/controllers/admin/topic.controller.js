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
exports.detail = exports.createPost = exports.create = exports.editPatch = exports.edit = exports.changeMulti = exports.deleteItem = exports.changeStatus = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const system_1 = require("../../config/system");
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const search_1 = __importDefault(require("../../helpers/search"));
const pagination_1 = __importDefault(require("../../helpers/pagination"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("topic_view")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền xem danh sách chủ đề"
        });
        return;
    }
    const filterStatus = (0, filterStatus_1.default)(req.query);
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const objectSearch = (0, search_1.default)(req.query);
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"];
    }
    let sort = {
        position: "asc"
    };
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        const sortValue = req.query.sortValue.toString();
        sort[sortKey] = sortValue;
    }
    const countDocuments = yield topic_model_1.default.countDocuments({
        deleted: false
    });
    const objectPagination = (0, pagination_1.default)(req.query, res, countDocuments, "topics");
    if (!objectPagination)
        return;
    const topics = yield topic_model_1.default
        .find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
    res.render("admin/pages/topics/index", {
        pageTitle: "Danh sách chủ đề",
        topics: topics,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("topic_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa chủ đề!"
            });
            return;
        }
        const id = req.params.id;
        const status = req.params.status;
        const existTopic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            });
            return;
        }
        yield topic_model_1.default.updateOne({
            _id: id
        }, {
            status: status
        });
        req.flash("success", "Cập nhật thành công trạng thái!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (_a) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("topic_delete")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền xóa chủ đề!"
            });
            return;
        }
        const id = req.params.id;
        const existTopic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            });
            return;
        }
        yield topic_model_1.default.updateOne({
            _id: id
        }, {
            deleted: true
        });
        req.flash("success", "Xóa thành công chủ đề!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.deleteItem = deleteItem;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        const type = req.body.type;
        const ids = req.body.ids.split(", ");
        switch (type) {
            case "active":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return;
                }
                yield topic_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "active"
                });
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
                break;
            case "inactive":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return;
                }
                yield topic_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "inactive"
                });
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
                break;
            case "delete-all":
                if (!roles.permissions.includes("topic_delete")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return;
                }
                yield topic_model_1.default.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    deleted: true
                });
                req.flash("success", `Đã xóa ${ids.length} bản ghi`);
                res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
                break;
            case "change-position":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return;
                }
                for (const item of ids) {
                    const arr = item.split("-");
                    const id = arr[0];
                    const pos = parseInt(arr[1]);
                    yield topic_model_1.default.updateOne({
                        _id: id
                    }, {
                        position: pos
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
        const roles = res.locals.roles;
        if (!roles.permissions.includes("topic_edit")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền chỉnh sửa chủ đề"
            });
            return;
        }
        const id = req.params.id;
        const existTopic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
            return;
        }
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/topics/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            topic: topic
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("topic_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa chủ đề!"
            });
            return;
        }
        const id = req.params.id;
        const existTopic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            });
            return;
        }
        const dataTopic = {
            title: req.body.title,
            position: parseInt(req.body.position),
            status: req.body.status
        };
        if (req.body.avatar) {
            dataTopic.avatar = req.body.avatar;
        }
        if (req.body.description) {
            dataTopic.description = req.body.description;
        }
        yield topic_model_1.default.updateOne({
            _id: id
        }, dataTopic);
        req.flash("success", "Cập nhật thành công chủ đề!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.editPatch = editPatch;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("topic_create")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền tạo mới chủ đề"
        });
        return;
    }
    const countTopic = yield topic_model_1.default.countDocuments({
        deleted: false
    });
    res.render("admin/pages/topics/create.pug", {
        pageTitle: "Thêm mới danh mục",
        countTopic: countTopic
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = res.locals.roles;
    if (!roles.permissions.includes("topic_create")) {
        res.status(403).json({
            code: 403,
            message: "Bạn không có quyền thực hiện thao tác này!"
        });
        return;
    }
    const dataTopic = {
        title: req.body.title,
        avatar: req.body.avatar,
        description: req.body.description,
        position: parseInt(req.body.position),
        status: req.body.status
    };
    const newTopic = new topic_model_1.default(dataTopic);
    yield newTopic.save();
    req.flash("success", "Tạo thành công chủ đề!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
});
exports.createPost = createPost;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = res.locals.roles;
        if (!roles.permissions.includes("topic_view")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền xem chủ đề này"
            });
            return;
        }
        const id = req.params.id;
        const existTopic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existTopic) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
            return;
        }
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/topics/detail.pug", {
            pageTitle: "Chi tiết chủ đề",
            topic: topic
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.detail = detail;
