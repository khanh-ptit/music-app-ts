import { Router } from "express";
import multer from "multer";
const router: Router = Router();

import * as controller from "../../controllers/admin/song.controller";
const upload = multer();
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

// Middleware để xử lý Promise trong middleware async
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteSong);

// Sử dụng asyncHandler để xử lý middleware async
router.get("/create", controller.create);

router.post("/create", 
  upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "audio", maxCount: 1},
  ]), 
  asyncHandler(uploadCloud.uploadFields), 
  controller.createPost
);

router.get("/edit/:id", controller.edit)

router.patch("/edit/:id",
  upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "audio", maxCount: 1},
  ]), 
  asyncHandler(uploadCloud.uploadFields),
  controller.editPatch 
)

router.get("/detail/:id", controller.detail)

export const songRoutes: Router = router;