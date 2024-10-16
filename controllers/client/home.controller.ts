import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { SortOrder } from "mongoose";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /
export const index = async (req: Request, res: Response) => {
    const settingGeneral = res.locals.settingGeneral

    let find = {
        deleted: false,
        status: "active"
    }
    let sort = {
        position: "desc" as SortOrder
    }
    const topics = await Topic
        .find(find)
        .sort(sort)
        .limit(3)
        .select("-status -position")

    const newSongs = await Song
        .find(find)
        .sort(sort)
        .limit(4)

    for (const item of newSongs) {
        const infoSinger = await Singer.findOne({
            _id: item.singerId
        })
        item["infoSinger"] = infoSinger
    }

    const newSingers = await Singer
        .find(find)
        .sort(sort)
        .limit(6)

    res.render("client/pages/home/index.pug", {
        pageTitle: settingGeneral.websiteName,
        topics: topics,
        newSongs: newSongs,
        newSingers: newSingers
    })
}