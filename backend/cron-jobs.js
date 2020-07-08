const nodemailer = require("nodemailer");
const User = require("./models/user");
const Garden = require("./models/garden");

// Mailer settings
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "cbrmnc@gmail.com",
        pass: "kesicnikola314",
    },
});

function decreaseWaterAndTemperature() {
    Garden.updateMany({}, { $inc: { water: -(1.0 / 30), temperature: -(0.5 / 30) } })
        .then((result) => {
            console.log("Successfully updatede garden conditions!");
        })
        .then(sendWarnings)
        .catch((err) => {
            console.log("Error updating garden conditions: " + err);
        });
}

exports.updateGardens = () => {
    decreaseWaterAndTemperature();
};

function sendWarnings() {
    Garden.find({
        $or: [
            { water: 74, temperature: { $gt: 11 } },
            { temperature: 11.5, water: { $gt: 74 } },
        ],
    }).then((gardens) => {
        gardens.forEach((garden) => {
            User.findById(garden.owner).then((user) => {
                console.log("Sending mail to: " + user.email);
                if (!user || !user.email) return;
                let mailOptions = {
                    from: "cbrmnc@gmail.com",
                    to: user.email,
                    subject: `Garden ` + garden.name + `requires your attention`,
                    text: `Please take care of water and temperature level in your garden.`,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Email successfully sent!");
                    }
                });
            });
        });
    });
}
