import { Router } from "express";
import multer from "multer";
const router: Router = Router()
const upload = multer();

import * as controller from "../../controllers/admin/upload.controller"

import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

// Middleware để xử lý Promise trong middleware async
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/",
    upload.single("file"), 
    asyncHandler(uploadCloud.uploadSingle), 
    controller.index
)

export const uploadRoutes: Router = router