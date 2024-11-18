const jwt = require("jsonwebtoken");
const { tokenKey, db } = require("../utils/database");

const AdminMiddleware = async (req, res, next) => {
    const sessionCookie = req.cookies.session;
    
    try {
        const session = jwt.verify(sessionCookie, tokenKey);
        
        const userIsAdmin = (await db.Users.findOne({ where: {username: session.username} })).isAdmin;
        const jwtIsAdmin = session.isAdmin;

        if (!userIsAdmin && !jwtIsAdmin){
            return res.redirect("/");
        }
    } catch (err) {
        return res.redirect("/");
    }

    next();
};

module.exports = AdminMiddleware;
