import { Response } from "express"
import { systemConfig } from "../config/system"

export default (query: Record<string, any>, res: Response, countDocuments: Number, prefix) => {
    let objectPagination = {
        currentPage: 1,
        skip: 0,
        limitItems: 4
    }
    objectPagination["totalPages"] = Math.ceil(parseInt(countDocuments.toString()) / objectPagination.limitItems)
    if (query.page) {
        const page = parseInt(query.page.toString())
        if (page < 1) {
            res.redirect(`${systemConfig.prefixAdmin}/${prefix}/?page=1`)
            return null
        }
        if (page > objectPagination["totalPages"]) {
            res.redirect(`${systemConfig.prefixAdmin}/${prefix}/?page=${objectPagination["totalPages"]}`)
            return null
        }
        objectPagination.currentPage = page
        objectPagination.skip = (page - 1) * objectPagination.limitItems
    }

    return objectPagination;
}