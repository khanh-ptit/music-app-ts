import { Router } from "express";
const router: Router = Router()

import * as controller from "../../controllers/admin/song.controller"

router.get("/", controller.index)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.patch("/change-multi", controller.changeMulti)

router.delete("/delete/:id", controller.deleteSong)

export const songRoutes: Router = router