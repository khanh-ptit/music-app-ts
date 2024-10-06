import { Router } from "express";
import multer from "multer"
const router: Router = Router()
const upload = multer()

import * as controller from "../../controllers/admin/singer.controller"
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware"

router.get("/", controller.index)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.delete("/delete/:id", controller.deleteItem)

router.get("/create", controller.create)

router.post("/create", upload.single("avatar"), uploadCloud.uploadSingle, controller.createPost)

router.patch("/change-multi", controller.changeMulti)

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id", upload.single("avatar"), uploadCloud.uploadSingle, controller.editPatch)

router.get("/detail/:id", controller.detail)

export const singerRoutes: Router = router