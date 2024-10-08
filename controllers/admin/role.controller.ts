import { Request, Response } from "express";
import { systemConfig } from "../../config/system";
import Role from "../../models/role.model";
import Account from "../../models/account.model";

// [GET] /admin/roles
export const index = async (req: Request, res: Response) => {
    const roles = await Role.find({
        deleted: false
    })

    for (const item of roles) {
        if (item.createdBy.createdAt) {
            if (item.createdBy.createdAt) {
                const infoAccountCreate = await Account.findOne({
                    _id: item.createdBy.accountId
                }).select("fullName")
                if (infoAccountCreate) {
                    item["infoAccountCreate"] = infoAccountCreate
                }
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

    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        roles: roles
    })
}

// [GET] /admin/roles/create
export const create = (req: Request, res: Response) => {
    res.render("admin/pages/roles/create.pug", {
        pageTitle: "Tạo mới nhóm quyền"
    })
}

// [POST] /admin/roles/create
export const createPost = async (req: Request, res: Response) => {
    interface Role {
        title: String,
        description: String,
        createdBy: {
            accountId: String,
            createdAt: Date
        }
    }

    const dataRole: Role = {
        title: req.body.title,
        description: req.body.description,
        createdBy: {
            accountId: res.locals.user.id,
            createdAt: new Date()
        }
    }

    const newRole = new Role(dataRole)

    await newRole.save()

    req.flash("success", "Tạo nhóm quyền thành công!")
    res.redirect(`${systemConfig.prefixAdmin}/roles`)
}

// [DELETE] /admin/roles/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        
        const existRole = await Role.findOne({
            _id: id,
            deleted: false
        })

        if (!existRole) {
            res.json({
                code: 400,
                message: "Nhóm quyền không tồn tại!"
            })
        }

        await Role.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user.id,
                deletedAt: new Date()
            }
        })

        req.flash("success", "Xoá thành công nhóm quyền!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [GET] /admin/roles/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        // console.log(id)

        const existRole = await Role.findOne({
            _id: id,
            deleted: false
        })

        if (!existRole) {
            req.flash("error", "Đường dẫn không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/roles`)
            return
        }

        const role = await Role.findOne({
            _id: id,
            deleted: false
        })
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            role: role
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không tồn tại!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}

// [PATCH] /admin/roles/edit/:id
export const editPatch = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const existRole = await Role.findOne({
            _id: id,
            deleted: false
        })

        if (!existRole) {
            res.json({
                code: 400,
                message: "Role không tồn tại!"
            })
            return
        }

        interface Role {
            title: String,
            description?: String
        }
    
        const dataRole: Role = {
            title: req.body.title,
        }

        if (req.body.description) {
            dataRole.description = req.body.description
        }

        const updatedBy = {
            accountId: res.locals.user.id,
            updatedAt: new Date()
        }

        await Role.updateOne({
            _id: id
        }, {
            $set: dataRole,
            $push: {
                updatedBy: updatedBy
            }
        })

        req.flash("success", "Cập nhật thành công role!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    } catch (error) {
        res.json({
            code: 400,
            message: "Nghịch cái đb"
        })
    }
}

// [GET] /admin/roles/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const existRole = await Role.findOne({
            _id: id,
            deleted: false
        })

        if (!existRole) {
            req.flash("error", "Role không tồn tại!")
            res.redirect(`${systemConfig.prefixAdmin}/roles`)
            return
        }

        const role = await Role.findOne({
            _id: id,
            deleted: false
        })

        res.render("admin/pages/roles/detail.pug", {
            pageTitle: "Chi tiết chủ đề",
            role: role
        })
    } catch (error) {
        req.flash("error", "Đường dẫn không hợp lệ")
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}

// [GET] /admin/roles/permissions
export const permissions = async (req: Request, res: Response) => {
    const roles = await Role.find({
        deleted: false
    })

    res.render("admin/pages/roles/permissions.pug", {
        pageTitle: "Phân quyền",
        roles: roles
    })
}

// [PATCH] /admin/roles/permissions
export const permissionsPatch = async (req: Request, res: Response) => {
    let permissions = JSON.parse(req.body.permissions)
    for (const item of permissions) {
        const id = item.id
        const itemPermission = item.permissions
        // console.log(id, itemPermission)
        await Role.updateOne({
            _id: id
        }, {
            permissions: itemPermission
        })
    }
    req.flash("success", "Đã cập nhật phân quyền!")
    res.redirect("back")
}