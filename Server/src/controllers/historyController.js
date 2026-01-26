const History = require('../models/History');

// @desc    Save history
// @route   POST /api/history
// @access  Public
const saveHistory = async (req, res) => {
    try {
        const { items, totalItems, date } = req.body;
        const history = await History.create({
            items,
            totalItems,
            date: date || Date.now()
        });
        res.status(201).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all history
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res) => {
    try {
        const history = await History.find({}).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveHistory,
    getHistory
};
