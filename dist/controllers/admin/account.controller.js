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
exports.createPost = exports.create = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const md5_1 = __importDefault(require("md5"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const system_1 = require("../../config/system");
const filterStatus_1 = __importDefault(require("../../helpers/filterStatus"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let find = {
        deleted: false
    };
    const filterStatus = (0, filterStatus_1.default)(req.query);
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const accounts = yield account_model_1.default
        .find(find)
        .select("-token -password");
    for (const item of accounts) {
        const roleInfo = yield role_model_1.default.findOne({
            _id: item.role_id,
            deleted: false
        });
        item["roleInfo"] = roleInfo;
    }
    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Tài khoản admin",
        accounts: accounts,
        filterStatus: filterStatus
    });
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false
    });
    res.render("admin/pages/accounts/create.pug", {
        pageTitle: "Tạo mới tài khoản admin",
        roles: roles
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existEmail = yield account_model_1.default.findOne({
        email: req.body.email,
        deleted: false
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
        avatar: req.body.avatar
    };
    const newAccount = new account_model_1.default(dataAccount);
    yield newAccount.save();
    req.flash("success", "Tạo thành công tài khoản!");
    res.redirect(`${system_1.systemConfig.prefixAdmin}/accounts`);
});
exports.createPost = createPost;
