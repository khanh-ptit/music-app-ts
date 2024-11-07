import { Router } from "express";
const router: Router = Router()
import multer from "multer"
const upload = multer()

import * as controller from "../../controllers/client/user.controller"
import * as validate from "../../validates/client/user.validate"
import * as authMiddleware from "../../middlewares/client/auth.middleware"
import * as uploadCloud from "../../middlewares/client/uploadCloud.middleware"

router.get("/register", controller.register)

router.post("/register", validate.registerPost, controller.registerPost)

router.get("/verify-user", controller.verifyUser)

router.post("/verify-user", controller.verifyUserPost)

router.get("/login", controller.login)

router.post("/login", controller.loginPost)

router.get("/logout", authMiddleware.requireAuth, controller.logout)

router.get("/verify-email", controller.verifyEmail)

router.post("/verify-email", controller.verifyEmailPost)

router.get("/password/forgot", controller.passwordForgot)

router.post("/password/forgot", controller.passwordForgotPost)

router.get("/password/forgot-phone", controller.passwordForgotPhone)

router.post("/password/forgot-phone", controller.passwordForgotPhonePost)

router.get("/password/otp", controller.passwordOtp)

router.post("/password/otp", controller.passwordOtpPost)

router.get("/password/reset", authMiddleware.requireAuth, controller.passwordReset)

router.post("/password/reset", authMiddleware.requireAuth, controller.passwordResetPost)

router.get("/info", authMiddleware.requireAuth, controller.info)

router.get("/edit", authMiddleware.requireAuth, controller.edit)

router.patch("/update-avatar", upload.single("avatar"), uploadCloud.uploadSingle, authMiddleware.requireAuth, controller.updateAvatar)

router.patch("/edit", authMiddleware.requireAuth, controller.editPatch)

export const userRoutes: Router = router