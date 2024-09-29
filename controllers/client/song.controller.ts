import { Request, Response } from "express"
import Topic from "../../models/topic.model"
import Song from "../../models/song.model"
import Singer from "../../models/singer.model"
import FavoriteSong from "../../models/favorite-song.model"

// [GET] /songs/:slugTopic
export const list = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
        res.render("client/pages/error/404", {
            pageTitle: "404 Not Found"
        })
    }
}

// [GET] /songs/detail/:slug
export const detail = async (req: Request, res: Response): Promise<void> => {
    try {
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

        const isFavorite = await FavoriteSong.findOne({
            songId: song.id
        })

        song["isFavorite"] = (isFavorite != null) ? true : false
        song["topicInfo"] = topicInfo
        res.render("client/pages/songs/detail.pug", {
            pageTitle: `${song.title} | ${singerInfo.fullName}`,
            song: song
        })
    } catch (error) {
        res.render("client/pages/error/404", {
            pageTitle: "404 Not Found"
        })
    }
}

// [PATCH] /songs/like/:typeLike/:idSong (sau này sẽ chuyển về private)
// Tính năng like sau này khi làm tính năng đăng nhập thay vì lưu số lượng like của bài hát sẽ lưu id của những người đã like sau đó trả về length
export const like = async (req: Request, res: Response) => {
    try {
        const id = req.params.idSong
        const typeLike = req.params.typeLike

        const song = await Song.findOne({
            _id: id,
            deleted: false,
            status: "active"
        })
        
        let newLike: number
        if (typeLike == "like") {
            newLike = song.like + 1
        } else {
            newLike = song.like - 1
        }

        await Song.updateOne({
            _id: id
        }, {
            like: newLike
        })

        res.json({
            code: 200,
            message: "Thành công!",
            like: newLike
        })
    } catch {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect("back")
    }
}

// [PATCH] /songs/favorite/:typeFavorite/:idSong
export const favorite = async (req: Request, res: Response) => {
    const idSong: string = req.params.idSong
    const typeFavorite: string = req.params.typeFavorite

    switch (typeFavorite) {
        case "favorite":
            const existFavoriteSong = await FavoriteSong.findOne({
                songId: idSong
            })
            if (!existFavoriteSong) {
                const newFavoriteSong = new FavoriteSong({
                    // userId: "", (sau này làm tính năng đăng nhập thì add vào)
                    songId: idSong
                })
                await newFavoriteSong.save()
            }
            break;
        case "unfavorite":
            await FavoriteSong.deleteOne({
                songId: idSong
            })
            break;
        default:
            break;
    }

    res.json({
        code: 200
    })
}