const Store = require('../models/Store');
const Medicine = require('../models/Medicine');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a store
// @route   POST /api/stores
// @access  Public
const addStore = async (req, res) => {
    try {
        const { name } = req.body;
        const storeExists = await Store.findOne({ name });

        if (storeExists) {
            return res.status(400).json({ message: 'Store already exists' });
        }

        const store = await Store.create({ name });
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Public
const deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (store) {
            await store.deleteOne();
            // Also delete medicines in this store
            await Medicine.deleteMany({ store: req.params.id });
            res.json({ message: 'Store removed' });
        } else {
            res.status(404).json({ message: 'Store not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({}).populate('store', 'name');
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a medicine
// @route   POST /api/medicines
// @access  Public
const addMedicine = async (req, res) => {
    try {
        const { name, storeId } = req.body;
        const medicine = await Medicine.create({
            name,
            store: storeId
        });
        const fullMedicine = await Medicine.findById(medicine._id).populate('store', 'name');
        res.status(201).json(fullMedicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Public
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine) {
            await medicine.deleteOne();
            res.json({ message: 'Medicine removed' });
        } else {
            res.status(404).json({ message: 'Medicine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStores,
    addStore,
    deleteStore,
    getMedicines,
    addMedicine,
    deleteMedicine
};
