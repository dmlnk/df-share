const mongoose = require("mongoose");
const {MONGOURI} = require("./defaults")

module.exports = async () => {
    mongoose
        .connect(MONGOURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        .then(() => console.log('DB Connected!'))
        .catch(err => {
            console.log(`DB Connection Error: ${err.message}`);
        });
};

