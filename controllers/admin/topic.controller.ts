import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { systemConfig } from "../../config/system";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";

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
    
    const topics = await Topic.find(find)
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