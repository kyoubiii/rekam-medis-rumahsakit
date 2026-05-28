// routes/rekamMedisRoutes.js
const express = require('express');
const router = express.Router();

// Manggil fungsi yang udah kita bikin di controller tadi
const { tambahRekamMedis, rujukPasien, riwayatPasien } = require('../controllers/rekamMedisController');

// Bikin alamat URL-nya (endpoints)
router.post('/tambah', tambahRekamMedis);
router.put('/rujuk', rujukPasien);
router.get('/riwayat/:id', riwayatPasien);

module.exports = router;