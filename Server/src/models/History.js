const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    date: { type: Date, default: Date.now },
    items: [{
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        name: { type: String, required: true },
        store: { type: String, required: true },
        quantity: { type: String, required: true } // Quantity as string to allow "1 strip" or "10 pcs"
    }],
    totalItems: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
