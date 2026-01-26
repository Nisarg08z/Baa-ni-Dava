const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
