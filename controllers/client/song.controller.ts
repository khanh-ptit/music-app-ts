import { Request, Response } from "express"
import Topic from "../../models/topic.model"
import Song from "../../models/song.model"
import Singer from "../../models/singer.model"

// [GET] /songs/:slugTopic
export const list = async (req: Request, res: Response): Promise<void> => {
    // console.log(req.params.slugTopic)
    const topic = await Topic.findOne({
        slug: req.params.slugTopic,
        status: "active",
        deleted: false
    })
    const topicId = topic.id
    const songs = await Song.find({
        topicId: topicId,
        status: "active",
        deleted: false
    }).select("avatar title slug singerId like")
    
    for (const item of songs) {
        const singerInfo = await Singer.findOne({
            _id: item.singerId
        })
        item["singerInfo"] = singerInfo
    }

    res.render("client/pages/songs/list", {
        pageTitle: topic.title,
        songs: songs
    })
}

// [GET] /songs/detail/:slug
export const detail = async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug
    const song = await Song.findOne({
        slug: slug,
        status: "active",
        deleted: false
    })

    const singerInfo = await Singer.findOne({
        _id: song.singerId,
        deleted: false,
        status: "active"
    }).select("fullName")  
    song["singerInfo"] = singerInfo

    const topicInfo = await Topic.findOne({
        _id: song.topicId,
        deleted: false
    })
    song["topicInfo"] = topicInfo

    res.render("client/pages/songs/detail.pug", {
        pageTitle: "Chi tiết bài hát",
        song: song
    })
}