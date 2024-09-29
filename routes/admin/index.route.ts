import { Application } from "express";
import { systemConfig } from "../../config/system";
import { dashboardRoutes } from "./dashboard.route";

export const routeAdmin = (app: Application) => {
    const PATH_ADMIN = systemConfig.prefixAdmin
    
    app.use(PATH_ADMIN + "/dashboard", dashboardRoutes)
}