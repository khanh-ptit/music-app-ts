import { Express } from "express";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { favoriteSongRoutes } from "./favorite-song.route";
import { searchRoutes } from "./search.route";
import { userRoutes } from "./user.route";
import { setUser } from "../../middlewares/client/user.middleware";
import { settingGeneral } from "../../middlewares/client/setting.middleware";
import { homeRoutes } from "./home.route";
import * as authMiddleware from "../../middlewares/client/auth.middleware";
import { singerRoutes } from "./singer.route";

const routeClient = (app: Express): void => {
  app.use(setUser);
  app.use(settingGeneral);
  app.use("/topics", topicRoutes);
  app.use("/songs", songRoutes);
  app.use("/favorite-songs", authMiddleware.requireAuth, favoriteSongRoutes);
  app.use("/search", searchRoutes);
  app.use("/user", userRoutes);
  app.use("/", homeRoutes);
  app.use("/singers", singerRoutes);
};

export default routeClient;
