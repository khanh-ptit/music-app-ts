import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import Song from "../../models/song.model";
import { SortOrder } from "mongoose";
import paginationClientHelper from "../../helpers/pagination-client";

// [GET] /singers/:slug
export const detail = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug
        const singer = await Singer.findOne({
            slug: slug,
            deleted: false
        }).select("-updatedBy -position -deleted")
        if (!singer) {
            res.redirect("back")
            return
        }
        // console.log(singer)

        const singerId = singer.id
        const songs = await Song.find({
            singerId: singerId,
            status: "active",
            deleted: false
        })
        // console.log(songs)
        res.render("client/pages/singers/detail.pug", {
            pageTitle: singer.fullName,
            songs: songs,
            singer: singer
        })
    } catch (error) {
        res.redirect("back")
    }
    
}

// [GET] /singers
export const index = async (req: Request, res: Response) => {
    let sort = {
        position: "desc" as SortOrder
    }

    const countDocuments = await Singer.countDocuments({
        deleted: false,
        status: "active"
    })
    const objectPagination = paginationClientHelper(req.query, res, countDocuments, "/singers", 6)
    if (!objectPagination) return 

    const singers = await Singer.find({
        deleted: false,
        status: "active"
    })
        .select("fullName nationality avatar slug")
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)

    
    res.render("client/pages/singers/index", {
        pageTitle: "Danh sách ca sĩ",
        singers: singers,
        pagination: objectPagination
    })
}