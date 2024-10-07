import { Request, Response } from "express";
import User from "../../models/user.model";
import filterStatusHelper from "../../helpers/filterStatusUser";
import Account from "../../models/account.model";

// [GET] /admin/users
export const index = async (req: Request, res: Response) => {
    const filterStatus = filterStatusHelper(req.query)
    
    let find = {
        deleted: false
    }

    if (req.query.status) {
        find["status"] = req.query.status
    }

    const users = await User
        .find(find)
        .select("-password -tokenUser")

    for (const item of users) {
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
    
    res.render("admin/pages/users/index", {
        pageTitle: "Tài khoản Client",
        users: users,
        filterStatus: filterStatus
    })
}

// [PATCH] /admin/users/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const status = req.params.status
        const id = req.params.id

        const existUser = await User.findOne({
            _id: id,
            deleted: false
        })


        if (!existUser) {
            res.json({
                code: 400,
                message: "Chú định bịp à?"
            })
            return
        }

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await User.updateOne({
            _id: id
        }, {
            status: status,
            $push: {
                updatedBy: updatedBy
            }
        })

        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            status: status
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Chú định bịp à?"
        })
    } 
}

// [DELETE] /admin/users/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const existUser = await User.findOne({
            _id: id,
            deleted: false
        })


        if (!existUser) {
            res.json({
                code: 400,
                message: "Chú định bịp à?"
            })
            return
        }

        await User.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
        })

        res.json({
            code: 200,
            message: "Đã xóa tài khoản!",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        })
    }
}