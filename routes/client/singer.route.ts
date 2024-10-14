import { Router } from "express";
const router: Router = Router()

import * as controller from "../../controllers/client/singer.controller"

router.get("/:slug", controller.detail)

router.get("/", controller.index)

export const singerRoutes: Router = router