import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { SortOrder } from "mongoose";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /
export const index = async (req: Request, res: Response) => {
    const settingGeneral = res.locals.settingGeneral;

    let find = {
        deleted: false,
        status: "active"
    };
    let sort = {
        position: "desc" as SortOrder
    };

    // Lấy 3 chủ đề
    const topics = await Topic
        .find(find)
        .sort(sort)
        .limit(3)
        .select("-status -position");

    // Lấy 6 bài hát mới nhất
    const newSongs = await Song
        .find(find)
        .sort(sort)
        .limit(6);

    for (const item of newSongs) {
        const infoSinger = await Singer.findOne({
            _id: item.singerId
        });
        item["infoSinger"] = infoSinger;
    }

    // Lấy 6 ca sĩ mới nhất
    const newSingers = await Singer
        .find(find)
        .sort(sort)
        .limit(6);

    // Lấy 10 bài hát được nghe nhiều nhất
    const popularSongs = await Song
        .find(find)
        .sort({ listen: -1 }) // Sắp xếp giảm dần theo số lượt nghe
        .limit(10);

    for (const song of popularSongs) {
        const infoSinger = await Singer.findOne({
            _id: song.singerId
        });
        song["infoSinger"] = infoSinger;
    }

    res.render("client/pages/home/index.pug", {
        pageTitle: settingGeneral.websiteName,
        topics: topics,
        newSongs: newSongs,
        newSingers: newSingers,
        popularSongs: popularSongs
    });
};
