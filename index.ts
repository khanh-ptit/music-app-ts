import express, { Express } from "express"
import * as database from "./config/database"
import dotenv from "dotenv"
import routeClient from "./routes/client/index.route"
import flash from "express-flash"
import cookieParser from "cookie-parser"
import session from "express-session"

dotenv.config()
database.connect()

const app: Express = express()
const port: number = parseInt(process.env.PORT.toString())

app.use(express.static("public"))
app.set("views", "./views")
app.set("view engine", "pug")

// Flash
app.use(cookieParser("khanhleis11"));
app.use(session({
    secret: 'khanhleis11',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }  // Session sẽ tồn tại trong 60 giây
}));
app.use(flash());


routeClient(app)

app.get("*", (req, res) => {
    res.render("client/pages/error/404", {
        pageTitle: "404 Not Found"
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})