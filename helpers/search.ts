import slugify from "slugify"

export default (query: Record<string, any>) => {
    const objectSearch = {
        keyword: ""
    }
    if (query.keyword) {
        objectSearch.keyword = query.keyword.toString()
        const slug = slugify(query.keyword.toString(), {
            lower: true,       // Chuyển về chữ thường
            locale: 'vi',      // Đảm bảo hỗ trợ tiếng Việt
            remove: /[*+~.()'"!:@]/g  // Loại bỏ các ký tự đặc biệt
        })
        const regex = new RegExp(slug, "i")
        objectSearch["regex"] = regex
    }
    return objectSearch
}