import { Router } from "express";
const router: Router = Router()

import * as controller from "../../controllers/client/song.controller"
import * as authMiddleware from "../../middlewares/client/auth.middleware"

router.get("/:slugTopic", controller.list)

router.get("/detail/:slug", controller.detail)

router.patch("/like/:typeLike/:idSong", authMiddleware.requireAuthApi, controller.like)

router.patch("/favorite/:typeFavorite/:idSong", authMiddleware.requireAuthApi, controller.favorite)

router.patch("/listen/:idSong", controller.listen)

export const songRoutes: Router = router