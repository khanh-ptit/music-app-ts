import { Request, Response } from "express";
import Song from "../../models/song.model";
import filterStatusHelper from "../../helpers/filterStatus";
import searchHelper from "../../helpers/search";

// [GET] /admin/songs
export const index = async (req: Request, res: Response) => {
    const filterStatus = filterStatusHelper(req.query) 
    let find = {
        deleted: false
    }

    // Filter status
    if (req.query.status) {
        find["status"] = req.query.status
    }

    // Form search
    const objectSearch = searchHelper(req.query)
    if (objectSearch["regex"]) {
        find["slug"] = objectSearch["regex"]
    }

    const songs = await Song.find(find)
    res.render("admin/pages/songs/index", {
        pageTitle: "Danh sách bài hát",
        songs: songs,
        filterStatus: filterStatus,
        keyword: objectSearch["keyword"]
    })
}