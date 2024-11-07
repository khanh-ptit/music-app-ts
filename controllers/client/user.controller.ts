import { Request, Response } from "express";
import md5 from "md5"
import User from "../../models/user.model";
import VerifyUser from "../../models/verify-user.model";
import * as generateHelper from "../../helpers/generate"
import * as sendMailHelper from "../../helpers/sendMail"
import * as sendSmsHelper from "../../helpers/sendSms"
import ForgotPassword from "../../models/forgot-password.model";

// [GET] /user/register
export const register = (req: Request, res: Response) => {
    const token = req.cookies.tokenUser
    if (token) {
        res.redirect("/")
        return
    }
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
            createdAt: Date
        }
        const dataUser: ObjectUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: md5(req.body.password),
            createdAt: new Date()
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
        // console.log(newUser)
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
        // console.log(newVerifyUser)
        await newVerifyUser.save()

        // Bước 2: Gửi mail OTP về mail người dùng
        const subject = `Mã xác thực OTP kích hoạt tài khoản`
        const html = `
            Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
        `
        sendMailHelper.sendMail(dataUser.email.toString(), subject, html)
        res.redirect(`/user/verify-user?email=${dataUser.email}`)
        // await newUser.save()
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra")
        res.redirect("back")
    }
}

// [GET] /user/verify-user
export const verifyUser = (req: Request, res: Response) => {
    const email: string = req.query.email.toString()
    res.render("client/pages/user/verify-user", {
        pageTitle: "Xác thực tài khoản",
        email: email
    })
}

// [POST] /user/verify-user
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
    try {
        const token = req.cookies.tokenUser
        if (token) {
            res.redirect("/")
            return
        }
    
        res.render("client/pages/user/login.pug", {
            pageTitle: "Đăng nhập tài khoản"
        })
    } catch (error) {
        console.log(error)
    }
}

// [POST] /user/login
export const loginPost = async (req: Request, res: Response) => {
    try {
        interface ObjectLogin {
            email: string,
            password: string
        }

        const dataLogin: ObjectLogin = {
            email: req.body.email,
            password: md5(req.body.password)
        }

        const user = await User.findOne({
            email: dataLogin.email,
            deleted: false
        })

        if (!user) {
            req.flash("error", "Email không tồn tại trong hệ thống!")
            res.redirect("back")
            return
        }

        if (user.status == "initial") {
            req.flash("error", "Vui lòng xác thực tài khoản trước khi đăng nhập!")
            res.redirect("back")
            return
        } 
        
        if (user.status == "inactive") {
            req.flash("error", "Tài khoản đã bị vô hiệu hóa!")
            res.redirect("back")
            return
        }

        if (dataLogin.password != user.password) {
            req.flash("error", "Email hoặc mật khẩu không đúng!")
            res.redirect("back")
            return
        }
        res.cookie("tokenUser", user.tokenUser)
        req.flash("success", "Đăng nhập thành công!")
        res.locals.user = user
        res.redirect("/")

    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!")
        res.redirect("back")
    }
}

// [GET] /user/logout
export const logout = async (req: Request, res: Response) => {
    res.clearCookie("tokenUser")
    res.redirect("/user/login")
}

// [GET] /user/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
    res.render("client/pages/user/verify-email", {
        pageTitle: "Xác thực email"
    })
}

// [POST] /user/verify-email
export const verifyEmailPost = async (req: Request, res: Response) => {
    const email = req.body.email
    const user = await User.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!")
        res.redirect("back")
        return
    }

    if (user.status == "active") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!")
        res.redirect("back")
        return
    }

    if (user.status == "inactive") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!")
        res.redirect("back")
        return
    }

    // Gửi OTP về mail của nó để xác thực rồi mới cho đăng nhập
        
    // Bước 1: Tạo ra bản ghi email kèm password
    const otp = generateHelper.generateRandomNumber(8)
    const objectVerifyUser = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    }
    const newVerifyUser = new VerifyUser(objectVerifyUser)
    // console.log(newVerifyUser)
    await newVerifyUser.save()

    // Bước 2: Gửi mail OTP về mail người dùng
    const subject = `Mã xác thực OTP kích hoạt tài khoản`
    const html = `
        Mã OTP kích hoạt tài khoản là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
    `
    sendMailHelper.sendMail(email.toString(), subject, html)
    res.redirect(`/user/verify-user?email=${email}`)
}

// [GET] /user/password/forgot
export const passwordForgot = async (req: Request, res: Response) => {
    res.render("client/pages/user/password-forgot.pug", {
        pageTitle: "Lấy lại mật khẩu"
    })
}

// [POST] /user/password/forgot
export const passwordForgotPost = async (req: Request, res: Response) => {
    const email = req.body.email

    const existEmail = await User.findOne({
        email: email,
        deleted: false
    })

    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!")
        res.redirect("back")
        return
    }

    // Bước 1: Tạo otp rồi lưu bản ghi đó vào collection forgot-password
    const otp = generateHelper.generateRandomNumber(8)
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    }
    const newForgotPassword = new ForgotPassword(objectForgotPassword)
    await newForgotPassword.save()

    // Bước 2: Gửi OTP về mail
    const subject = `Mã xác thực OTP đặt lại mật khẩu`
    const html = `
        Mã OTP đặt lại mật khẩu là <b>${otp}</b>. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.
    `
    sendMailHelper.sendMail(email.toString(), subject, html)
    res.redirect(`/user/password/otp?email=${email}`)
}

// [GET] /user/password/forgot
export const passwordForgotPhone = async (req: Request, res: Response) => {
    res.render("client/pages/user/password-forgot-phone.pug", {
        pageTitle: "Lấy lại mật khẩu"
    })
}

// [POST] /user/password/forgot-phone
export const passwordForgotPhonePost = async (req: Request, res: Response) => {
    const phone = req.body.phone;

    const existPhone = await User.findOne({
        phone: phone,
        deleted: false
    });

    if (!existPhone) {
        req.flash("error", "Số điện thoại không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }

    // Bước 1: Tạo OTP rồi lưu bản ghi vào collection forgot-password
    const otp = generateHelper.generateRandomNumber(8);  // Tạo OTP 8 chữ số
    const objectForgotPassword = {
        phone: phone,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)  // OTP hết hạn sau 3 phút
    };
    const newForgotPassword = new ForgotPassword(objectForgotPassword);
    await newForgotPassword.save();

    // Bước 2: Gửi OTP qua SMS
    const content = `Mã OTP đặt lại mật khẩu là ${otp}. Lưu ý không được chia sẻ mã này. Thời hạn sử dụng là 3 phút.`;
    const sender = '84923361329';  // Tên người gửi SMS (có thể thay đổi)
    sendSmsHelper.sendSMS([phone], content, 3);  // Gửi OTP qua SMS

    res.redirect(`/user/password/otp?phone=${phone}`);  // Redirect đến trang OTP để nhập mã
};


// [GET] /user/password/otp
export const passwordOtp = async (req: Request, res: Response) => {
    const email = req.query.email
    res.render("client/pages/user/password-otp.pug", {
        pageTitle: "Nhập mã OTP xác thực",
        email: email
    })
}

// [POST] /user/password/otp
export const passwordOtpPost = async (req: Request, res: Response) => {
    const email = req.body.email
    const otp = req.body.otp
    const checkForgotPassword = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })
    
    if (!checkForgotPassword) {
        req.flash("error", "OTP không hợp lệ!")
        res.redirect("back")
        return
    }

    const user = await User.findOne({
        email: email,
        deleted: false
    })
    res.cookie("tokenUser", user.tokenUser)
    res.redirect("/user/password/reset")
}

// [GET] /user/password/reset
export const passwordReset = (req: Request, res: Response) => {
    res.render("client/pages/user/password-reset", {
        pageTitle: "Đặt lại mật khẩu"
    })    
}

// [POST] /user/password/reset
export const passwordResetPost = async (req: Request, res: Response) => {
    const tokenUser = req.cookies.tokenUser
    const password = md5(req.body.password)
    const user = await User.findOne({
        tokenUser: tokenUser,
        deleted: false
    })
    if (user.password == password) {
        req.flash("error", "Mật khẩu mới không được trùng với mật khẩu cũ!")
        res.redirect("back")
        return
    }

    await User.updateOne({
        tokenUser: tokenUser
    }, {
        password: password
    })

    res.clearCookie("tokenUser")
    req.flash("success", "Đổi mật khẩu thành công. Vui lòng đăng nhập để tiếp tục")
    res.redirect("/user/login")
}

// [GET] /user/info
export const info = async (req: Request, res: Response) => {
    const user = res.locals.user
    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản",
        user: user
    })
}

// [GET] /user/edit
export const edit = async (req: Request, res: Response) => {
    res.render("client/pages/user/edit", {
        pageTitle: "Chỉnh sửa tài khoản"
    })
}

// [PATCH] /user/update-avatar
export const updateAvatar = async (req: Request, res: Response) => {
    try {
        const id = res.locals.user.id
        console.log(id)
        console.log(req.body)
        await User.updateOne({
            _id: id
        }, {
            avatar: req.body.avatar
        })
        res.redirect("back")
    } catch (error) {
        res.redirect("back")
    }
}

// [PATCH] /user/edit
export const editPatch = async (req: Request, res: Response) => {
    try {
        const id = res.locals.user.id
        await User.updateOne({
            _id: id
        }, req.body)
        res.redirect("back")
    } catch (error) {
        res.redirect("back")
    }
}