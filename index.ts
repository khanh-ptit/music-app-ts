import express, {Express, Request, Response} from "express"
import * as database from "./config/database"
import dotenv from "dotenv"

dotenv.config()
database.connect()

const app: Express = express()
const port: number = parseInt(process.env.PORT.toString())

app.set("views", "./views")
app.set("view engine", "pug")

app.get("/topics", (req: Request, res: Response) => {
    res.render("client/pages/topics/index.pug")
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})