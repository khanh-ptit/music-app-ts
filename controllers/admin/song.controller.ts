import { Request, Response } from "express";
import Song from "../../models/song.model";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { systemConfig } from "../../config/system";

// [GET] /admin/songs
export const index = async (req: Request, res: Response) => {
    const filterStatus = filterStatusHelper(req.query) 
    let find = {
        deleted: false
    }

    interface Sort {
        [key: string]: SortOrder
    }

    let objectSort: Sort = {
        position: "asc".toLowerCase() as SortOrder
    }

    // Filter status
    if (req.query.status) {
        find["status"] = req.query.status
    }

    // Form search
    const objectSearch = searchHelper(req.query)
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"]
    }

    // sort
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString()
        const sortValue = req.query.sortValue.toString() as SortOrder
        if (sortValue == "asc" || sortValue == "desc") {
            objectSort[sortKey] = sortValue
        }
    }

    const songs = await Song.find(find).sort(objectSort)
    res.render("admin/pages/songs/index", {
        pageTitle: "Danh sách bài hát",
        songs: songs,
        filterStatus: filterStatus,
        keyword: objectSearch["keyword"]
    })
}

// [PATCH] /admin/songs/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const status = req.params.status
        const id = req.params.id
        
        const existSong = await Song.findOne({
            _id: id,
            deleted: false
        })

        if (!existSong) {
            res.json({
                code: 404,
                message: "Không tồn tại bài hát!"
            })
            return
        }

        await Song.updateOne({
            _id: id
        }, {
            status: status
        })
    
        req.flash("success", "Cập nhật trạng thái thành công!")
        res.redirect("back")
    } catch (error) {
        res.status(404).json({
            message: "Nghịch cái đb"
        })
    }
    
}

// [PATCH] /admin/songs/change-multi
export const changeMulti = async (req: Request, res: Response) => {
    // console.log(req.body)
    const type: string = req.body.type
    const ids: string[] = req.body.ids.split(", ")
    console.log(type, ids)
    switch (type) {
        case "active":
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active"
            })
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`)
            res.redirect("back")
            break;
        case "inactive":
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive"
            })
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`)
            res.redirect("back")
            break;
        case "delete-all":
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true
            })
            req.flash("success", `Xóa thành công ${ids.length} bài hát`)
            res.redirect("back")
            break;
        default:
            req.flash("error", `Có lỗi xảy ra!`)
            res.redirect("back")
            break;
    } 
}

// [DELETE] /admin/songs/delete/:id
export const deleteSong = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const existSong = await Song.findOne({
            _id: id,
            deleted: false
        })

        if (!existSong) {
            res.json({
                code: 404,
                message: "Không tồn tại bài hát!"
            })
            return
        }

        await Song.updateOne({
            _id: id
        }, {
            deleted: true
        })
        req.flash("success", "Xóa thành công bài hát!")
        res.redirect("back")
    } catch(error) {
        res.json({
            code: 404,
            message: "Nghịch cái đb"
        })
    }
}

// [GET] /admin/songs/create
export const create = async (req: Request, res: Response) => {
    const countSong = await Song.countDocuments({
        deleted: false
    })
    const topics = await Topic.find({
        deleted: false,
        status: "active"
    }).select("title")

    const singers = await Singer.find({
        deleted: false,
        status: "active"
    }).select("fullName")

    res.render("admin/pages/songs/create", {
        pageTitle: "Thêm mới bài hát",
        topics: topics,
        singers: singers,
        countSong: countSong
    })
}

// [POST] /admin/songs/create
export const createPost = async (req: Request, res: Response) => {
    const countSong = await Song.countDocuments({
        deleted: false
    })
   
    interface DataSong {
        title: String,
        topicId: String,
        singerId: String,
        position: Number,
        lyrics?: String,
        audio?: String,
        status: String,
        avatar: String,
        description: String
    }

    let avatar = ""
    let audio = ""

    if (req.body.avatar) {
        avatar = req.body.avatar[0]
    }

    if (req.body.audio) {
        audio = req.body.audio[0]
    }

    const dataSong: DataSong = {
        title: req.body.title,
        topicId: req.body.topicId,
        singerId: req.body.singerId,
        position: req.body.position,
        description: req.body.description,
        status: req.body.status,
        avatar: avatar,
        audio: audio
    }

    if (req.body.postion) {
        dataSong.position = parseInt(req.body.position)
    } else {
        dataSong.position = countSong + 1
    }
    
    const newSong = new Song(dataSong)
    await newSong.save()

    req.flash("success", "Tạo thành công bài hát!")
    res.redirect(`${systemConfig.prefixAdmin}/songs`)
}

// [GET] /admin/songs/edit/:id
export const edit = async (req: Request, res: Response) => {
    const id = req.params.id
    const song = await Song.findOne({
        _id: id,
        deleted: false
    })

    const topics = await Topic.find({
        deleted: false,
        status: "active"
    }).select("title")

    const singers = await Singer.find({
        deleted: false,
        status: "active"
    }).select("fullName")

    res.render("admin/pages/songs/edit.pug", {
        pageTitle: "Chỉnh sửa bài hát",
        song: song,
        topics: topics,
        singers: singers
    })
}

// [PATCH] /admin/songs/edit/:id
export const editPatch = async (req: Request, res: Response) => {
    const id = req.params.id
    interface DataSong {
        title: String,
        topicId: String,
        singerId: String,
        position: Number,
        lyrics?: String,
        audio?: String,
        status: String,
        avatar?: String,
        description: String
    }

    let avatar = ""
    let audio = ""

    const dataSong: DataSong = {
        title: req.body.title,
        topicId: req.body.topicId,
        singerId: req.body.singerId,
        description: req.body.description,
        status: req.body.status,
        position: parseInt(req.body.position),
        lyrics: req.body.lyrics
    }

    if (req.body.avatar) {
        dataSong.avatar = req.body.avatar[0]
    }

    if (req.body.audio) {
        dataSong.audio = req.body.audio[0]
    }
    
    await Song.updateOne({
        _id: id
    }, dataSong)

    req.flash("success", "Cập nhật thành công bài hát!")
    res.redirect(`${systemConfig.prefixAdmin}/songs`)
}