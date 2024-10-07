import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { systemConfig } from "../../config/system";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";
import paginationHelper from "../../helpers/pagination";
import Account from "../../models/account.model";

// [GET] /admin/topics/
export const index = async (req: Request, res: Response) => {
    const roles = res.locals.roles

    if (!roles.permissions.includes("topic_view")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền xem danh sách chủ đề"
        })
        return
    }

    const filterStatus = filterStatusHelper(req.query)
    let find = {
        deleted: false
    }

    // Filter status 
    if (req.query.status) {
        find["status"] = req.query.status
    }
    // End filter status 

    // Search
    const objectSearch = searchHelper(req.query)
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"]
    }
    // End search
    
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

    // Pagination
    const countDocuments = await Topic.countDocuments({
        deleted: false
    })
    const objectPagination = paginationHelper(req.query, res, countDocuments, "topics")
    if (!objectPagination) return
    // End pagination

    const topics = await Topic
        .find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
    
    for (const item of topics) {
        if (item.createdBy.createdAt) {
            const infoAccountCreate = await Account.findOne({
                _id: item.createdBy.accountId
            }).select("fullName")
            if (infoAccountCreate) {
                item["infoAccountCreate"] = infoAccountCreate
            }
        }

        if (item.updatedBy.length > 0) {
            const lastLog = item.updatedBy[item.updatedBy.length - 1]
            const infoAccountUpdate = await Account.findOne({
                _id: lastLog.accountId
            })
            if (infoAccountUpdate) {
                item["infoAccountUpdate"] = infoAccountUpdate
                item["updatedAt"] = lastLog.updatedAt
            }
        }
    }

    res.render("admin/pages/topics/index", {
        pageTitle: "Danh sách chủ đề",
        topics: topics,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    })
}

// [PATCH] /admin/topics/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("topic_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa chủ đề!"
            });
            return
        }
        
        const id = req.params.id
        const status = req.params.status

        const existTopic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            })
            return
        }

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await Topic.updateOne({
            _id: id
        }, {
            status: status, 
            $push: {
                updatedBy: updatedBy
            }
        })

        req.flash("success", "Cập nhật thành công trạng thái!")
        res.redirect(`${systemConfig.prefixAdmin}/topics`)
    } catch {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [DELETE] /admin/topics/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("topic_delete")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền xóa chủ đề!"
            });
            return
        }

        const id = req.params.id
        
        const existTopic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            })
            return
        }

        await Topic.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
        })

        req.flash("success", "Xóa thành công chủ đề!")
        res.redirect(`${systemConfig.prefixAdmin}/topics`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [PATCH] /admin/topics/change-multi
export const changeMulti = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        const type = req.body.type
        const ids = req.body.ids.split(", ")

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        switch (type) {
            case "active":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return
                }
                await Topic.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "active",
                    $push: {
                        updatedBy: updatedBy
                    }
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
                break;
            case "inactive":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return
                }
                await Topic.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "inactive",
                    $push: {
                        updatedBy: updatedBy
                    }
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
                break;
            case "delete-all":
                if (!roles.permissions.includes("topic_delete")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return
                }
                await Topic.updateMany({
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
                req.flash("success", `Đã xóa ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
                break;
            case "change-position":
                if (!roles.permissions.includes("topic_edit")) {
                    res.status(403).json({
                        code: 403,
                        message: "Bạn không có quyền chỉnh sửa chủ đề!"
                    });
                    return
                }
                for (const item of ids) {
                    const arr = item.split("-")
                    const id = arr[0]
                    const pos = parseInt(arr[1])
                    await Topic.updateOne({
                        _id: id
                    }, {
                        position: pos,
                        $push: {
                            updatedBy: updatedBy
                        }
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

// [GET] /admin/topics/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles
        if (!roles.permissions.includes("topic_edit")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền chỉnh sửa chủ đề"
            })
            return
        }

        const id = req.params.id
        // console.log(id)

        const existTopic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/topics`)
            return
        }

        const topic = await Topic.findOne({
            _id: id,
            deleted: false
        })
        res.render("admin/pages/topics/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            topic: topic
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect(`${systemConfig.prefixAdmin}/topics`)
    }
}

// [PATCH] /admin/topics/edit/:id
export const editPatch = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("topic_edit")) {
            res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa chủ đề!"
            });
            return
        }

        const id = req.params.id
        const existTopic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            res.json({
                code: 400,
                message: "Topic không tồn tại!"
            })
            return
        }

        interface Topic {
            title: String,
            avatar?: String,
            description?: String,
            position: Number,
            status: String
        }
    
        const dataTopic: Topic = {
            title: req.body.title,
            position: parseInt(req.body.position),
            status: req.body.status
        }

        if (req.body.avatar) {
            dataTopic.avatar = req.body.avatar
        }

        if (req.body.description) {
            dataTopic.description = req.body.description
        }

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await Topic.updateOne({
            _id: id
        }, {
            $set: dataTopic,
            $push: {
                updatedBy: updatedBy
            }
        })

        req.flash("success", "Cập nhật thành công chủ đề!")
        res.redirect(`${systemConfig.prefixAdmin}/topics`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [GET] /admin/topics/create
export const create = async (req: Request, res: Response) => {
    const roles = res.locals.roles

    if (!roles.permissions.includes("topic_create")) {
        res.render("client/pages/error/403", {
            message: "Bạn không có quyền tạo mới chủ đề"
        })
        return
    }

    const countTopic = await Topic.countDocuments({
        deleted: false
    })
    res.render("admin/pages/topics/create.pug", {
        pageTitle: "Thêm mới chủ đề",
        countTopic: countTopic
    })
}

// [POST] /admin/topics/create
export const createPost = async (req: Request, res: Response) => {
    const roles = res.locals.roles

    if (!roles.permissions.includes("topic_create")) {
        res.status(403).json({
            code: 403,
            message: "Bạn không có quyền thực hiện thao tác này!"
        });
        return
    }
    
    interface Topic {
        title: String,
        avatar: String,
        description: String,
        position: Number,
        status: String,
        createdBy: {
            accountId: String,
            createdAt: Date
        }
        
    }

    const dataTopic: Topic = {
        title: req.body.title,
        avatar: req.body.avatar,
        description: req.body.description,
        position: parseInt(req.body.position),
        status: req.body.status,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date()
        }
    }

    const newTopic = new Topic(dataTopic)
    await newTopic.save()

    req.flash("success", "Tạo thành công chủ đề!")
    res.redirect(`${systemConfig.prefixAdmin}/topics`)
}

// [GET] /admin/topics/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const roles = res.locals.roles

        if (!roles.permissions.includes("topic_view")) {
            res.render("client/pages/error/403", {
                message: "Bạn không có quyền xem chủ đề này"
            })
            return
        }


        const id = req.params.id

        const existTopic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        if (!existTopic) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/topics`)
            return
        }

        const topic = await Topic.findOne({
            _id: id,
            deleted: false
        })

        res.render("admin/pages/topics/detail.pug", {
            pageTitle: "Chi tiết chủ đề",
            topic: topic
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ")
        res.redirect(`${systemConfig.prefixAdmin}/topics`)
    }
}