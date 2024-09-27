import express, { Express } from "express"
import * as database from "./config/database"
import dotenv from "dotenv"
import routeClient from "./routes/client/index.route"

dotenv.config()
database.connect()

const app: Express = express()
const port: number = parseInt(process.env.PORT.toString())

app.use(express.static("public"))
app.set("views", "./views")
app.set("view engine", "pug")

routeClient(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})