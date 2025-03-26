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
exports.changeMulti = exports.detail = exports.editPatch = exports.edit = exports.deleteItem = exports.changeStatus = exports.createPost = exports.create = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const md5_1 = __importDefault(require("md5"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const system_1 = require("../../config/system");
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const pagination_1 = __importDefault(require("../../helpers/pagination"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        deleted: false,
    };
    const filterStatus = (0, filterStatus_1.default)(req.query);
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const countDocuments = yield account_model_1.default.countDocuments(find);
    const objectPagination = (0, pagination_1.default)(req.query, res, countDocuments, "accounts");
    const accounts = yield account_model_1.default.find(find).select("-token -password");
    for (const item of accounts) {
        const roleInfo = yield role_model_1.default.findOne({
            _id: item.role_id,
            deleted: false,
        });
        item["roleInfo"] = roleInfo;
        if (item.createdBy.createdAt) {
            if (item.createdBy.createdAt) {
                const infoAccountCreate = yield account_model_1.default.findOne({
                    _id: item.createdBy.accountId,
                }).select("fullName");
                if (infoAccountCreate) {
                    item["infoAccountCreate"] = infoAccountCreate;
                }
            }
        }
        if (item.updatedBy.length > 0) {
            const lastLog = item.updatedBy[item.updatedBy.length - 1];
            const infoAccountUpdate = yield account_model_1.default.findOne({
                _id: lastLog.accountId,
            });
            if (infoAccountUpdate) {
                item["infoAccountUpdate"] = infoAccountUpdate;
                item["updatedAt"] = lastLog.updatedAt;
            }
        }
    }
    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Tài khoản admin",
        accounts: accounts,
        filterStatus: filterStatus,
        pagination: objectPagination,
    });
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false,
    });
    res.render("admin/pages/accounts/create.pug", {
        pageTitle: "Tạo mới tài khoản admin",
        roles: roles,
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existEmail = yield account_model_1.default.findOne({
        email: req.body.email,
        deleted: false,
    });
    if (existEmail) {
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    }
    const dataAccount = {
        fullName: req.body.fullName,
        password: (0, md5_1.default)(req.body.password),
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        status: req.body.status,
        avatar: req.body.avatar,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date(),
        },
    };
    const newAccount = new account_model_1.default(dataAccount);
    yield newAccount.save();
    req.flash("success", "Tạo thành công tài khoản!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
});
exports.createPost = createPost;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const status = req.params.status;
        const existAccount = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!existAccount) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!",
            });
            return;
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date(),
        };
        yield account_model_1.default.updateOne({
            _id: id,
        }, {
            status: status,
            $push: {
                updatedBy: updatedBy,
            },
        });
        res.status(200).json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            status: status,
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb",
        });
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existAccount = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!existAccount) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!",
            });
            return;
        }
        yield account_model_1.default.updateOne({
            _id: id,
        }, {
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date(),
            },
        });
        res.json({
            code: 200,
            message: "Đã xóa thành công",
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb",
        });
    }
});
exports.deleteItem = deleteItem;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existAccount = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!existAccount) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
            return;
        }
        const account = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        const roles = yield role_model_1.default.find({
            deleted: false,
        });
        res.render("admin/pages/accounts/edit.pug", {
            pageTitle: "Chỉnh sửa tài khoản admin",
            account: account,
            roles: roles,
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existAccount = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!existAccount) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!",
            });
            return;
        }
        const email = req.body.email;
        const existEmail = yield account_model_1.default.findOne({
            _id: {
                $ne: id,
            },
            email: email,
            deleted: false,
        });
        if (existEmail) {
            req.flash("error", "Email đã tồn tại!");
            res.redirect("back");
            return;
        }
        const dataAccount = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            role_id: req.body.role_id,
            status: req.body.status,
        };
        if (req.body.password) {
            dataAccount.password = (0, md5_1.default)(req.body.password);
        }
        if (req.body.avatar) {
            dataAccount.avatar = (0, md5_1.default)(req.body.avatar);
        }
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date(),
        };
        yield account_model_1.default.updateOne({
            _id: id,
        }, {
            $set: dataAccount,
            $push: {
                updatedBy: updatedBy,
            },
        });
        req.flash("success", "Cập nhật tài khoản thành công!");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb",
        });
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existAccount = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!existAccount) {
            req.flash("error", "Đường dẫn không tồn tại!");
            res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
            return;
        }
        const account = yield account_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        const roles = yield role_model_1.default.find({
            deleted: false,
        });
        for (const item of roles) {
            const roleInfo = yield role_model_1.default.findOne({
                _id: account.role_id,
            });
            account["roleInfo"] = roleInfo;
        }
        res.render("admin/pages/accounts/detail.pug", {
            pageTitle: "Chi tiết tài khoản admin",
            account: account,
            roles: roles,
        });
    }
    catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.detail = detail;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = {
        accountId: res.locals.user.id,
        updatedAt: new Date(),
    };
    switch (type) {
        case "active":
            yield account_model_1.default.updateMany({
                _id: {
                    $in: ids,
                },
            }, {
                status: "active",
                $push: {
                    updatedBy: updatedBy,
                },
            });
            req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} tài khoản`);
            res.redirect("back");
            break;
        case "inactive":
            yield account_model_1.default.updateMany({
                _id: {
                    $in: ids,
                },
            }, {
                status: "inactive",
                $push: {
                    updatedBy: updatedBy,
                },
            });
            req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} tài khoản`);
            res.redirect("back");
            break;
        case "delete-all":
            yield account_model_1.default.updateMany({
                _id: {
                    $in: ids,
                },
            }, {
                deleted: true,
                deletedBy: {
                    accountId: res.locals.user.id,
                    deletedAt: new Date(),
                },
            });
            req.flash("success", `Đã xóa ${ids.length} tài khoản`);
            res.redirect("back");
            break;
        default:
            req.flash("error", `Có lỗi xảy ra`);
            res.redirect("back");
            break;
    }
});
exports.changeMulti = changeMulti;
