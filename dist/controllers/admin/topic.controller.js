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
exports.createPost = exports.create = exports.editPatch = exports.edit = exports.changeMulti = exports.deleteItem = exports.changeStatus = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const system_1 = require("../../config/system");
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const search_1 = __importDefault(require("../../helpers/search"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        const sortValue = req.query.sortValue.toString();
        sort[sortKey] = sortValue;
    }
    const objectPagination = {
        limitItems: 4,
        skip: 0,
        currentPage: 1
    };
    const countDocuments = yield topic_model_1.default.countDocuments({
        deleted: false
    });
    objectPagination["totalPages"] = Math.ceil(countDocuments / objectPagination.limitItems);
    if (req.query.page) {
        let page = parseInt(req.query.page.toString());
        if (page < 1) {
            res.redirect(`?page=1`);
            return;
        }
        else if (page > objectPagination["totalPages"]) {
            res.redirect(`?page=${objectPagination["totalPages"]}`);
            return;
        }
        objectPagination.currentPage = page;
        objectPagination.skip = (page - 1) * objectPagination.limitItems;
    }
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
        const type = req.body.type;
        const ids = req.body.ids.split(", ");
        switch (type) {
            case "active":
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
