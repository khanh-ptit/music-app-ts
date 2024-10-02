import { Router } from "express";
import multer from "multer"
const router: Router = Router()

import * as controller from "../../controllers/admin/topic.controller"
const upload = multer()
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware"

// Middleware để xử lý Promise trong middleware async
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get("/", controller.index)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.patch("/change-multi/", controller.changeMulti)

router.delete("/delete/:id", controller.deleteItem)

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id", upload.single("avatar"), asyncHandler(uploadCloud.uploadSingle), controller.editPatch)

router.get("/create", controller.create)

router.post("/create", upload.single("avatar"), asyncHandler(uploadCloud.uploadSingle), controller.createPost)

router.get("/detail/:id", controller.detail)

export const topicRoutes: Router = router