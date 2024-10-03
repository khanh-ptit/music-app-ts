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
exports.permissionsPatch = exports.permissions = exports.detail = exports.editPatch = exports.edit = exports.deleteItem = exports.createPost = exports.create = exports.index = void 0;
const system_1 = require("../../config/system");
const role_model_1 = __importDefault(require("../../models/role.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false
    });
    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        roles: roles
    });
});
exports.index = index;
const create = (req, res) => {
    res.render("admin/pages/roles/create.pug", {
        pageTitle: "Tạo mới nhóm quyền"
    });
};
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dataRole = {
        title: req.body.title,
        description: req.body.description
    };
    const newRole = new role_model_1.default(dataRole);
    yield newRole.save();
    req.flash("success", "Tạo nhóm quyền thành công!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
});
exports.createPost = createPost;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existRole = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existRole) {
            res.json({
                code: 400,
                message: "Nhóm quyền không tồn tại!"
            });
        }
        yield role_model_1.default.updateOne({
            _id: id
        }, {
            deleted: true
        });
        req.flash("success", "Xoá thành công nhóm quyền!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        });
    }
});
exports.deleteItem = deleteItem;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existRole = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existRole) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
            return;
        }
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            role: role
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existRole = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existRole) {
            res.json({
                code: 400,
                message: "Role không tồn tại!"
            });
            return;
        }
        const dataRole = {
            title: req.body.title,
        };
        if (req.body.description) {
            dataRole.description = req.body.description;
        }
        yield role_model_1.default.updateOne({
            _id: id
        }, dataRole);
        req.flash("success", "Cập nhật thành công role!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
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
        const existRole = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existRole) {
            req.flash("error", "Role không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
            return;
        }
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/roles/detail.pug", {
            pageTitle: "Chi tiết chủ đề",
            role: role
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.detail = detail;
const permissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false
    });
    res.render("admin/pages/roles/permissions.pug", {
        pageTitle: "Phân quyền",
        roles: roles
    });
});
exports.permissions = permissions;
const permissionsPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let permissions = JSON.parse(req.body.permissions);
    for (const item of permissions) {
        const id = item.id;
        const itemPermission = item.permissions;
        yield role_model_1.default.updateOne({
            _id: id
        }, {
            permissions: itemPermission
        });
    }
    req.flash("success", "Đã cập nhật phân quyền!");
    res.redirect("back");
});
exports.permissionsPatch = permissionsPatch;
