const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Courier = require("../models/courier");

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
            .then((createdUser) => {
                if (createdUser.isCompany) {
                    // create couriers
                    for (let i = 0; i < 5; i++) {
                        const courier = new Courier({
                            company: createdUser._id,
                            timestamp: new Date(),
                            indentNumber: null,
                            status: 0,
                        });
                        courier.save().then((cr) => {
                            console.log(cr._id);
                        });
                    }
                }
                res.status(201).json({
                    message: "User created!",
                    result: createdUser,
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

exports.getUsers = (req, res, next) => {
    User.find({})
        .then((documents) => {
            res.status(200).json({
                message: "Users fetched successfully!",
                users: documents,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Fetching users failed!",
            });
        });
};

exports.updateUser = (req, res, next) => {
    User.findById(req.body._id)
        .then((user) => {
            if (!user) {
                return res.status("401").json({
                    message: "Request failed",
                });
            }
            user.approved = req.body.approved;
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.location = req.body.location;
            user.isCompany = req.body.isCompany;
            // user.date = req.body.date;
            user.phone = req.body.phone;
            user.username = req.body.username;
            if (user.password != req.body.password) {
                bcrypt.hash(req.body.password, 10).then((hash) => {
                    user.password = hash;
                    User.updateOne({ _id: user._id }, user).then((result) => {
                        if (result.n > 0) {
                            res.status(200).json({ message: "User updated successfully!" });
                        } else {
                            res.status(401).json({ message: "Error updating user!" });
                        }
                    });
                });
            } else {
                User.updateOne({ _id: user._id }, { $set: user }).then((result) => {
                    if (result.n > 0) {
                        res.status(200).json({ message: "User updated successfully!" });
                    } else {
                        res.status(401).json({ message: "Error updating user!" });
                    }
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status("401").json({
                message: "Updating failed",
            });
        });
};

exports.deleteUser = (req, res, next) => {
    User.deleteOne({ _id: req.params.id })
        .then((result) => {
            if (result.n > 0) {
                res.status(200).json({ message: "User deleted successfully" });
            } else {
                res.status(401).json({ message: "Deleting user failed!" });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Failed to delete user!",
            });
        });
};
