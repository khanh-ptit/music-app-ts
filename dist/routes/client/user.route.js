"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const controller = __importStar(require("../../controllers/client/user.controller"));
const validate = __importStar(require("../../validates/client/user.validate"));
const authMiddleware = __importStar(require("../../middlewares/client/auth.middleware"));
const uploadCloud = __importStar(require("../../middlewares/client/uploadCloud.middleware"));
router.get("/register", controller.register);
router.post("/register", validate.registerPost, controller.registerPost);
router.get("/verify-user", controller.verifyUser);
router.post("/verify-user", controller.verifyUserPost);
router.get("/login", controller.login);
router.get("/verify-login", controller.verifyLogin);
router.post("/verify-login", controller.verifyLoginPost);
router.post("/login", validate.loginPost, controller.loginPost);
router.get("/logout", authMiddleware.requireAuth, controller.logout);
router.get("/verify-email", controller.verifyEmail);
router.post("/verify-email", controller.verifyEmailPost);
router.get("/password/forgot", controller.passwordForgot);
router.post("/password/forgot", controller.passwordForgotPost);
router.get("/password/forgot-phone", controller.passwordForgotPhone);
router.post("/password/forgot-phone", controller.passwordForgotPhonePost);
router.get("/password/otp", controller.passwordOtp);
router.get("/password/otp-phone", controller.passwordOtpPhone);
router.post("/password/otp", controller.passwordOtpPost);
router.post("/password/otp-phone", controller.passwordOtpPhonePost);
router.get("/password/reset", authMiddleware.requireAuth, controller.passwordReset);
router.post("/password/reset", authMiddleware.requireAuth, validate.passwordResetPost, controller.passwordResetPost);
router.get("/info", authMiddleware.requireAuth, controller.info);
router.get("/edit", authMiddleware.requireAuth, controller.edit);
router.patch("/update-avatar", upload.single("avatar"), uploadCloud.uploadSingle, authMiddleware.requireAuth, controller.updateAvatar);
router.patch("/edit", authMiddleware.requireAuth, controller.editPatch);
exports.userRoutes = router;
