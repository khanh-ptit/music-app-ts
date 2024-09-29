import { Request, Response } from "express"
import Song from "../../models/song.model"
import Singer from "../../models/singer.model"
import slugify from "slugify"

// [GET] /search
export const result = async (req: Request, res: Response) => {
    const type: string = req.params.type
    const keyword: string = req.query.keyword.toString()

    let find = {
        deleted: false
    }
    
    let newSongs = []

    if (keyword) {
        const slug = slugify(keyword, {
            lower: true,       // Chuyển về chữ thường
            locale: 'vi',      // Đảm bảo hỗ trợ tiếng Việt
            remove: /[*+~.()'"!:@]/g  // Loại bỏ các ký tự đặc biệt
        });
        
        // console.log(slug); // Kết quả: "cat-doi-noi-sau"
        const regex = new RegExp(slug, "i")
        find["slug"] = regex
    }
    
    const songs = await Song.find(find)
    for (const item of songs) {
        const singerInfo = await Singer.findOne({
            _id: item.singerId,
            deleted: false
        })
        item["singerInfo"] = singerInfo 

        newSongs.push({
            id: item.id,
            title: item.title,
            avatar: item.avatar,
            like: item.like,
            slug: item.slug,
            singerInfo: {
                fullName: singerInfo.fullName
            }
        })
    }
    switch (type) {
        case "result":
            res.render("client/pages/search/result", {
                pageTitle: `Kết quả: ${keyword}`,
                keyword: keyword,
                songs: songs
            })
            break;
        case "suggest":
            res.json({
                code: 200,
                message: "Thành công!",
                songs: newSongs
            })
            break;
        default:
            res.json({
                code: 404,
                message: "Không tồn tại!"
            })
            break;
    }
    
}