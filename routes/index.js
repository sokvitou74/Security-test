module.exports = (db) => {
    const bcrypt = require("bcryptjs");
    const router = require("express").Router();
    const jwt = require("jsonwebtoken");
    const jsrender = require("jsrender");
    const AuthMiddleware = require("../middleware/AuthMiddleware");
    const AdminMiddleware = require("../middleware/AdminMiddleware");
    const { tokenKey } = require("../utils/database");
    const { log } = require("../utils/log")

    const response = (data) => ({ message: data });

    router.get("/", AuthMiddleware, async (req, res) => {
        res.render("index");
    });

    router.get("/admin", AdminMiddleware, async (req, res) => {
        res.render("admin", { secretadmincontent: "WATER{pRoTyPe_pOlLuTiOn_pRiViLeGe_eScAlAtIoN}" });
    });

    router.get("/register", async (req, res) => {
        res.render("register");
    });

    router.post("/register", async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            if (!username || !password) {
                return res
                    .status(400)
                    .send(response("Username and password are required"));
            }

            const existingUser = await db.Users.findOne({
                where: { username: username },
            });
            if (existingUser) {
                return res
                    .status(400)
                    .send(response("Username already exists"));
            }

            await db.Users.create({
                username: username,
                password: bcrypt.hashSync(password),
                isAdmin: false,
            }).then(() => {
                res.send(response("User registered successfully"));
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                error: "Something went wrong!",
            });
        }
    });

    router.get("/login", async (req, res) => {
        res.render("login");
    });

    router.post("/login", async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            if (!username || !password) {
                return res
                    .status(400)
                    .send(response("Username and password are required"));
            }

            // log all login attempts for security purposes
            //  if we send a login request containing a prototype pollution payload, leading to prototype pollution
            log(req.body);

            const user = await db.Users.findOne({
                where: { username: username },
            });
            if (!user) {
                return res
                    .status(400)
                    .send(response("Invalid username or password"));
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res
                    .status(400)
                    .send(response("Invalid username or password"));
            }

            const token = jwt.sign({ username: user.username }, tokenKey, {
                expiresIn: "1h",
            });

            res.cookie("session", token);

            return res.status(200).send(response("Logged in successfully"));
        } catch (error) {
            console.error(error);
            res.status(500).send({
                error: "Something went wrong!",
            });
        }
    });

    router.get("/logout", async (req, res) => {
        res.clearCookie("session");
        return res.redirect("/");
    });

    return router;
};
