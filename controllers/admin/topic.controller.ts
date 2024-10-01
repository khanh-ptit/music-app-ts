import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { systemConfig } from "../../config/system";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";
import { SortOrder } from "mongoose";

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

    let sort = {}

    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString()
        const sortValue = req.query.sortValue.toString() as SortOrder

        sort[sortKey] = sortValue
    }

    const topics = await Topic.find(find).sort(sort)
    // console.log(topics)
    res.render("admin/pages/topics/index", {
        pageTitle: "Danh sách chủ đề",
        topics: topics,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword
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