const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cron = require("node-cron");

const jobs = require("./cron-jobs");

const authRoutes = require("./routes/auth");
const gardensRoutes = require("./routes/gardens");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");

const app = express();

// Database settings
mongoose
    .connect(
        "mongodb+srv://pia:" +
        process.env.MONGO_ATLAS_PW +
        "@cluster0-unpq0.mongodb.net/test?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Database connection failed!");
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/gardens", gardensRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

cron.schedule("*/2 * * * *", function() {
    jobs.updateGardens();
});

// cron.schedule("1 * * * *", function() {
//     // TODO: maybe add date created to gardens and check if hour actually passed and run cron more often

// });

module.exports = app;
