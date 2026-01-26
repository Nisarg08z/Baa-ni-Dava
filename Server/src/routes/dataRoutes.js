const express = require('express');
const router = express.Router();
const {
    getStores,
    addStore,
    deleteStore,
    getMedicines,
    addMedicine,
    deleteMedicine
} = require('../controllers/dataController');

router.route('/stores').get(getStores).post(addStore);
router.route('/stores/:id').delete(deleteStore);

router.route('/medicines').get(getMedicines).post(addMedicine);
router.route('/medicines/:id').delete(deleteMedicine);

module.exports = router;
