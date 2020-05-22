module.exports = (req, res, next) => {
    console.log(req.userData.accountType);
    if (req.userData.accountType == false) {
        //is not admin
        res.status(401).json({ message: "You are not admin!" });
    } else {
        next();
    }
};