import { Request, Response } from "express";
import md5 from "md5"
import User from "../../models/user.model";
import VerifyUser from "../../models/verify-user.model";
import * as generateHelper from "../../helpers/generate"
import * as sendMailHelper from "../../helpers/sendMail"
import textflow from "textflow.js"
import ForgotPassword from "../../models/forgot-password.model";
import cron from "node-cron";
import VerifyLogin from "../../models/verify-login.model";
textflow.useKey("Ef42D9XEN1OEm1YfrKnAfoLIBzYa9nGYEDOWjJgo6NDI9tkG3EpSNK71HtCyrWM0"); // Thay thế bằng API Key thực tế


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
            createdAt: Date,
            phone: String
        }
        const dataUser: ObjectUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: md5(req.body.password),
            createdAt: new Date(),
            phone: req.body.phone
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

        const existPhone = await User.findOne({
            phone: dataUser.phone,
            deleted: false
        })

        if (existPhone) {
            req.flash("error", "Số điện thoại đã được đăng ký!")
            res.redirect("back")
            return
        }

        const newUser = new User(dataUser)
        // console.log(newUser)
        await newUser.save()

        // Gửi OTP về mail của nó để xác thực rồi mới cho đăng nhập
        
        // Bước 1: Tạo ra bản ghi email kèm password
        const otp = generateHelper.generateRandomNumber(6)
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                    Kích Hoạt Tài Khoản
                </div>
                <div style="padding: 20px; line-height: 1.6;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #555;">
                        <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                    </p>
                    <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                    <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
                </div>
                <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                    Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
                </div>
            </div>
        `;
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
            identifier: string; // Email hoặc số điện thoại
            password: string;
        }

        const dataLogin: ObjectLogin = {
            identifier: req.body.emailOrPhone, // Lấy giá trị từ frontend
            password: md5(req.body.password), // Hash mật khẩu
        };

        // Kiểm tra người dùng nhập email hay số điện thoại
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataLogin.identifier);
        const query = isEmail
            ? { email: dataLogin.identifier, deleted: false }
            : { phone: dataLogin.identifier, deleted: false };

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findOne(query);

        if (!user) {
            req.flash("error", isEmail ? "Email không tồn tại trong hệ thống!" : "Số điện thoại không tồn tại trong hệ thống!");
            res.redirect("back");
            return;
        }

        // Kiểm tra trạng thái tài khoản
        if (user.status === "inactive") {
            if (user.lockedUntil && user.lockedUntil <= new Date()) {
                // Mở khóa tài khoản và chuyển trạng thái thành active
                await User.updateOne({ _id: user._id }, { 
                    $set: { status: "active", lockedUntil: null, lockedBy: null }
                });
            } else {
                req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
                res.redirect("back");
                return;
            }
        }

        if (user.status == "initial") {
            req.flash("error", "Tài khoản của bạn chưa được kích hoạt. Vui lòng kích hoạt trước !");
            res.redirect("back");
            return;
        }

        // Kiểm tra số lần yêu cầu OTP trong 3 phút
        const recentVerifications = await VerifyLogin.find({
            email: isEmail ? dataLogin.identifier : null, 
            phone: !isEmail ? dataLogin.identifier : null,
            expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) }
        });

        if (recentVerifications.length >= 3) {
            // Khóa tài khoản nếu đã yêu cầu quá 3 lần
            user.status = "inactive";
            user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);  // Khóa trong 3 phút
            user.lockedBy = "passwordForgotPost"; // Lý do khóa tài khoản
            await user.save();

            req.flash("error", "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.");
            res.redirect("back");
            return;
        }

        // Kiểm tra mật khẩu
        if (dataLogin.password != user.password) {
            req.flash("error", "Thông tin đăng nhập không chính xác!");
            res.redirect("back");
            return;
        }

        // Tạo OTP mới và lưu vào cơ sở dữ liệu
        const secretKey = process.env.SECRET_KEY_HOTP; // Khóa bí mật (nên lưu trữ an toàn, ví dụ trong file .env)
        const counter = Math.floor(Date.now() / 1000); // Dùng timestamp hiện tại làm counter
        const otp = generateHelper.generateHOTP(secretKey, counter, 6); // Tạo OTP 6 chữ số
        const objectVerifyLogin = {
            email: isEmail ? dataLogin.identifier : null, // Gửi OTP qua email nếu là email
            phone: !isEmail ? dataLogin.identifier : null, // Gửi OTP qua số điện thoại nếu là phone
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000) // OTP có hiệu lực trong 3 phút
        };

        const newVerifyLogin = new VerifyLogin(objectVerifyLogin);
        await newVerifyLogin.save();

        // Gửi OTP qua email hoặc số điện thoại tùy thuộc vào thông tin người dùng
        if (isEmail) {
            // Gửi OTP qua email
            const subject = `Mã xác thực OTP đăng nhập tài khoản`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                        OTP đăng nhập tài khoản
                    </div>
                    <div style="padding: 20px; line-height: 1.6;">
                        <p style="font-size: 16px; color: #333;">Xin chào,</p>
                        <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #555;">
                            <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                        </p>
                        <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                        <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
                    </div>
                    <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                        Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
                    </div>
                </div>
            `;
            sendMailHelper.sendMail(dataLogin.identifier, subject, html);
        } else {
            // Gửi OTP qua số điện thoại
            const message = `Mã OTP đăng nhập của bạn là: ${otp}. Mã OTP này có hiệu lực trong 3 phút.`;
            
            // Chuyển đổi số điện thoại sang định dạng quốc tế (Thêm mã vùng +84)
            const phone = dataLogin.identifier;
            const formattedPhone = phone.startsWith('0') ? '+84' + phone.slice(1) : '+84' + phone;

            // Gửi tin nhắn (Kích hoạt dòng này sau khi tích hợp dịch vụ gửi SMS)
            console.log(formattedPhone, message)
            await textflow.sendSMS(formattedPhone, message);
        }

        // Chuyển hướng người dùng đến trang nhập OTP
        res.redirect(`/user/verify-login?identifier=${dataLogin.identifier}`);

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};


// [GET] /user/verify-email
export const verifyLogin = async (req: Request, res: Response) => {
    const { identifier } = req.query;  // Lấy email hoặc số điện thoại từ query string

    if (!identifier) {
        req.flash("error", "Thiếu thông tin đăng nhập.");
        return res.redirect("back");
    }

    res.render("client/pages/user/verify-login.pug", {
        pageTitle: "Xác thực OTP",
        emailOrPhone: identifier // Truyền email hoặc số điện thoại vào view
    });
}

// [POST] /user/verify-login
export const verifyLoginPost = async (req: Request, res: Response) => {
    const { emailOrPhone, otp } = req.body;  // Lấy email hoặc số điện thoại và OTP từ body request

    try {
        // Tìm bản ghi OTP mới nhất cho email hoặc số điện thoại
        const latestVerifyRecord = await VerifyLogin.findOne({
            $or: [
                { email: emailOrPhone },  // Kiểm tra email
                { phone: emailOrPhone }   // Kiểm tra phone
            ],
            expireAt: { $gte: new Date() } // Kiểm tra OTP chưa hết hạn
        }).sort({ createdAt: -1 });  // Lấy bản ghi OTP mới nhất

        // Kiểm tra xem có tìm thấy bản ghi OTP mới nhất và OTP người dùng nhập có trùng khớp không
        if (!latestVerifyRecord || latestVerifyRecord.otp !== otp) {
            req.flash("error", "Mã OTP không hợp lệ hoặc đã hết hạn.");
            return res.redirect("back");
        }

        // Kiểm tra xem emailOrPhone có phải là email hay số điện thoại để tìm người dùng
        const user = await User.findOne({
            $or: [
                { email: emailOrPhone },    // Kiểm tra theo email
                { phone: emailOrPhone }     // Kiểm tra theo số điện thoại
            ],
            deleted: false
        });

        if (!user) {
            req.flash("error", "Người dùng không tồn tại.");
            return res.redirect("back");
        }

        // Đăng nhập thành công, tạo token hoặc session
        res.cookie("tokenUser", user.tokenUser);  // Ví dụ sử dụng cookie để lưu trữ thông tin đăng nhập
        req.flash("success", "Đăng nhập thành công!");
        res.locals.user = user; // Lưu user vào biến cục bộ
        res.redirect("/");

    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        req.flash("error", "Có lỗi xảy ra trong quá trình xác thực.");
        res.redirect("back");
    }
};

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
    const email = req.body.email;
    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "active") {
        req.flash("error", "Tài khoản của bạn đã được xác thực rồi!");
        res.redirect("back");
        return;
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        req.flash("error", "Tài khoản của bạn đang bị khóa. Vui lòng thử lại sau.");
        res.redirect("back");
        return;
    }

    // Kiểm tra số lần yêu cầu OTP trong 3 phút
    const recentVerifications = await VerifyUser.find({
        email: email,
        expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) }
    });

    if (recentVerifications.length >= 3) {
        user.status = "inactive";
        user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
        user.lockedBy = "verifyEmailPost";  // Cập nhật nguồn khóa
        await user.save();

        req.flash("error", "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.");
        res.redirect("back");
        return;
    }

    // Tạo OTP mới và gửi email
    const secretKey = process.env.SECRET_KEY_HOTP; // Khóa bí mật (nên lưu trữ an toàn, ví dụ trong file .env)
    const counter = Math.floor(Date.now() / 1000); // Dùng timestamp hiện tại làm counter
    const otp = generateHelper.generateHOTP(secretKey, counter, 6); // Tạo OTP 6 chữ số
    const objectVerifyUser = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000)
    };

    const newVerifyUser = new VerifyUser(objectVerifyUser);
    await newVerifyUser.save();

    // Bước 3: Gửi OTP qua email
    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Kích Hoạt Tài Khoản
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Chúng tôi đã nhận được yêu cầu kích hoạt tài khoản của bạn. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
            </div>
            <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

    sendMailHelper.sendMail(email.toString(), subject, html);

    res.redirect(`/user/verify-user?email=${email}`);
};


// [GET] /user/password/forgot
export const passwordForgot = async (req: Request, res: Response) => {
    res.render("client/pages/user/password-forgot.pug", {
        pageTitle: "Lấy lại mật khẩu"
    })
}

// [POST] /user/password/forgot
export const passwordForgotPost = async (req: Request, res: Response) => {
    const email = req.body.email;
    // Kiểm tra email tồn tại
    const existEmail = await User.findOne({ email: email, deleted: false });
    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }

    // Kiểm tra trạng thái tài khoản
    if (existEmail.status === "inactive") {
        if (existEmail.lockedUntil && existEmail.lockedUntil <= new Date()) {
            // Mở khóa tài khoản và chuyển trạng thái thành active
            await User.updateOne({ email: email }, { 
                $set: { status: "active", lockedUntil: null, lockedBy: null }
            });
        } else {
            req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
            res.redirect("back");
            return;
        }
    }

    // Kiểm tra số lần yêu cầu OTP trong vòng 3 phút
    const otpRecordsCount = await ForgotPassword.countDocuments({
        email: email,
        expireAt: { $gt: new Date() },
    });
    if (otpRecordsCount >= 3) {
        const unlockTime = new Date(Date.now() + 3 * 60 * 1000);
        await User.updateOne(
            { email: email },
            { 
                $set: { status: "inactive", lockedUntil: unlockTime, lockedBy: "passwordForgotPost" } 
            }
        );
        req.flash("error", "Quá số lần gửi OTP. Tài khoản của bạn đã bị khóa tạm thời trong 3 phút.");
        res.redirect("back");
        return;
    }

    // Tạo OTP và gửi email
    const secretKey = process.env.SECRET_KEY_TOTP; // Khóa bí mật (nên lưu trữ an toàn, ví dụ trong file .env)
    const otp = generateHelper.generateTOTP(secretKey, 30, 6); // Tạo OTP với timeStep 30 giây, 6 chữ số

    // Lưu OTP vào cơ sở dữ liệu với thời gian hết hạn là 3 phút
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: new Date(Date.now() + 3 * 60 * 1000), // OTP có giá trị 3 phút
    };
    const newForgotPassword = new ForgotPassword(objectForgotPassword);
    await newForgotPassword.save();

    // Bước 3: Gửi OTP qua email
    const subject = `Mã xác thực OTP đặt lại mật khẩu`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #FF9800; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #FF9800; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #FF9800; font-weight: bold;">MusicApp - Free To Everyone</span></p>
            </div>
            <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

    sendMailHelper.sendMail(email.toString(), subject, html);

    // Chuyển hướng tới trang nhập OTP
    res.redirect(`/user/password/otp?email=${email}`);
};


// [GET] /user/password/forgot-phone
export const passwordForgotPhone = async (req: Request, res: Response) => {
    res.render("client/pages/user/password-forgot-phone.pug", {
        pageTitle: "Lấy lại mật khẩu"
    })
}

// [POST] /user/password/forgot-phone
export const passwordForgotPhonePost = async (req: Request, res: Response) => {
    const phone = req.body.phone;

    // Bước 1: Kiểm tra số điện thoại tồn tại
    const existPhone = await User.findOne({ phone: phone, deleted: false });
    if (!existPhone) {
        req.flash("error", "Số điện thoại không tồn tại hoặc chưa được đăng ký!");
        res.redirect("back");
        return;
    }

    // Bước 2: Kiểm tra trạng thái tài khoản
    if (existPhone.status === "inactive") {
        if (existPhone.lockedUntil && existPhone.lockedUntil <= new Date()) {
            // Mở khóa tài khoản và chuyển trạng thái thành "active"
            await User.updateOne({ phone: phone }, {
                $set: { status: "active", lockedUntil: null, lockedBy: null }
            });
        } else {
            req.flash("error", "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau.");
            res.redirect("back");
            return;
        }
    }

    // Bước 3: Kiểm tra số lần yêu cầu OTP
    const otpRecordsCount = await ForgotPassword.countDocuments({
        phone: phone,
        expireAt: { $gt: new Date() },
    });

    if (otpRecordsCount >= 3) {
        const unlockTime = new Date(Date.now() + 3 * 60 * 1000); // Thời gian mở khóa sau 3 phút
        await User.updateOne(
            { phone: phone },
            { 
                $set: { status: "inactive", lockedUntil: unlockTime, lockedBy: "passwordForgotPost" } 
            }
        );
        req.flash("error", "Quá số lần gửi OTP. Tài khoản của bạn đã bị khóa tạm thời trong 3 phút.");
        res.redirect("back");
        return;
    }

    // Bước 4: Tạo OTP và lưu vào collection ForgotPassword
    const secretKey = process.env.SECRET_KEY_HOTP; // Khóa bí mật (nên lưu trữ an toàn, ví dụ trong file .env)
    const counter = Math.floor(Date.now() / 1000); // Dùng timestamp hiện tại làm counter
    const otp = generateHelper.generateHOTP(secretKey, counter, 6); // Tạo OTP 6 chữ số
    const objectForgotPassword = {
        phone: phone,
        otp: otp,
        expireAt: new Date(Date.now() + 180 * 1000), // OTP hết hạn sau 3 phút
    };
    const newForgotPassword = new ForgotPassword(objectForgotPassword);
    await newForgotPassword.save();

    // Bước 5: Gửi OTP qua SMS
    try {
        const sendPhone = "+84" + phone.slice(1); // Chuyển đổi số điện thoại sang định dạng quốc tế
        const customMessage = `Mã OTP khôi phục mật khẩu của bạn là ${otp}. Vui lòng không chia sẻ mã này với bất kỳ ai.`;

        // Gửi tin nhắn (Kích hoạt dòng này sau khi tích hợp dịch vụ gửi SMS)
        await textflow.sendSMS(sendPhone, customMessage);

        res.redirect(`/user/password/otp-phone?phone=${phone}`); // Chuyển đến trang OTP
    } catch (error) {
        console.error("Error sending OTP via SMS:", error.response?.data || error);
        req.flash("error", "Gửi OTP thất bại. Vui lòng thử lại!");
        res.redirect("back");
    }
};


// [GET] /user/password/otp
export const passwordOtp = async (req: Request, res: Response) => {
    const email = req.query.email
    res.render("client/pages/user/password-otp.pug", {
        pageTitle: "Nhập mã OTP xác thực",
        email: email
    })
}

// Cron job kiểm tra và mở khóa tài khoản sau 3 phút, chuyển về "active" hoặc "initial"
cron.schedule("*/1 * * * *", async () => {
    const now = new Date();

    // Cập nhật tài khoản bị khóa trong 3 phút, chuyển về "active" cho API passwordForgotPost
    const resultForgot = await User.updateMany(
        { 
            status: "inactive", 
            lockedUntil: { $lte: now },
            lockedBy: "passwordForgotPost"  // Phân biệt khóa từ API passwordForgotPost
        },
        { 
            $set: { status: "active", lockedUntil: null, lockedBy: null }
        }
    );
    if (resultForgot.modifiedCount > 0) {
        console.log(`[CRON] Đã mở khóa ${resultForgot.modifiedCount} tài khoản - API passwordForgotPost.`);
    }

    // Cập nhật tài khoản bị khóa trong 3 phút, chuyển về "initial" cho API verifyEmailPost
    const resultVerify = await User.updateMany(
        { 
            status: "inactive", 
            lockedUntil: { $lte: now },
            lockedBy: "verifyEmailPost"  // Phân biệt khóa từ API verifyEmailPost
        },
        { 
            $set: { status: "initial", lockedUntil: null, lockedBy: null }
        }
    );
    if (resultVerify.modifiedCount > 0) {
        console.log(`[CRON] Đã chuyển trạng thái ${resultVerify.modifiedCount} tài khoản về "initial" - API verifyEmailPost.`);
    }
});


// [GET] /user/password/otp-phone
export const passwordOtpPhone = async (req: Request, res: Response) => {
    const phone = req.query.phone
    res.render("client/pages/user/password-otp-phone", {
        pageTitle: "Nhập mã OTP xác thực",
        phone: phone
    })
}

// [POST] /user/password/otp-phone
export const passwordOtpPhonePost = async (req: Request, res: Response) => {
    const phone = req.body.phone;
    const otp = req.body.otp;

    // Tìm bản ghi OTP mới nhất cho số điện thoại này
    const latestOtpRecord = await ForgotPassword.findOne({
        phone: phone,
    }).sort({ expireAt: -1 }); // Sắp xếp theo expireAt giảm dần, lấy bản ghi mới nhất

    // Nếu không có bản ghi OTP nào hoặc OTP không hợp lệ
    if (!latestOtpRecord) {
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }

    // Kiểm tra xem OTP nhập vào có đúng không và còn hiệu lực không
    if (latestOtpRecord.otp !== otp) {
        req.flash("error", "Mã OTP không chính xác!");
        res.redirect("back");
        return;
    }

    if (latestOtpRecord.expireAt < new Date()) {
        req.flash("error", "OTP đã hết hạn!");
        res.redirect("back");
        return;
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({
        phone: phone,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Người dùng không tồn tại!");
        res.redirect("back");
        return;
    }

    // Lưu token vào cookie và chuyển hướng đến trang đặt lại mật khẩu
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
};


// [POST] /user/password/otp
export const passwordOtpPost = async (req: Request, res: Response) => {
    const email = req.body.email;
    const otp = req.body.otp;

    // Tìm bản ghi OTP mới nhất cho email này
    const latestOtpRecord = await ForgotPassword.findOne({
        email: email,
    }).sort({ expireAt: -1 }); // Sắp xếp theo expireAt giảm dần, lấy bản ghi mới nhất

    // Nếu không có bản ghi OTP nào hoặc OTP không hợp lệ
    if (!latestOtpRecord) {
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }

    // Kiểm tra xem OTP nhập vào có đúng không và còn hiệu lực không
    if (latestOtpRecord.otp !== otp) {
        req.flash("error", "Mã OTP không chính xác!");
        res.redirect("back");
        return;
    }

    if (latestOtpRecord.expireAt < new Date()) {
        req.flash("error", "OTP đã hết hạn!");
        res.redirect("back");
        return;
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Người dùng không tồn tại!");
        res.redirect("back");
        return;
    }

    // Lưu token vào cookie và chuyển hướng đến trang đặt lại mật khẩu
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
};


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