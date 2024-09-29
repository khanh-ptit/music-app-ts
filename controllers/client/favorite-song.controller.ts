import { Request, Response } from "express"
import FavoriteSong from "../../models/favorite-song.model"
import Song from "../../models/song.model"
import Singer from "../../models/singer.model"

// [GET] /favorite-songs
export const index = async (req: Request, res: Response) => {
    const favoriteSongs = await FavoriteSong.find({
        // userId: "",
        deleted: false
    })
    for (const item of favoriteSongs) {
        const songId = item.songId
        const songInfo = await Song.findOne({
            _id: songId,
            deleted: false
        }).select("title singerId slug avatar")

        const singerId = songInfo.singerId
        const singerInfo = await Singer.findOne({
            _id: singerId
        })
        item["songInfo"] = songInfo
        item["singerInfo"] = singerInfo
    }
    res.render("client/pages/favorite-songs/index", {
        pageTitle: "Bài hát yêu thích",
        songs: favoriteSongs
    })
}