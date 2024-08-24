const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const domainSchema = new Schema({
    keyword: {
        type: String,
        required: true,
    },
    response: {
        type: Array
    }
});

const domainModel = models?.Domain || model("Domain", domainSchema);

module.exports = domainModel;
