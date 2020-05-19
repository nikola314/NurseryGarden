const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.creteUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            approved: req.body.approved,
            username: req.body.username,
            phone: req.body.phone,
            location: req.body.location,
            date: req.body.date,
            isCompany: req.body.isCompany,
            isAdmin: false,
        });
        user
            .save()
            .then((result) => {
                res.status(201).json({
                    message: "User created!",
                    result: result,
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: "Invalid authentication credentials!",
                });
            });
    });
};

exports.login = (req, res, next) => {
    let fetchedUser;
    User.findOne({ username: req.body.username })
        .then((user) => {
            if (!user) {
                return res.status("401").json({
                    message: "Auth failed",
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then((result) => {
            if (!result) {
                return res.status("401").json({
                    message: "Invalid authentication credentials!",
                });
            }
            if (!fetchedUser.approved) {
                return res.status("401").json({
                    message: "Your account request is not approved yet!",
                });
            }
            const token = jwt.sign({
                    username: fetchedUser.username,
                    userId: fetchedUser._id,
                    accountType: fetchedUser.isAdmin,
                },
                process.env.JWT_SECRET, { expiresIn: "1h" }
            );
            const user = {
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id,
                isAdmin: fetchedUser.isAdmin,
                isCompany: fetchedUser.isCompany,
            };
            res.status(200).json({ userData: user });
        })
        .catch((err) => {
            return res.status("401").json({
                message: "Auth failed",
            });
        });
};

exports.changePassword = (req, res, next) => {
    User.findById(req.userData.userId)
        .then((user) => {
            if (!user) {
                return res.status("401").json({
                    message: "Auth failed",
                });
            }
            return bcrypt.compare(req.body.currentPassword, user.password);
        })
        .then((result) => {
            if (!result) {
                return res.status("401").json({
                    message: "Auth failed",
                });
            }
            bcrypt.hash(req.body.newPassword, 10).then((hash) => {
                User.updateOne({ username: req.userData.username }, { password: hash }).then((result) => {
                    if (result.n > 0) {
                        res.status(200).json({ message: "Password changed successfully!" });
                    } else {
                        res.status(401).json({ message: "Not authorized!" });
                    }
                });
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status("401").json({
                message: "Auth failed",
            });
        });
};