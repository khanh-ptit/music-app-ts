import { Express } from "express"
import { topicRoutes } from "./topic.route"
import { songRoutes } from "./song.route"
import { favoriteSongRoutes } from "./favorite-song.route"
import { searchRoutes } from "./search.route"
import { userRoutes } from "./user.route"
import { setUser } from "../../middlewares/client/user.middleware"

const routeClient = (app: Express): void => {
    app.use(setUser)
    app.use("/topics", topicRoutes)
    app.use("/songs", songRoutes)
    app.use("/favorite-songs", favoriteSongRoutes)
    app.use("/search", searchRoutes)
    app.use("/user", userRoutes)
}

export default routeClient