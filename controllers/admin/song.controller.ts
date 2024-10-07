import { Request, Response } from "express";
import Song from "../../models/song.model";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { systemConfig } from "../../config/system";
import paginationHelper from "../../helpers/pagination";
import Account from "../../models/account.model";

// [GET] /admin/songs
export const index = async (req: Request, res: Response) => {
    const roles = res.locals.roles

    if (!roles.permissions.includes("song_view")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền xem danh sách bài hát"
        })
    }
    
    const filterStatus = filterStatusHelper(req.query) 
    let find = {
        deleted: false
    }

    interface Sort {
        [key: string]: SortOrder
    }

    let objectSort: Sort = {
        position: "desc".toLowerCase() as SortOrder
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

    // Pagination 
    const countSong = await Song.countDocuments({
        deleted: false
    })
    const objectPagination = paginationHelper(req.query, res, countSong, "songs")

    if (!objectPagination) return;

    const songs = await Song
        .find(find)
        .sort(objectSort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
    
    for (const item of songs) {
        const infoAccountCreate = await Account.findOne({
            _id: item.createdBy.accountId
        }).select("fullName")
        if (infoAccountCreate) {
            item["infoAccountCreate"] = infoAccountCreate
        }
        const lastLog = item.updatedBy[item.updatedBy.length - 1]
        if (lastLog) {
            const infoAccountUpdate = await Account.findOne({
                _id: lastLog.accountId
            }).select("fullName")
            if (infoAccountUpdate) {
                item["infoAccountUpdate"] = infoAccountUpdate
                item["updatedAt"] = lastLog.updatedAt
            }
        }
    }

    res.render("admin/pages/songs/index", {
        pageTitle: "Danh sách bài hát",
        songs: songs,
        filterStatus: filterStatus,
        keyword: objectSearch["keyword"],
        pagination: objectPagination,
    })
}

// [PATCH] /admin/songs/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles
        
        if (!roles.permissions.includes("song_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa bài hát"
            })
        }

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

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await Song.updateOne({
            _id: id
        }, {
            status: status,
            $push: {
                updatedBy: updatedBy
            }
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
    const roles = res.locals.roles

    const type: string = req.body.type
    const ids: string[] = req.body.ids.split(", ")

    const updatedBy = {
        accountId: res.locals.user.id,
        updatedAt: new Date()
    }
    switch (type) {
        case "active":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return
            }
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active",
                $push: {
                    updatedBy: updatedBy
                }
            })
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`)
            res.redirect("back")
            break;
        case "inactive":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return
            }
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive",
                $push: {
                    updatedBy: updatedBy
                }
            })
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát`)
            res.redirect("back")
            break;
        case "delete-all":
            if (!roles.permissions.includes("song_delete")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền xóa bài hát!"
                });
                return
            }
            await Song.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                deleted: true,
                deletedBy: {
                    accountId: res.locals.user.id,
                    deletedAt: new Date()
                }
            })
            req.flash("success", `Xóa thành công ${ids.length} bài hát`)
            res.redirect("back")
            break;
        case "change-position":
            if (!roles.permissions.includes("song_edit")) {
                res.status(403).json({
                    code: 403,
                    message: "Bạn không có quyền chỉnh sửa bài hát!"
                });
                return
            }
            for (const item of ids) {
                const arr = item.split("-")
                const id = arr[0]
                const pos = parseInt(arr[1])
                await Song.updateOne({
                    _id: id
                }, {
                    position: pos,
                    $push: {
                        updatedBy: updatedBy
                    }
                })
            }
            req.flash("success", `Đã cập nhật vị trí cho ${ids.length} bài hát`)
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
        const roles = res.locals.roles

        if (!roles.permissions.includes("song_delete")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền xóa bài hát!"
            });
            return
        }
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
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
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
    const roles = res.locals.roles

    if (!roles.permissions.includes("song_create")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền tạo mới bài hát"
        })
        return
    }
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
    const roles = res.locals.roles

    if (!roles.permissions.includes("song_create")) {
        res.status(403).json({
            code: 403,
            message: "Bạn không có quyền tạo mới bài hát!"
        })
        return
    }
    
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
        description: String,
        createdBy: {
            accountId: String,
            createdAt: Date
        }
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
        audio: audio,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date()
        }
    }

    if (req.body.position) {
        dataSong.position = parseInt(req.body.position)
    } else {
        dataSong.position = countSong + 1
    }

    if (req.body.lyrics) {
        dataSong.lyrics = req.body.lyrics
    }
    
    const newSong = new Song(dataSong)
    console.log(newSong)
    await newSong.save()

    req.flash("success", "Tạo thành công bài hát!")
    res.redirect(`${systemConfig.prefixAdmin}/songs`)
}

// [GET] /admin/songs/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("song_edit")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền chỉnh sửa bài hát"
            })
            return
        }

        const id = req.params.id
        const song = await Song.findOne({
            _id: id,
            deleted: false
        })

        if (!song) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/songs`)
            return
        }

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
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect(`${systemConfig.prefixAdmin}/songs`)
    }    
}

// [PATCH] /admin/songs/edit/:id
export const editPatch = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("song_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa bài hát!"
            })
            return
        }

        const id = req.params.id
        
        const existTopic = await Song.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            res.json({
                code: 400,
                message: "Bài hát không tồn tại!"
            })
            return
        }

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
        
        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await Song.updateOne({
            _id: id
        }, {
            $set: dataSong,
            $push: {
                updatedBy: updatedBy
            }
        })

        req.flash("success", "Cập nhật thành công bài hát!")
        res.redirect(`${systemConfig.prefixAdmin}/songs`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        }) 
    }
}

// [GET] /admin/songs/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("song_view")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền xem chi tiết bài hát!"
            })
            return
        }

        const id = req.params.id
        const song = await Song.findOne({
            _id: id,
            deleted: false
        })

        if (!song) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/songs`)
            return
        }

        const topic = await Topic.findOne({
            deleted: false,
            status: "active",
            _id: song.topicId
        }).select("title")
        song["topicInfo"] = topic

        const singer = await Singer.findOne({
            deleted: false,
            status: "active",
            _id: song.singerId
        }).select("fullName")
        song["singerInfo"] = singer

        res.render("admin/pages/songs/detail.pug", {
            pageTitle: "Chi tiết bài hát",
            song: song,
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect(`${systemConfig.prefixAdmin}/songs`)
    }
}