import { Request, Response } from "express";
import Role from "../../models/role.model";
import md5 from "md5";
import Account from "../../models/account.model";
import { systemConfig } from "../../config/system";
import filterStatusHelper from "../../helpers/filterStatus";
import paginationHelper from "../../helpers/pagination";

// [GET] /admin/accounts/
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false,
  };

  // Filter status
  const filterStatus = filterStatusHelper(req.query);
  if (req.query.status) {
    find["status"] = req.query.status;
  }
  // End filter status

  // Pagination
  const countDocuments = await Account.countDocuments(find);
  const objectPagination = paginationHelper(
    req.query,
    res,
    countDocuments,
    "accounts"
  );
  // End pgination

  const accounts = await Account.find(find).select("-token -password");

  for (const item of accounts) {
    const roleInfo = await Role.findOne({
      _id: item.role_id,
      deleted: false,
    });
    item["roleInfo"] = roleInfo;

    if (item.createdBy.createdAt) {
      if (item.createdBy.createdAt) {
        const infoAccountCreate = await Account.findOne({
          _id: item.createdBy.accountId,
        }).select("fullName");
        if (infoAccountCreate) {
          item["infoAccountCreate"] = infoAccountCreate;
        }
      }
    }

    if (item.updatedBy.length > 0) {
      const lastLog = item.updatedBy[item.updatedBy.length - 1];
      const infoAccountUpdate = await Account.findOne({
        _id: lastLog.accountId,
      });
      if (infoAccountUpdate) {
        item["infoAccountUpdate"] = infoAccountUpdate;
        item["updatedAt"] = lastLog.updatedAt;
      }
    }
  }

  res.render("admin/pages/accounts/index.pug", {
    pageTitle: "Tài khoản admin",
    accounts: accounts,
    filterStatus: filterStatus,
    pagination: objectPagination,
  });
};

// [GET] /admin/accounts/create
export const create = async (req: Request, res: Response) => {
  const roles = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/accounts/create.pug", {
    pageTitle: "Tạo mới tài khoản admin",
    roles: roles,
  });
};

// [POST] /admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
  const existEmail = await Account.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect("back");
    return;
  }

  interface Account {
    fullName: String;
    password: String;
    email: String;
    phone: String;
    role_id: String;
    avatar: String;
    status: String;
    createdBy: {
      accountId: String;
      createdAt: Date;
    };
  }

  const dataAccount: Account = {
    fullName: req.body.fullName,
    password: md5(req.body.password),
    email: req.body.email,
    phone: req.body.phone,
    role_id: req.body.role_id,
    status: req.body.status,
    avatar: req.body.avatar,
    createdBy: {
      accountId: res.locals.user.id,
      createdAt: new Date(),
    },
  };

  const newAccount = new Account(dataAccount);
  await newAccount.save();
  req.flash("success", "Tạo thành công tài khoản!");
  res.redirect(`${systemConfig.prefixAdmin}/accounts`);
};

// [PATCH] /admin/accounts/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const status = req.params.status;

    const existAccount = await Account.findOne({
      _id: id,
      deleted: false,
    });

    if (!existAccount) {
      res.json({
        code: 404,
        message: "Không tồn tại tài khoản!",
      });
      return;
    }

    const updatedBy = {
      accountId: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Account.updateOne(
      {
        _id: id,
      },
      {
        status: status,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );

    res.status(200).json({
      code: 200,
      message: "Cập nhật trạng thái thành công!",
      status: status,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Nghịch cái đb",
    });
  }
};

// [DELETE] /admin/accounts/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existAccount = await Account.findOne({
      _id: id,
      deleted: false,
    });

    if (!existAccount) {
      res.json({
        code: 404,
        message: "Không tồn tại tài khoản!",
      });
      return;
    }

    await Account.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedBy: {
          account_id: res.locals.user.id,
          deletedAt: new Date(),
        },
      }
    );

    res.json({
      code: 200,
      message: "Đã xóa thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Nghịch cái đb",
    });
  }
};

// [GET] /admin/accounts/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existAccount = await Account.findOne({
      _id: id,
      deleted: false,
    });

    if (!existAccount) {
      req.flash("error", "Đường dẫn không tồn tại!");
      res.redirect(`${systemConfig.prefixAdmin}/accounts`);
      return;
    }

    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });

    const roles = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/accounts/edit.pug", {
      pageTitle: "Chỉnh sửa tài khoản admin",
      account: account,
      roles: roles,
    });
  } catch (error) {
    req.flash("error", "Đường dẫn không hợp lệ");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};

// [PATCH] /admin/accounts/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existAccount = await Account.findOne({
      _id: id,
      deleted: false,
    });

    if (!existAccount) {
      res.json({
        code: 404,
        message: "Không tồn tại tài khoản!",
      });
      return;
    }

    const email = req.body.email;

    const existEmail = await Account.findOne({
      _id: {
        $ne: id,
      },
      email: email,
      deleted: false,
    });

    if (existEmail) {
      req.flash("error", "Email đã tồn tại!");
      res.redirect("back");
      return;
    }

    interface ObjectAccount {
      fullName: String;
      email: String;
      phone: String;
      password?: String;
      avatar?: String;
      role_id: String;
      status: String;
    }

    const dataAccount: ObjectAccount = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      role_id: req.body.role_id,
      status: req.body.status,
    };

    if (req.body.password) {
      dataAccount.password = md5(req.body.password);
    }

    if (req.body.avatar) {
      dataAccount.avatar = md5(req.body.avatar);
    }

    const updatedBy = {
      accountId: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Account.updateOne(
      {
        _id: id,
      },
      {
        $set: dataAccount,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    req.flash("success", "Cập nhật tài khoản thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  } catch (error) {
    res.json({
      code: 400,
      message: "Nghịch cái đb",
    });
  }
};

// [GET] /admin/accounts/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existAccount = await Account.findOne({
      _id: id,
      deleted: false,
    });

    if (!existAccount) {
      req.flash("error", "Đường dẫn không tồn tại!");
      res.redirect(`${systemConfig.prefixAdmin}/accounts`);
      return;
    }

    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });

    const roles = await Role.find({
      deleted: false,
    });

    for (const item of roles) {
      const roleInfo = await Role.findOne({
        _id: account.role_id,
      });
      account["roleInfo"] = roleInfo;
    }

    res.render("admin/pages/accounts/detail.pug", {
      pageTitle: "Chi tiết tài khoản admin",
      account: account,
      roles: roles,
    });
  } catch (error) {
    req.flash("error", "Đường dẫn không hợp lệ");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};

// [PATCH] /admin/accounts/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  const updatedBy = {
    accountId: res.locals.user.id,
    updatedAt: new Date(),
  };

  switch (type) {
    case "active":
      await Account.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          status: "active",
          $push: {
            updatedBy: updatedBy,
          },
        }
      );
      req.flash(
        "success",
        `Đã cập nhật trạng thái cho ${ids.length} tài khoản`
      );
      res.redirect("back");
      break;
    case "inactive":
      await Account.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          status: "inactive",
          $push: {
            updatedBy: updatedBy,
          },
        }
      );
      req.flash(
        "success",
        `Đã cập nhật trạng thái cho ${ids.length} tài khoản`
      );
      res.redirect("back");
      break;
    case "delete-all":
      await Account.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          deleted: true,
          deletedBy: {
            accountId: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Đã xóa ${ids.length} tài khoản`);
      res.redirect("back");
      break;
    default:
      req.flash("error", `Có lỗi xảy ra`);
      res.redirect("back");
      break;
  }
};
