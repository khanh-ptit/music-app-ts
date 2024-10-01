import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { systemConfig } from "../../config/system";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";
import { skip } from "node:test";

// [GET] /admin/topics/
export const index = async (req: Request, res: Response) => {
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

    let sort: ObjectSort = {}

    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString()
        const sortValue = req.query.sortValue.toString() as SortOrder

        sort[sortKey] = sortValue
    }

    // Pagination
    const objectPagination = {
        limitItems: 4,
        skip: 0,
        currentPage: 1
    }

    const countDocuments = await Topic.countDocuments({
        deleted: false
    })
    objectPagination["totalPages"] = Math.ceil(countDocuments / objectPagination.limitItems)
    if (req.query.page) {
        let page = parseInt(req.query.page.toString())
        if (page < 1) {
            res.redirect(`?page=1`)
            return
        } else if (page > objectPagination["totalPages"]) {
            res.redirect(`?page=${objectPagination["totalPages"]}`)
            return
        }
        objectPagination.currentPage = page
        objectPagination.skip = (page - 1) * objectPagination.limitItems
    }
    // End pagination

    const topics = await Topic
        .find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
    // console.log(topics)
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

        await Topic.updateOne({
            _id: id
        }, {
            status: status
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
            deleted: true
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
        const type = req.body.type
        const ids = req.body.ids.split(", ")
        switch (type) {
            case "active":
                await Topic.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "active"
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
                break;
            case "inactive":
                await Topic.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: "inactive"
                })
                req.flash("success", `Đã cập nhật trạng thái cho ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
                break;
            case "delete-all":
                await Topic.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    deleted: true
                })
                req.flash("success", `Đã xóa ${ids.length} bản ghi`)
                res.redirect(`${systemConfig.prefixAdmin}/topics`)
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
        await Topic.updateOne({
            _id: id
        }, dataTopic)

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
    const countTopic = await Topic.countDocuments({
        deleted: false
    })
    res.render("admin/pages/topics/create.pug", {
        pageTitle: "Thêm mới danh mục",
        countTopic: countTopic
    })
}

// [POST] /admin/topics/create
export const createPost = async (req: Request, res: Response) => {
    interface Topic {
        title: String,
        avatar: String,
        description: String,
        position: Number,
        status: String
    }

    const dataTopic: Topic = {
        title: req.body.title,
        avatar: req.body.avatar,
        description: req.body.description,
        position: parseInt(req.body.position),
        status: req.body.status
    }

    const newTopic = new Topic(dataTopic)
    await newTopic.save()

    req.flash("success", "Tạo thành công chủ đề!")
    res.redirect(`${systemConfig.prefixAdmin}/topics`)
}