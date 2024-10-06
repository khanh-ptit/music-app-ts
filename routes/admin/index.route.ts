import { Application } from "express";
import { systemConfig } from "../../config/system";
import { dashboardRoutes } from "./dashboard.route";
import { songRoutes } from "./song.route";
import { uploadRoutes } from "./upload.route";
import { topicRoutes } from "./topic.route";
import { accountRoutes } from "./account.route";
import { roleRoutes } from "./role.route";
import { authRoutes } from "./auth.route";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import { userRoutes } from "./user.route";

export const routeAdmin = (app: Application) => {
    const PATH_ADMIN = systemConfig.prefixAdmin

    app.use(PATH_ADMIN + "/dashboard", authMiddleware.requireAuth, dashboardRoutes)
    app.use(PATH_ADMIN + "/songs", authMiddleware.requireAuth, songRoutes)
    app.use(PATH_ADMIN + "/upload", authMiddleware.requireAuth, uploadRoutes)
    app.use(PATH_ADMIN + "/topics", authMiddleware.requireAuth, topicRoutes)
    app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRoutes)
    app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, roleRoutes)
    app.use(PATH_ADMIN + "/auth", authRoutes)
    app.use(PATH_ADMIN + "/users", authMiddleware.requireAuth, userRoutes)
}