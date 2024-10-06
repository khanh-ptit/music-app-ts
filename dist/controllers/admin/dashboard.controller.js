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
const account_model_1 = __importDefault(require("../../models/account.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const statistic = {
        topic: {
            total: 0,
            active: 0,
            inactive: 0
        },
        song: {
            total: 0,
            active: 0,
            inactive: 0
        },
        singer: {
            total: 0,
            active: 0,
            inactive: 0
        },
        role: {
            total: 0
        },
        clientAccount: {
            total: 0,
            active: 0,
            inactive: 0,
            initial: 0
        },
        adminAccount: {
            total: 0,
            active: 0,
            inactive: 0
        },
    };
    statistic.topic.total = yield topic_model_1.default.countDocuments({
        deleted: false
    });
    statistic.topic.active = yield topic_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.topic.inactive = yield topic_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.song.total = yield song_model_1.default.countDocuments({
        deleted: false
    });
    statistic.song.active = yield song_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.song.inactive = yield song_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.adminAccount.total = yield account_model_1.default.countDocuments({
        deleted: false
    });
    statistic.adminAccount.active = yield account_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.adminAccount.inactive = yield account_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.clientAccount.total = yield user_model_1.default.countDocuments({
        deleted: false
    });
    statistic.clientAccount.active = yield user_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.clientAccount.inactive = yield user_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.clientAccount.initial = yield user_model_1.default.countDocuments({
        status: "initial",
        deleted: false
    });
    statistic.singer.total = yield singer_model_1.default.countDocuments({
        deleted: false
    });
    statistic.singer.active = yield singer_model_1.default.countDocuments({
        status: "active",
        deleted: false
    });
    statistic.singer.inactive = yield singer_model_1.default.countDocuments({
        status: "inactive",
        deleted: false
    });
    statistic.role.total = yield role_model_1.default.countDocuments({
        deleted: false
    });
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan",
        statistic: statistic
    });
});
exports.index = index;
