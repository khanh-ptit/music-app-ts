import { Request, Response } from "express"
import Topic from "../../models/topic.model"
import Song from "../../models/song.model"
import Singer from "../../models/singer.model"
import FavoriteSong from "../../models/favorite-song.model"
import pagination from "../../helpers/pagination-client"

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

        // Pagination 
        const countDocuments = await Song.countDocuments({deleted: false})
        const objectPagination = pagination(req.query, res, countDocuments, "/songs/nhac-tre")
        if (!objectPagination) return
        // console.log(objectPagination)
        // End pagination

        const songs = await Song.find({
            topicId: topicId,
            status: "active",
            deleted: false
        })
            .select("avatar title slug singerId like createdBy")
            .limit(objectPagination["limitItems"])
            .skip(objectPagination["skip"])
        
        for (const item of songs) {
            const singerInfo = await Singer.findOne({
                _id: item.singerId
            })
            item["singerInfo"] = singerInfo
        }

        res.render("client/pages/songs/list", {
            pageTitle: topic.title,
            songs: songs,
            pagination: objectPagination
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
        }).select("fullName slug")  
        song["singerInfo"] = singerInfo
    
        const topicInfo = await Topic.findOne({
            _id: song.topicId,
            deleted: false
        })

        let find = {
            songId: song.id
        }
        if (res.locals.user != null) {
            find["userId"] = res.locals.user.id
            const isFavorite = await FavoriteSong.findOne(find)
            song["isFavorite"] = (isFavorite != null) ? true : false

            const isLike = song.like.includes(res.locals.user.id)
            song["isLike"] = isLike 
        } else {
            song["isFavorite"] = false
            song["isLike"] = false
        }
        
        song["topicInfo"] = topicInfo
        res.render("client/pages/songs/detail.pug", {
            pageTitle: `${song.title} | ${singerInfo.fullName}`,
            song: song
        })
    } catch (error) {
        console.log(error)
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
        
        if (typeLike == "like") {
            if (!song.like.includes(res.locals.user.id)) {
                song.like.push(res.locals.user.id)
            }
        } else {
            song.like = song.like.filter(item => item != res.locals.user.id)
        }

        await song.save()

        res.json({
            code: 200,
            message: "Đã thích bài hát!",
            like: song.like.length
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
                songId: idSong,
                userId: res.locals.user.id
            })
            if (!existFavoriteSong) {
                const newFavoriteSong = new FavoriteSong({
                    userId: res.locals.user.id, //(sau này làm tính năng đăng nhập thì add vào)
                    songId: idSong
                })
                await newFavoriteSong.save()
            }
            break;
        case "unfavorite":
            await FavoriteSong.deleteOne({
                songId: idSong,
                userId: res.locals.user.id
            })
            break;
        default:
            break;
    }

    res.json({
        code: 200,
        message: "Đã thêm vào danh sách yêu thích"
    })
}

// [PATCH] /songs/listen/:idSong
export const listen = async (req: Request, res: Response) => {
    const id = req.params.idSong
    
    const song = await Song.findOne({
        _id: id,
        deleted: false
    })

    if (song) {
        let countListen = song.listen + 1
        
        // Use findOneAndUpdate to return the updated document
        await Song.updateOne({
            _id: id,
            deleted: false
        }, {
            listen: countListen
        })

        const updatedSong = await Song.findOne({
            _id: id,
            deleted: false
        })

        res.json({
            code: 200,
            listen: updatedSong.listen
        })
    }
}