import { Router } from "express";
const router: Router = Router()

import * as controller from "../../controllers/admin/topic.controller"

router.get("/", controller.index)

router.patch("/change-status/:status/:id", controller.changeStatus)

router.delete("/delete/:id", controller.deleteItem)

export const topicRoutes: Router = router