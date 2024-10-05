import { Router } from "express";
const router: Router = Router()

import * as controller from "../../controllers/client/user.controller"
import * as validate from "../../validates/client/user.validate"

router.get("/register", controller.register)

router.post("/register", validate.registerPost, controller.registerPost)

router.get("/verifyUser", controller.verifyUser)

router.post("/verifyUser", controller.verifyUserPost)

router.get("/login", controller.login)

export const userRoutes: Router = router