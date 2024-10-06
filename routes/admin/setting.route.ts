import { Router } from "express";
import multer from "multer"
const router: Router = Router()
const upload = multer()

import * as controller from "../../controllers/admin/setting.controller"
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware"

router.get("/general", controller.general)

router.patch("/general", 
    upload.fields([
        {name: "favicon", maxCount: 1},
        {name: "logo", maxCount: 1},
    ]),
    uploadCloud.uploadFields,
    controller.generalPatch
)

export const settingRoutes: Router = router