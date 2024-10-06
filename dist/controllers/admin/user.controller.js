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
exports.deleteItem = exports.changeStatus = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const filterStatusUser_1 = __importDefault(require("../../helpers/filterStatusUser"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filterStatus = (0, filterStatusUser_1.default)(req.query);
    let find = {
        deleted: false
    };
    if (req.query.status) {
        find["status"] = req.query.status;
    }
    const users = yield user_model_1.default
        .find(find)
        .select("-password -tokenUser");
    res.render("admin/pages/users/index", {
        pageTitle: "Tài khoản Client",
        users: users,
        filterStatus: filterStatus
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.params.status;
        const id = req.params.id;
        const existUser = yield user_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existUser) {
            res.json({
                code: 400,
                message: "Chú định bịp à?"
            });
            return;
        }
        yield user_model_1.default.updateOne({
            _id: id
        }, {
            status: status
        });
        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            status: status
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Chú định bịp à?"
        });
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const existUser = yield user_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!existUser) {
            res.json({
                code: 400,
                message: "Chú định bịp à?"
            });
            return;
        }
        yield user_model_1.default.updateOne({
            _id: id
        }, {
            deleted: true
        });
        res.json({
            code: 200,
            message: "Đã xóa tài khoản!",
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
});
exports.deleteItem = deleteItem;
