import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Account from "../../models/account.model";
import User from "../../models/user.model";
import Singer from "../../models/singer.model";
import Role from "../../models/role.model";

// [GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
    const statistic = {
        topic: {
            total: 0,
            active: 0,
            inactive: 0
        }, 
        song: {
            total: 0,
            active: 0,
            inactive: 0
        }, 
        singer: {
            total: 0,
            active: 0,
            inactive: 0
        }, 
        role: {
            total: 0
        }, 
        clientAccount: {
            total: 0,
            active: 0,
            inactive: 0,
            initial: 0
        }, 
        adminAccount: {
            total: 0,
            active: 0,
            inactive: 0
        }, 
    }

    statistic.topic.total = await Topic.countDocuments({
        deleted: false
    })
    statistic.topic.active = await Topic.countDocuments({
        status: "active",
        deleted: false
    })
    statistic.topic.inactive = await Topic.countDocuments({
        status: "inactive",
        deleted: false
    })

    statistic.song.total = await Song.countDocuments({
        deleted: false
    })
    statistic.song.active = await Song.countDocuments({
        status: "active",
        deleted: false
    })
    statistic.song.inactive = await Song.countDocuments({
        status: "inactive",
        deleted: false
    })
    statistic.adminAccount.total = await Account.countDocuments({
        deleted: false
    })
    statistic.adminAccount.active = await Account.countDocuments({
        status: "active",
        deleted: false
    })
    statistic.adminAccount.inactive = await Account.countDocuments({
        status: "inactive",
        deleted: false
    })
    statistic.clientAccount.total = await User.countDocuments({
        deleted: false
    })
    statistic.clientAccount.active = await User.countDocuments({
        status: "active",
        deleted: false
    })
    statistic.clientAccount.inactive = await User.countDocuments({
        status: "inactive",
        deleted: false
    })
    statistic.clientAccount.initial = await User.countDocuments({
        status: "initial",
        deleted: false
    })
    statistic.singer.total = await Singer.countDocuments({
        deleted: false
    })
    statistic.singer.active = await Singer.countDocuments({
        status: "active",
        deleted: false
    })
    statistic.singer.inactive = await Singer.countDocuments({
        status: "inactive",
        deleted: false
    })
    statistic.role.total = await Role.countDocuments({
        deleted: false
    })

    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan",
        statistic: statistic
    })
}