import { Request, Response } from "express";
import md5 from "md5"
import User from "../../models/user.model";
import VerifyUser from "../../models/verify-user.model";
import * as generateHelper from "../../helpers/generate"
import * as sendMailHelper from "../../helpers/sendMail"

// [GET] /user/register
export const register = (req: Request, res: Response) => {
    res.render("client/pages/user/register.pug", {
        pageTitle: "Đăng ký tài khoản"
    })
}

// [POST] /user/register
export const registerPost = async (req: Request, res: Response) => {
    try {
        interface ObjectUser {
            fullName: String,
            email: String,
            password: String,
        }
        const dataUser: ObjectUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: md5(req.body.password)
        }

        const existEmail = await User.findOne({
            email: dataUser.email,
            deleted: false
        })

        if (existEmail) {
            req.flash("error", "Email đã được đăng ký!")
            res.redirect("back")
            return
        }

        const newUser = new User(dataUser)
        console.log(newUser)
        await newUser.save()

        // Gửi OTP về mail của nó để xác thực rồi mới cho đăng nhập
        
        // Bước 1: Tạo ra bản ghi email kèm password
        const otp = generateHelper.generateRandomNumber(8)
        const objectVerifyUser = {
            email: dataUser.email,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        }
        const newVerifyUser = new VerifyUser(objectVerifyUser)
        console.log(newVerifyUser)
        await newVerifyUser.save()

        // Bước 2: Gửi mail OTP về mail người dùng
        const subject = `Mã xác thực OTP kích hoạt tài khoản`
        const html = `
            Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
        `
        sendMailHelper.sendMail(dataUser.email.toString(), subject, html)
        res.redirect(`/user/verifyUser?email=${dataUser.email}`)
        // await newUser.save()
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra")
        res.redirect("back")
    }
}

// [GET] /user/verifyUser
export const verifyUser = (req: Request, res: Response) => {
    const email: string = req.query.email.toString()
    res.render("client/pages/user/verify-user", {
        pageTitle: "Xác thực tài khoản",
        email: email
    })
}

// [POST] /user/verifyUser
export const verifyUserPost = async (req: Request, res: Response) => {
    try {
        interface ObjectVerifyUser {
            email: String,
            otp: String
        }

        const objectVerifyUser: ObjectVerifyUser = {
            email: req.body.email,
            otp: req.body.otp
        }

        const checkUserOtp = await VerifyUser.findOne({
            email: objectVerifyUser.email,
            otp: objectVerifyUser.otp
        })

        if (!checkUserOtp) {
            req.flash("error", "OTP không hợp lệ!")
            res.redirect("back")
            return
        }
        
        await User.updateOne({
            email: checkUserOtp.email
        }, {
            status: "active"
        })

        req.flash("success", "Xác thực thành công. Đăng nhập để tiếp tục!")
        res.redirect("/user/login")

    } catch (error) {
        res.status(4040).json({
            code: 400, 
            message: "Có lỗi xảy ra!"
        })
    }
}

// [GET] /user/login
export const login = async (req: Request, res: Response) => {
    res.render("client/pages/user/login.pug", {
        pageTitle: "Đăng nhập tài khoản"
    })
}