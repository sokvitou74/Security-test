const jwt = require("jsonwebtoken");
const { tokenKey } = require("../utils/database");

const AuthMiddleware = async (req, res, next) => {
    const sessionCookie = req.cookies.session;
    
    try {
        const session = jwt.verify(sessionCookie, tokenKey);
        if (!session) {
            return res.redirect("/login");
        }
    } catch (err) {
        return res.redirect("/login");
    }

    next();
};

module.exports = AuthMiddleware;
