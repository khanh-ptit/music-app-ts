import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import paginationHelper from "../../helpers/pagination";
import { SortOrder } from "mongoose";
import { systemConfig } from "../../config/system";

// [GET] /admin/singers
export const index = async (req: Request, res: Response) => {
    let find = {
        deleted: false
    }

    // Filter status
    if (req.query.status) {
        find["status"] = req.query.status
    }
    const filterStatus = filterStatusHelper(req.query)
    // End filter status

    // Form search
    const objectSearch = searchHelper(req.query)
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"]
    }
    // End form search

    // Pagination
    const countDocuments = await Singer.countDocuments({
        deleted: false
    })
    const objectPagination = paginationHelper(req.query, res, countDocuments, "singers")
    // console.log(objectPagination)
    // End pagination

    // Sort
    interface ObjectSort {
        [key: string]: SortOrder
    }

    let sort: ObjectSort = {
        position: "desc"
    }

    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString()
        const sortValue = req.query.sortValue.toString() as SortOrder

        sort[sortKey] = sortValue 
    }
    // End sort

    const singers = await Singer
        .find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort(sort)

    res.render("admin/pages/singers/index", {
        pageTitle: "Danh sách ca sĩ",
        filterStatus: filterStatus,
        singers: singers,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    })
}

// [PATCH] /admin/singers/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const status = req.params.status
    
        const existSinger = await Singer.findOne({
            _id: id,
            deleted: false
        })

        if (!existSinger) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!"
            })
            return
        }

        await Singer.updateOne({
            _id: id
        }, {
            status: status
        })
    
        res.status(200).json({
            code: 200, 
            message: "Cập nhật trạng thái thành công!",
            status: status
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    } 
    
}

// [DELETE] /admin/singers/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
    
        const existSinger = await Singer.findOne({
            _id: id,
            deleted: false
        })

        if (!existSinger) {
            res.json({
                code: 404,
                message: "Không tồn tại ca sĩ!"
            })
            return
        }

        await Singer.updateOne({
            _id: id
        }, {
            deleted: true
        })
    
        res.json({
            code: 200,
            message: "Đã xóa thành công"
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    } 
}

// [GET] /admin/singers/create
export const create = async (req: Request, res: Response) => {
    const countSinger = await Singer.countDocuments({
        deleted: false
    })
    
    res.render("admin/pages/singers/create.pug", {
        pageTitle: "Tạo mới ca sĩ",
        countSinger: countSinger
    })
}

// [POST] /admin/singers/create
export const createPost = async (req: Request, res: Response) => {
    interface Singer {
        fullName: String,
        avatar: String,
        description: String,
        position: Number,
        status: String
    }

    const dataSinger: Singer = {
        fullName: req.body.fullName,
        avatar: req.body.avatar,
        description: req.body.description,
        position: parseInt(req.body.position),
        status: req.body.status
    }

    const newSinger = new Singer(dataSinger)
    await newSinger.save()

    req.flash("success", "Tạo thành công ca sĩ!")
    res.redirect(`${systemConfig.prefixAdmin}/singers`)
}

// [PATCH] /admin/singers/change-multi
export const changeMulti = async (req: Request, res: Response) => {
    try {
        // const roles = res.locals.roles

        const type = req.body.type
        const ids = req.body.ids.split(", ")
        switch (type) {
            case "active":
                // if (!roles.permissions.includes("singer_edit")) {
                //     res.status(403).json({
                //         code: 403,
                //         message: "Bạn không có quyền chỉnh sửa chủ đề!"
                //     });
                //     return
                // }
                await Singer.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "active"
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/singers`)
                break;
            case "inactive":
                // if (!roles.permissions.includes("singer_edit")) {
                //     res.status(403).json({
                //         code: 403,
                //         message: "Bạn không có quyền chỉnh sửa chủ đề!"
                //     });
                //     return
                // }
                await Singer.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "inactive"
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/singers`)
                break;
            case "delete-all":
                // if (!roles.permissions.includes("singer_delete")) {
                //     res.status(403).json({
                //         code: 403,
                //         message: "Bạn không có quyền chỉnh sửa chủ đề!"
                //     });
                //     return
                // }
                await Singer.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    deleted: true
                })
                req.flash("success", `Đã xóa ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/singers`)
                break;
            case "change-position":
                // if (!roles.permissions.includes("singer_edit")) {
                //     res.status(403).json({
                //         code: 403,
                //         message: "Bạn không có quyền chỉnh sửa chủ đề!"
                //     });
                //     return
                // }
                for (const item of ids) {
                    const arr = item.split("-")
                    const id = arr[0]
                    const pos = parseInt(arr[1])
                    await Singer.updateOne({
                        _id: id
                    }, {
                        position: pos
                    })
                }
                req.flash("success", `Đã cập nhật vị trí cho ${ids.length} bản ghi`)
                res.redirect("back")
                break;
            default:
                res.json({
                    code: 400,
                    message: "Có lỗi xảy ra!"
                })
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        })
    }
}

// [GET] /admin/singers/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        // const roles = res.locals.roles
        // if (!roles.permissions.includes("singer_edit")) {
        //     res.render("client/pages/error/403", {
        //         message: "Bạn không có quyền chỉnh sửa chủ đề"
        //     })
        //     return
        // }

        const id = req.params.id
        // console.log(id)

        const existSinger = await Singer.findOne({
            _id: id,
            deleted: false
        })

        if (!existSinger) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/singers`)
            return
        }

        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        })
        res.render("admin/pages/singers/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            singer: singer
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect(`${systemConfig.prefixAdmin}/singers`)
    }
}

// [PATCH] /admin/singers/edit/:id
export const editPatch = async (req: Request, res: Response) => {
    try {
        // const roles = res.locals.roles

        // if (!roles.permissions.includes("singer_edit")) {
        //     res.status(403).json({
        //         code: 403,
        //         message: "Bạn không có quyền chỉnh sửa chủ đề!"
        //     });
        //     return
        // }

        const id = req.params.id
        const existSinger = await Singer.findOne({
            _id: id,
            deleted: false
        })

        if (!existSinger) {
            res.json({
                code: 404,
                message: "Ca sĩ không tồn tại!"
            })
            return
        }

        interface Singer {
            fullName: String,
            avatar?: String,
            description?: String,
            position: Number,
            status: String
        }
    
        const dataSinger: Singer = {
            fullName: req.body.fullName,
            position: parseInt(req.body.position),
            status: req.body.status
        }

        if (req.body.avatar) {
            dataSinger.avatar = req.body.avatar
        }

        if (req.body.description) {
            dataSinger.description = req.body.description
        }

        await Singer.updateOne({
            _id: id
        }, dataSinger)

        req.flash("success", "Cập nhật thành công ca sĩ!")
        res.redirect(`${systemConfig.prefixAdmin}/singers`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [GET] /admin/singers/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        // const roles = res.locals.roles

        // if (!roles.permissions.includes("singer_view")) {
        //     res.render("client/pages/error/403", {
        //         message: "Bạn không có quyền xem chủ đề này"
        //     })
        //     return
        // }

        const id = req.params.id

        const existSinger = await Singer.findOne({
            _id: id,
            deleted: false
        })

        if (!existSinger) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/singers`)
            return
        }

        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        })

        res.render("admin/pages/singers/detail.pug", {
            pageTitle: "Chi tiết ca sĩ",
            singer: singer
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ")
        res.redirect(`${systemConfig.prefixAdmin}/singers`)
    }
}