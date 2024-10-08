import { Router } from "express";
import multer from "multer"
const router: Router = Router()
const upload = multer()

import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware"
import * as controller from "../../controllers/admin/account.controller"
import * as validate from "../../validates/admin/account.validate"

router.get("/", controller.index)

router.get("/create", controller.create)

router.post("/create", upload.single("avatar"), uploadCloud.uploadSingle, validate.createPost, controller.createPost)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.delete("/delete/:id", controller.deleteItem)

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id", upload.single("avatar"), uploadCloud.uploadSingle, validate.editPatch, controller.editPatch)

router.get("/detail/:id", controller.detail)

router.patch("/change-multi", controller.changeMulti)

export const accountRoutes: Router = router