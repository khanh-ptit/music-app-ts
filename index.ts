import express, { Express } from "express"
import * as database from "./config/database"
import dotenv from "dotenv"
import routeClient from "./routes/client/index.route"
import flash from "express-flash"
import cookieParser from "cookie-parser"
import session from "express-session"
import { routeAdmin } from "./routes/admin/index.route"
import { systemConfig } from "./config/system"
import path from "path"
import methodOverride from "method-override"
import bodyParser from "body-parser"

dotenv.config()
database.connect()

const app: Express = express()
const port: number = parseInt(process.env.PORT.toString())

app.use(express.static(`${__dirname}/public`))
app.set("views", `${__dirname}/views`)
app.set("view engine", "pug")
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Flash
app.use(cookieParser("khanhleis11"));
app.use(session({
    secret: 'khanhleis11',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }  // Session sẽ tồn tại trong 60 giây
}));
app.use(flash());
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended: false}))

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE

// App local variables
app.locals.prefixAdmin = systemConfig.prefixAdmin

routeClient(app)
routeAdmin(app)

app.get("*", (req, res) => {
    res.render("client/pages/error/404", {
        pageTitle: "404 Not Found"
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})