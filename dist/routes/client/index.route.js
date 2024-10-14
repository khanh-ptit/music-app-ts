"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const topic_route_1 = require("./topic.route");
const song_route_1 = require("./song.route");
const favorite_song_route_1 = require("./favorite-song.route");
const search_route_1 = require("./search.route");
const user_route_1 = require("./user.route");
const user_middleware_1 = require("../../middlewares/client/user.middleware");
const setting_middleware_1 = require("../../middlewares/client/setting.middleware");
const home_route_1 = require("./home.route");
const authMiddleware = __importStar(require("../../middlewares/client/auth.middleware"));
const singer_route_1 = require("./singer.route");
const routeClient = (app) => {
    app.use(user_middleware_1.setUser);
    app.use(setting_middleware_1.settingGeneral);
    app.use("/topics", topic_route_1.topicRoutes);
    app.use("/songs", song_route_1.songRoutes);
    app.use("/favorite-songs", authMiddleware.requireAuth, favorite_song_route_1.favoriteSongRoutes);
    app.use("/search", search_route_1.searchRoutes);
    app.use("/user", user_route_1.userRoutes);
    app.use("/", home_route_1.homeRoutes);
    app.use("/singers", singer_route_1.singerRoutes);
};
exports.default = routeClient;
