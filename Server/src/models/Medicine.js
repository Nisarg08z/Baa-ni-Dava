const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    name: { type: String, required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
