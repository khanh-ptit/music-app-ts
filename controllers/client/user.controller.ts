import { Request, Response } from "express";

// [GET] /user/login
export const login = async (req: Request, res: Response) => {
    res.send("OK")
}