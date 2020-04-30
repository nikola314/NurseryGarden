const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { username: decodedToken.username, userId: decodedToken.userId, accountType: decodedToken.accountType };
        next();
    } catch (error) {
        res.status(401).json({ message: "You are not authenticated!" });
    }
};