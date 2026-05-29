const express = require('express');
const cors = require('cors');

// 1. Import 2 Layanan Fabric (Welas Asih & Muhammadiyah)
const fabricWelasAsih = require('./fabricService');
const fabricMuhammadiyah = require('./fabricServiceMuhammadiyah');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 2. Siapkan 2 variabel penyimpan Smart Contract
let contractWelasAsih;
let contractMuhammadiyah;

async function startServer() {
    console.log("Menyiapkan koneksi ke RS Welas Asih...");
    const connWelasAsih = await fabricWelasAsih.connectToNetwork();
    contractWelasAsih = connWelasAsih.contract;

    console.log("Menyiapkan koneksi ke RS Muhammadiyah...");
    const connMuhammadiyah = await fabricMuhammadiyah.connectToNetwork();
    contractMuhammadiyah = connMuhammadiyah.contract;

    // 1. Endpoint CEK STATUS
    app.get('/api/status', (req, res) => {
        res.json({ message: "API Backend Menyala! Terhubung ke Welas Asih & Muhammadiyah." });
    });

    // 2. Endpoint CREATE REKAM MEDIS (Write Data Publik)
    app.post('/api/rekam-medis', async (req, res) => {
        try {
            const { idPasien, namaPasien, riwayatSakit, tindakan, pemilik } = req.body;
            
            // Dinamis: Login sesuai instansi yang mendaftarkan pasien
            let medisContract = (pemilik === 'RS Muhammadiyah') ? contractMuhammadiyah : contractWelasAsih;

            await medisContract.submitTransaction('CreateRekamMedis', idPasien, namaPasien, riwayatSakit, tindakan, pemilik);
            res.status(200).json({ status: 'success', message: `Rekam medis pasien ${namaPasien} berhasil disimpan oleh ${pemilik}!` });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    // 3. Endpoint READ REKAM MEDIS (Read Data Publik)
    app.get('/api/rekam-medis/:id', async (req, res) => {
        try {
            const idPasien = req.params.id;
            // Baca data publik bebas pakai kontrak mana aja (kita default Welas Asih)
            const result = await contractWelasAsih.evaluateTransaction('ReadRekamMedis', idPasien);
            res.status(200).json({ status: 'success', data: JSON.parse(result.toString()) });
        } catch (error) {
            res.status(404).json({ status: 'error', message: `Data pasien tidak ditemukan` });
        }
    });

    // 3.5. Endpoint GET ALL REKAM MEDIS (Rich Query CouchDB)
    app.get('/api/rekam-medis', async (req, res) => {
        try {
            console.log("Menarik semua data pasien menggunakan Rich Query...");
            // Kita bisa pakai KTP Welas Asih sebagai pembaca default untuk data publik
            const result = await contractWelasAsih.evaluateTransaction('GetAllRekamMedis');
            
            // Konversi dari byte Fabric ke JSON
            const data = JSON.parse(result.toString() || '[]');
            res.status(200).json({ status: 'success', data: data });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    // 4. Endpoint RUJUK PASIEN (Transfer Asset)
    app.put('/api/rekam-medis/rujuk', async (req, res) => {
        try {
            const { idPasien, rsTujuan } = req.body;
            console.log(`Memproses rujukan pasien ${idPasien} ke ${rsTujuan}...`);
            
            await contractWelasAsih.submitTransaction('RujukPasien', idPasien, rsTujuan);
            res.status(200).json({ status: 'success', message: `Pasien ${idPasien} berhasil dirujuk ke ${rsTujuan}` });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    // 5. Endpoint RIWAYAT PASIEN (Audit Trail / History)
    app.get('/api/rekam-medis/history/:id', async (req, res) => {
        try {
            const idPasien = req.params.id;
            const result = await contractWelasAsih.evaluateTransaction('GetRiwayatPasien', idPasien);
            res.status(200).json({ status: 'success', data: JSON.parse(result.toString()) });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    // 6. Endpoint CREATE TAGIHAN PRIVATE (Dinamis 2 RS)
    app.post('/api/tagihan', async (req, res) => {
        try {
            const { idPasien, totalTagihan, detailObat, namaRS } = req.body;
            
            let collectionName = '';
            let activeContract; // Variabel penentu KTP mana yang dipakai

            // Otomatis ganti KTP dan brankas berdasarkan nama RS
            if (namaRS === 'RS Muhammadiyah') {
                collectionName = 'CollectionTagihanMuhammadiyah';
                activeContract = contractMuhammadiyah; // Switch ke KTP Muhammadiyah
            } else {
                collectionName = 'CollectionTagihanWelasAsih';
                activeContract = contractWelasAsih; // Switch ke KTP Welas Asih
            }

            const tagihanData = { idPasien, totalTagihan, detailObat };
            const transientData = {
                "tagihan_data": Buffer.from(JSON.stringify(tagihanData))
            };

            console.log(`Menyimpan tagihan rahasia untuk ${idPasien} ke brankas ${namaRS}...`);
            
            // Pakai kontrak yang lagi aktif (activeContract)
            const transaction = activeContract.createTransaction('CreateTagihanPrivate');
            transaction.setTransient(transientData);
            
            await transaction.submit(collectionName);
            
            res.status(200).json({ status: 'success', message: `Tagihan rahasia berhasil dimasukkan oleh ${namaRS} ke brankas ${collectionName}!` });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    // 7. Endpoint READ TAGIHAN PRIVATE (Dinamis)
    app.get('/api/tagihan/:id', async (req, res) => {
        try {
            const idPasien = req.params.id;
            const namaRS = req.query.rs || 'RS Welas Asih'; 
            
            let collectionName = '';
            let activeContract;

            if (namaRS === 'RS Muhammadiyah') {
                collectionName = 'CollectionTagihanMuhammadiyah';
                activeContract = contractMuhammadiyah;
            } else {
                collectionName = 'CollectionTagihanWelasAsih';
                activeContract = contractWelasAsih;
            }

            // Baca brankas pakai KTP yang sesuai
            const result = await activeContract.evaluateTransaction('ReadTagihanPrivate', collectionName, idPasien);
            
            res.status(200).json({ status: 'success', data: JSON.parse(result.toString()) });
        } catch (error) {
            res.status(403).json({ status: 'error', message: `Akses ditolak atau tagihan tidak ditemukan di brankas ${namaRS}.` });
        }
    });

    app.listen(PORT, () => {
        console.log(`🚀 REST API berjalan di http://localhost:${PORT}`);
    });
}

startServer();