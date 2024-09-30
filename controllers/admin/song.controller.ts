import { Request, Response } from "express";
import Song from "../../models/song.model";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";

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
