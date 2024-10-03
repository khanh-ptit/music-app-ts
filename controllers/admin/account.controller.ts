import { Request, Response } from "express"
import Role from "../../models/role.model"
import md5 from "md5"
import Account from "../../models/account.model"
import { systemConfig } from "../../config/system"
import filterStatusHelper from "../../helpers/filterStatus"
import paginationHelper from "../../helpers/pagination"

// [GET] /admin/accounts/
export const index = async (req: Request, res: Response) => {
    let find = {
        deleted: false
    }
    
    // Filter status
    const filterStatus = filterStatusHelper(req.query)
    if (req.query.status) {
        find["status"] = req.query.status
    }
    // End filter status


    // Pagination
    const countDocuments = await Account.countDocuments(find)
    const objectPagination = paginationHelper(req.query, res, countDocuments, "accounts")
    // End pgination

    const accounts = await Account
        .find(find)
        .select("-token -password")

    for (const item of accounts) {
        const roleInfo = await Role.findOne({
            _id: item.role_id,
            deleted: false
        })
        item["roleInfo"] = roleInfo
    }

    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Tài khoản admin",
        accounts: accounts,
        filterStatus: filterStatus,
        pagination: objectPagination
    })
}

// [GET] /admin/accounts/create
export const create = async (req: Request, res: Response) => {
    const roles = await Role.find({
        deleted: false
    })

    res.render("admin/pages/accounts/create.pug", {
        pageTitle: "Tạo mới tài khoản admin",
        roles: roles
    })
}

// [POST] /admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
    const existEmail = await Account.findOne({
        email: req.body.email,
        deleted: false
    })

    if (existEmail) {
        req.flash("error", "Email đã tồn tại!")
        res.redirect("back")
        return
    }
    
    interface Account {
        fullName: String,
        password: String,
        email: String,
        phone: String,
        role_id: String,
        avatar: String,
        status: String
    }

    const dataAccount: Account = {
        fullName: req.body.fullName,
        password: md5(req.body.password),
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        status: req.body.status,
        avatar: req.body.avatar
    }

    const newAccount = new Account(dataAccount)
    await newAccount.save()
    req.flash("success", "Tạo thành công tài khoản!")
    res.redirect(`${systemConfig.prefixAdmin}/accounts`)
}

// [PATCH] /admin/accounts/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const status = req.params.status
    
        const existAccount = await Account.findOne({
            _id: id,
            deleted: false
        })

        if (!existAccount) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!"
            })
            return
        }

        await Account.updateOne({
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

// [DELETE] /admin/accounts/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
    
        const existAccount = await Account.findOne({
            _id: id,
            deleted: false
        })

        if (!existAccount) {
            res.json({
                code: 404,
                message: "Không tồn tại tài khoản!"
            })
            return
        }

        await Account.updateOne({
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